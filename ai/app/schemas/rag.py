from typing import List, Optional
from pydantic import BaseModel, Field


class RAGUploadResponse(BaseModel):
    vector_index: str
    document_ids: List[str]
    num_chunks: int
    message: str = "Documents uploaded and indexed successfully."


class RAGDeleteRequest(BaseModel):
    vector_index: str
    document_ids: List[str]


class RAGDeleteResponse(BaseModel):
    vector_index: str
    deleted_ids: List[str]
    message: str = "Documents deleted successfully."