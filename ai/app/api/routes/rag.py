import os
import tempfile
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile

from app.core.rag.dependencies import get_rag
from app.core.rag.chunker import chunk_document
from app.core.rag.document_parser import DocumentParser, DocumentParserError
from app.schemas.rag import RAGDeleteRequest, RAGDeleteResponse, RAGUploadResponse

router = APIRouter(prefix="/rag", tags=["RAG"])


@router.post("/upload", response_model=RAGUploadResponse)
async def upload_document(
    file: UploadFile = File(..., description="PDF file to upload."),
    vector_index: str = Form(..., description="Collection name / vector index to store documents in."),
    chunk_size: int = Form(default=1000, ge=100, description="Chunk size in characters."),
    chunk_overlap: int = Form(default=200, ge=0, description="Overlap between chunks."),
):
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    tmp_path: Optional[str] = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        parser = DocumentParser()
        raw_corpus, fmt, images = parser.parse(tmp_path)

        chunks = chunk_document(
            text=raw_corpus,
            metadata={"source": file.filename, "vector_index": vector_index},
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
        )

        if not chunks:
            raise HTTPException(status_code=400, detail="No content extracted from the PDF.")

        rag = get_rag()
        rag.init_db(collection_name=vector_index)
        doc_ids = rag.add_documents(chunks)

        return RAGUploadResponse(
            vector_index=vector_index,
            document_ids=doc_ids,
            num_chunks=len(chunks),
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
async def delete_documents(request: RAGDeleteRequest):
    if not request.document_ids:
        raise HTTPException(status_code=400, detail="document_ids cannot be empty.")

    try:
        rag = get_rag()
        rag.init_db(collection_name=request.vector_index)
        rag.delete(request.document_ids)

        return RAGDeleteResponse(
            vector_index=request.vector_index,
            deleted_ids=request.document_ids,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Delete failed: {e}")