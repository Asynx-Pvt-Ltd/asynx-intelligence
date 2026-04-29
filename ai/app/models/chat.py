import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.core.db import Base


class Conversation(Base):
    """
    Represents a chat conversation.
    """
    __tablename__ = "chat_conversations"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=True)
    user_id = Column(String(255), nullable=True, index=True)  # placeholder for future auth
    org_id = Column(String(255), nullable=True, index=True)   # placeholder for future orgs
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    messages = relationship("ConversationMessage", back_populates="conversation", cascade="all, delete-orphan")


class ConversationMessage(Base):
    """
    Represents a single message within a conversation.
    """
    __tablename__ = "chat_conversation_messages"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    conversation_id = Column(UUID(as_uuid=True), ForeignKey("chat_conversations.id", ondelete="CASCADE"), nullable=False, index=True)
    role = Column(String(50), nullable=False)  # "system", "user", "assistant"
    content = Column(Text, nullable=False)
    model_name = Column(String(255), nullable=True)
    reasoning_content = Column(Text, nullable=True)
    usage = Column(JSON, nullable=True)  # stores token usage as JSONB
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")