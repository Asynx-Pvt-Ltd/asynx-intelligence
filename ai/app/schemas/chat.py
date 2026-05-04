from pydantic import BaseModel, Field
from typing import Any, Dict, List, Literal, Optional
from uuid import UUID
from datetime import datetime


class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    messages: List[Message]
    model_name: str = "gpt-5-mini"
    vector_index: Optional[str] = Field(
        default=None,
        description="If provided, retrieves RAG context from this collection before generating.",
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
    title:str
    user_id: str
    org_id: str


class ConversationCreate(ConversationBase):
    pass


class ConversationUpdate(BaseModel):
    title: Optional[str] = None


class Conversation(ConversationBase):
    id: UUID
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
