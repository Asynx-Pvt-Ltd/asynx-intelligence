import os
import tempfile
from typing import Literal, Optional
from uuid import UUID,uuid4
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.rag.dependencies import get_rag
from app.core.rag.chunker import chunk_document
from app.core.rag.parsers import create_parser
from app.core.rag.parsers.base import DocumentParserError
from app.schemas.rag import RAGDeleteRequest, RAGDeleteResponse, RAGUploadResponse
from app.schemas.chat import ConversationCreate
from app.core.chat_history import ChatHistoryService

router = APIRouter(prefix="/rag", tags=["RAG"])


@router.post("/upload", response_model=RAGUploadResponse)
async def upload_document(
    file: UploadFile = File(..., description="PDF file to upload."),
    user_id: str = Form(
        ..., description="User id is required."
    ),
    org_id: str = Form(
        ..., description="Org id is required."
    ),
    chunk_size: int = Form(
        default=1000, ge=100, description="Chunk size in characters."
    ),
    chunk_overlap: int = Form(default=200, ge=0, description="Overlap between chunks."),
    parser_strategy: Literal["quality", "speed"] = Form(
        default="speed",
        description="Parser strategy: 'quality' (marker-pdf) or 'speed' (llama-parse).",
    ),
    db: Session = Depends(get_db),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    
    # Create a draft conversation
    conversation_data = ConversationCreate(
        title="Draft conversation",
        user_id=user_id,
        org_id=org_id,
        is_draft=True,
        vector_index=None,
        document_ids=[]
    )
    
    conversation = ChatHistoryService.create_conversation(db, conversation_data)
    
    # Generate new vector index with conversation ID
    new_vector_index = f"org_{org_id}_conv_{conversation.id}"
    
    tmp_path: Optional[str] = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        parser = create_parser(strategy=parser_strategy)
        raw_corpus, fmt, images = parser.parse(tmp_path)

        chunks = chunk_document(
            text=raw_corpus,
            metadata={"source": file.filename, "vector_index": new_vector_index},
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        if not chunks:
            raise HTTPException(
                status_code=400, detail="No content extracted from the PDF."
            )

        rag = get_rag()
        rag.init_db(collection_name=new_vector_index)
        doc_ids = rag.add_documents(chunks)
        
        # Update conversation with RAG metadata
        ChatHistoryService.update_conversation_rag(
            db,
            conversation.id,
            vector_index=new_vector_index,
            document_ids=doc_ids
        )

        return RAGUploadResponse(
            vector_index=new_vector_index,
            document_ids=doc_ids,
            num_chunks=len(chunks),
            conversation_id=str(conversation.id),
            file_id=uuid4(),
            file_name=file.filename,
        )

    except DocumentParserError as e:
        raise HTTPException(status_code=422, detail=f"Document parsing failed: {e}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)


@router.delete("/delete", response_model=RAGDeleteResponse)
async def delete_documents(
    request: RAGDeleteRequest,
    db: Session = Depends(get_db)
):
    if not request.document_ids:
        raise HTTPException(status_code=400, detail="document_ids cannot be empty.")

    try:
        # Parse conversation_id from vector_index (format: org_{orgId}_conv_{conversationId})
        conversation_id = None
        if request.vector_index.startswith("org_") and "_conv_" in request.vector_index:
            try:
                # Extract the part after "_conv_"
                conv_part = request.vector_index.split("_conv_")[1]
                conversation_id = UUID(conv_part)
            except (ValueError, IndexError):
                pass  # Not a conversation-based vector index
        
        # Delete documents from vector store
        rag = get_rag()
        rag.init_db(collection_name=request.vector_index)
        rag.delete(request.document_ids)
        
        # If this is a conversation-based vector index, update the conversation
        if conversation_id:
            # Get the conversation
            conversation = ChatHistoryService.get_conversation(db, conversation_id)
            if conversation:
                # Remove deleted document_ids from conversation's document_ids
                current_doc_ids = conversation.document_ids or []
                updated_doc_ids = [doc_id for doc_id in current_doc_ids if doc_id not in request.document_ids]
                
                # Update conversation with new document_ids
                ChatHistoryService.update_conversation_rag(
                    db,
                    conversation_id,
                    vector_index=conversation.vector_index,
                    document_ids=updated_doc_ids
                )
                
                # Check if conversation is empty draft and should be cleaned up
                if (conversation.is_draft and
                    not updated_doc_ids and
                    conversation.vector_index == request.vector_index):
                    # Delete the conversation
                    ChatHistoryService.delete_conversation(db, conversation_id)
                    # Optionally delete the vector index collection
                    # rag.delete_collection(collection_name=request.vector_index)

        return RAGDeleteResponse(
            vector_index=request.vector_index,
            deleted_ids=request.document_ids,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {e}")
