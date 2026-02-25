from pydantic import BaseModel, Field
from typing import Any, Dict, List, Literal, Optional


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
    k: int = Field(default=10, ge=1, description="Number of documents to retrieve for RAG.")
    kwargs: Dict[str, Any] = Field(
        default_factory=dict,
        description="Additional kwargs passed to the LLM (temperature, max_tokens, etc.).",
    )


class ChatResponse(BaseModel):
    content: str
    model_name: str
    usage: Optional[Dict[str, Any]] = None