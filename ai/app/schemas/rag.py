from typing import List, Optional
from pydantic import BaseModel, Field
from uuid import UUID

class RAGUploadResponse(BaseModel):
    vector_index: str
    document_ids: List[str]
    num_chunks: int
    conversation_id: str  # UUID of the draft conversation
    file_id: UUID
    file_name: str
    message: str = "Documents uploaded and indexed successfully."


class RAGDeleteRequest(BaseModel):
    vector_index: str
    document_ids: List[str]


class RAGDeleteResponse(BaseModel):
    vector_index: str
    deleted_ids: List[str]
    message: str = "Documents deleted successfully."


class ConversationRAGUpdate(BaseModel):
    vector_index: str
    document_ids: List[str]

class AttachedFile(BaseModel):
    file_id: UUID
    file_name: str
    document_ids: Optional[List[str]] = None