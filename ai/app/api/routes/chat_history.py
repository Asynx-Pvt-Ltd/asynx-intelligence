import logging
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.chat_history import ChatHistoryService
from app.schemas.chat import (
    Conversation,
    ConversationCreate,
    ConversationUpdate,
    ConversationWithMessages,
    ConversationMessage,
    ConversationMessageCreate,
)
from app.schemas.rag import ConversationRAGUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/history", tags=["Chat History"])


@router.post("", response_model=Conversation)
def create_conversation(
    conversation_in: ConversationCreate,
    db: Session = Depends(get_db),
):
    """
    Create a new conversation.
    """
    try:
        conversation = ChatHistoryService.create_conversation(db, conversation_in)
        return conversation
    except Exception as e:
        logger.error(f"Failed to create conversation: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("", response_model=List[Conversation])
def list_conversations(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    org_id: Optional[str] = Query(None, description="Filter by organization ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """
    List conversations, optionally filtered by user_id and org_id.
    """
    try:
        conversations = ChatHistoryService.list_conversations(
            db, user_id=user_id, org_id=org_id, skip=skip, limit=limit
        )
        return conversations
    except Exception as e:
        logger.error(f"Failed to list conversations: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{conversation_id}", response_model=ConversationWithMessages)
def get_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Retrieve a conversation with its messages.
    """
    conversation = ChatHistoryService.get_conversation_with_messages(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.patch("/{conversation_id}", response_model=Conversation)
def update_conversation(
    conversation_id: UUID,
    conversation_in: ConversationUpdate,
    db: Session = Depends(get_db),
):
    """
    Update conversation metadata (e.g., title).
    """
    conversation = ChatHistoryService.update_conversation(db, conversation_id, conversation_in)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.patch("/{conversation_id}/rag", response_model=Conversation)
def update_conversation_rag(
    conversation_id: UUID,
    rag_update: ConversationRAGUpdate,
    db: Session = Depends(get_db),
):
    """
    Update RAG metadata (vector_index and document_ids) for a conversation.
    """
    conversation = ChatHistoryService.update_conversation_rag(
        db, conversation_id, rag_update.vector_index
    )
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation


@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: UUID,
    db: Session = Depends(get_db),
):
    """
    Delete a conversation and all its messages.
    """
    deleted = ChatHistoryService.delete_conversation(db, conversation_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"detail": "Conversation deleted"}


@router.post("/{conversation_id}/messages", response_model=ConversationMessage)
def add_message(
    conversation_id: UUID,
    message_in: ConversationMessageCreate,
    db: Session = Depends(get_db),
):
    """
    Add a message to a conversation.
    """
    # Ensure the conversation_id in path matches the body (or override)
    if message_in.conversation_id != conversation_id:
        raise HTTPException(
            status_code=400,
            detail="Conversation ID in path does not match body",
        )
    try:
        message = ChatHistoryService.add_message(db, message_in)
        return message
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Failed to add message: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


@router.get("/{conversation_id}/messages", response_model=List[ConversationMessage])
def get_messages(
    conversation_id: UUID,
    skip: int = Query(0, ge=0),
    limit: int = Query(500, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    """
    Retrieve messages for a conversation.
    """
    conversation = ChatHistoryService.get_conversation(db, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    messages = ChatHistoryService.get_messages(db, conversation_id, skip=skip, limit=limit)
    return messages