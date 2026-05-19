from pydantic import BaseModel, Field
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID
from datetime import datetime
from app.schemas.rag import AttachedFile

class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str
    attached_files: Optional[List[AttachedFile]] = None


class ChatRequest(BaseModel):
    messages: List[Message]
    model_name: str = "gpt-5-mini"
    conversation_id: Optional[UUID] = Field(
        default=None,
        description="If provided, retrieves RAG context from conversation's vector_index.",
    )
    k: int = Field(
        default=10, ge=0, description="Number of documents to retrieve for RAG."
    )
    kwargs: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional kwargs passed to the LLM (temperature, max_tokens, reasoning_effort, etc.).",
    )


class ChatResponse(BaseModel):
    content: str
    model_name: str
    usage: Optional[Dict[str, Any]] = None
    reasoning_content: Optional[str] = None


# ========== Chat History Schemas ==========

class ConversationBase(BaseModel):
    title: str
    user_id: str
    org_id: str


class ConversationCreate(ConversationBase):
    is_draft: bool = True


class ConversationUpdate(BaseModel):
    title: Optional[str] = None
    vector_index: Optional[str] = None
    document_ids: Optional[List[str]] = None
    is_draft: Optional[bool] = None
    model_name: Optional[str] = None


class Conversation(ConversationBase):
    id: UUID
    vector_index: Optional[str] = None
    is_draft: bool = True
    model_name:Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ConversationMessageBase(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str
    model_name: Optional[str] = None
    reasoning_content: Optional[str] = None
    usage: Optional[Dict[str, Any]] = None
    attached_files: Optional[List[AttachedFile]] = None


class ConversationMessageCreate(ConversationMessageBase):
    conversation_id: UUID


class ConversationMessage(ConversationMessageBase):
    id: UUID
    conversation_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationWithMessages(Conversation):
    messages: List[ConversationMessage] = []


class DeleteAttachedFileRequest(BaseModel):
    message_id: UUID
    file_id: str