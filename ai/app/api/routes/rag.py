import os
import tempfile
from typing import Literal, Optional
from uuid import UUID, uuid4
from fastapi import APIRouter, File, Form, HTTPException, UploadFile, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.rag.dependencies import get_rag
from app.core.rag.chunker import chunk_document
from app.core.rag.parsers import create_parser
from app.core.rag.parsers.base import DocumentParserError
from app.core.rag.vector_index_utils import (
    build_vector_index_name,
    parse_conversation_id_from_vector_index,
)
from app.schemas.rag import RAGDeleteRequest, RAGDeleteResponse, RAGUploadResponse
from app.core.chat_history import ChatHistoryService
from app.core.exceptions import (
    ERROR_MESSAGES,
    DocumentParsingError,
    DocumentUploadError,
    UnauthorizedAccessError,
    ConversationNotFoundError,
    InvalidInputError,
)
from app.models.chat import ConversationMessage

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
    conversation_id: str = Form(
        ..., description="Conversation ID to associate with this upload."
    ),
    chunk_size: int = Form(
        default=500, ge=100, description="Chunk size in characters."
    ),
    chunk_overlap: int = Form(default=50, ge=0, description="Overlap between chunks."),
    parser_strategy: Literal["quality", "speed"] = Form(
        default="speed",
        description="Parser strategy: 'quality' (marker-pdf) or 'speed' (pypdf).",
    ),
    db: Session = Depends(get_db),
):
    """
    Upload a PDF document and add it to a conversation's RAG vector store.
    
    The document is chunked and stored in a vector index named after the conversation.
    Updates the conversation with RAG metadata.
    """
    # Validate PDF file
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise InvalidInputError(ERROR_MESSAGES["INVALID_PDF"]).to_http_exception()

    
    # Use existing conversation or create a new draft conversation
    conversation = None
    if conversation_id:
        try:
            conv_uuid = UUID(conversation_id)
            conversation = ChatHistoryService.get_conversation(db, conv_uuid)
            if not conversation:
                raise ConversationNotFoundError(conversation_id).to_http_exception()
            # Ensure the conversation belongs to the same user and org
            if conversation.user_id != user_id or conversation.org_id != org_id:
                raise UnauthorizedAccessError("Conversation").to_http_exception()
        except ValueError:
            raise InvalidInputError(ERROR_MESSAGES["INVALID_CONVERSATION_ID"]).to_http_exception()

    # Generate vector index name for this conversation
    new_vector_index = build_vector_index_name(org_id, conversation.id)
    
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
            raise InvalidInputError(
                ERROR_MESSAGES["EMPTY_DOCUMENT"]
            ).to_http_exception()

        rag = get_rag()
        rag.init_db(collection_name=new_vector_index)
        doc_ids = rag.add_documents(chunks)
        
        # Update conversation with RAG metadata
        ChatHistoryService.update_conversation_rag(
            db,
            conversation.id,
            vector_index=new_vector_index,
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
        raise DocumentParsingError(str(e), original_error=e).to_http_exception()
    except HTTPException:
        raise
    except Exception as e:
        raise DocumentUploadError(str(e), original_error=e).to_http_exception()
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)



@router.delete("/delete", response_model=RAGDeleteResponse)
async def delete_documents(
    request: RAGDeleteRequest,
    db: Session = Depends(get_db)
):
    """
    Delete documents from a RAG vector store.
    
    If the vector index is conversation-based and the conversation is now empty,
    may clean up the conversation.
    """
    if not request.document_ids:
        raise InvalidInputError(
            ERROR_MESSAGES["EMPTY_DOCUMENT_IDS"]
        ).to_http_exception()

    try:
        # Try to parse conversation ID from vector index
        conversation_id = parse_conversation_id_from_vector_index(request.vector_index)
        
        # Delete documents from vector store
        rag = get_rag()
        rag.init_db(collection_name=request.vector_index)
        rag.delete(request.document_ids)
        
        # If this is a conversation-based vector index, update the conversation
        if conversation_id:
            # Get the conversation
            conversation = ChatHistoryService.get_conversation(db, conversation_id)
            if conversation:
                # Check if conversation is empty draft and should be cleaned up
                # Since we no longer track document_ids, we check if there are any messages
                # If the conversation has no messages, it's safe to delete.
                message_count = db.query(ConversationMessage).filter(
                    ConversationMessage.conversation_id == conversation_id
                ).count()
                if (conversation.is_draft and
                    message_count == 0 and
                    conversation.vector_index == request.vector_index):
                    # Delete the conversation
                    ChatHistoryService.delete_conversation(db, conversation_id)

        return RAGDeleteResponse(
            vector_index=request.vector_index,
            deleted_ids=request.document_ids,
        )
    except HTTPException:
        raise
    except Exception as e:
        raise DocumentUploadError(
            f"Delete failed: {str(e)}", original_error=e
        ).to_http_exception()

