import logging
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.schemas.rag import AttachedFile
from app.models.chat import Conversation, ConversationMessage
from app.schemas.chat import ConversationCreate, ConversationUpdate, ConversationMessageCreate

logger = logging.getLogger(__name__)


class ChatHistoryService:
    """
    Service for managing chat history (conversations and messages).
    """

    @staticmethod
    def create_conversation(
        db: Session,
        conversation_in: ConversationCreate,
    ) -> Conversation:
        """
        Create a new conversation.
        """
        db_conversation = Conversation(
            title=conversation_in.title,
            user_id=conversation_in.user_id,
            org_id=conversation_in.org_id,
        )
        db.add(db_conversation)
        db.commit()
        db.refresh(db_conversation)
        logger.debug(f"Created conversation {db_conversation.id}")
        return db_conversation

    @staticmethod
    def get_conversation(
        db: Session,
        conversation_id: UUID,
    ) -> Optional[Conversation]:
        """
        Retrieve a conversation by ID.
        """
        return db.query(Conversation).filter(Conversation.id == conversation_id).first()

    @staticmethod
    def list_conversations(
        db: Session,
        user_id: Optional[str] = None,
        org_id: Optional[str] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> List[Conversation]:
        """
        List conversations, optionally filtered by user_id and org_id.
        Ordered by updated_at descending (most recent first).
        """
        query = db.query(Conversation)
        if user_id is not None:
            query = query.filter(Conversation.user_id == user_id)
        if org_id is not None:
            query = query.filter(Conversation.org_id == org_id)
        return query.order_by(desc(Conversation.updated_at)).offset(skip).limit(limit).all()

    @staticmethod
    def update_conversation(
        db: Session,
        conversation_id: UUID,
        conversation_in: ConversationUpdate,
    ) -> Optional[Conversation]:
        """
        Update conversation fields (e.g., title). document_ids updates are ignored.
        """
        db_conversation = ChatHistoryService.get_conversation(db, conversation_id)
        if not db_conversation:
            return None
        update_data = conversation_in.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_conversation, field, value)
        db.add(db_conversation)
        db.commit()
        db.refresh(db_conversation)
        return db_conversation

    @staticmethod
    def delete_conversation(
        db: Session,
        conversation_id: UUID,
    ) -> bool:
        """
        Delete a conversation and all its messages (cascade).
        Returns True if a conversation was deleted, False if not found.
        """
        db_conversation = ChatHistoryService.get_conversation(db, conversation_id)
        if not db_conversation:
            return False
        db.delete(db_conversation)
        db.commit()
        return True

    @staticmethod
    def add_message(
        db: Session,
        message_in: ConversationMessageCreate,
    ) -> ConversationMessage:
        """
        Add a message to an existing conversation.
        """
        # Ensure conversation exists
        conversation = ChatHistoryService.get_conversation(db, message_in.conversation_id)
        if not conversation:
            raise ValueError(f"Conversation {message_in.conversation_id} not found")

        # Convert attached_files to JSON-serializable format (UUIDs to strings)
        attached_files_json = None
        if message_in.attached_files:
            attached_files_json = []
            for f in message_in.attached_files:
                file_dict = f.model_dump()
                # Convert UUID to string for JSON serialization
                if 'file_id' in file_dict and file_dict['file_id']:
                    file_dict['file_id'] = str(file_dict['file_id'])
                attached_files_json.append(file_dict)
        
        db_message = ConversationMessage(
            conversation_id=message_in.conversation_id,
            role=message_in.role,
            content=message_in.content,
            attached_files=attached_files_json,
            model_name=message_in.model_name,
            reasoning_content=message_in.reasoning_content,
            usage=message_in.usage,
        )
        db.add(db_message)
        db.commit()
        db.refresh(db_message)
        logger.debug(f"Added message {db_message.id} to conversation {message_in.conversation_id}")
        return db_message

    @staticmethod
    def get_messages(
        db: Session,
        conversation_id: UUID,
        skip: int = 0,
        limit: int = 500,
    ) -> List[ConversationMessage]:
        """
        Retrieve messages for a conversation, ordered by created_at ascending.
        """
        return (
            db.query(ConversationMessage)
            .filter(ConversationMessage.conversation_id == conversation_id)
            .order_by(ConversationMessage.created_at)
            .offset(skip)
            .limit(limit)
            .all()
        )

    @staticmethod
    def update_message_attached_files(
        db: Session,
        message_id: UUID,
        attached_files: List[AttachedFile],
    ) -> ConversationMessage | None:
        db_msg = db.query(ConversationMessage).filter_by(id=message_id).first()
        if not db_msg:
            return None

        db_msg.attached_files = attached_files
        db.add(db_msg)
        db.commit()
        db.refresh(db_msg)
        return db_msg

    @staticmethod
    def get_conversation_with_messages(
        db: Session,
        conversation_id: UUID,
    ) -> Optional[Conversation]:
        """
        Retrieve a conversation with its messages eagerly loaded.
        """
        
        conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
        )
        if not conversation:
           return None

        conversation.messages = (
          db.query(ConversationMessage)
          .filter(ConversationMessage.conversation_id == conversation_id)
          .order_by(ConversationMessage.created_at.asc(), ConversationMessage.id.asc())
          .all()
        )

        return conversation

    @staticmethod
    def update_conversation_rag(
        db: Session,
        conversation_id: UUID,
        vector_index: str,
    ) -> Optional[Conversation]:
        """
        Update RAG metadata (vector_index only). document_ids are no longer stored on conversation.
        """
        db_conversation = ChatHistoryService.get_conversation(db, conversation_id)
        if not db_conversation:
            return None
        
        db_conversation.vector_index = vector_index
        # document_ids are not stored on conversation anymore (they are stored per message)
        # Keep the column for backward compatibility but set to empty list
        db_conversation.document_ids = []
        db.add(db_conversation)
        db.commit()
        db.refresh(db_conversation)
        return db_conversation