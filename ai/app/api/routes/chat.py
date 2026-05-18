import json
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.rag.dependencies import get_rag
from app.schemas.chat import ChatRequest, ChatResponse
from app.core.llm import LLMService
from app.core.chat_history import ChatHistoryService
from app.core.message_utils import (
    extract_last_user_message,
    prepare_messages_for_llm,
)
from app.core.exceptions import (
    ERROR_MESSAGES,
    ConversationNotFoundError,
    RAGRetrievalError,
    LLMGenerationError,
)

# Chat history sub‑router
from app.api.routes import chat_history

router = APIRouter(prefix="/chat", tags=["Chat Bot"])


def _retrieve_context(
    conversation_id: Optional[UUID],
    vector_index: Optional[str],
    query: str,
    k: int,
    db: Session
):
    """
    Retrieve RAG context for a query.
    
    If conversation_id is provided, loads the conversation to find its vector_index.
    If vector_index is provided directly, uses it.
    If neither, returns None (no RAG context).
    
    Args:
        conversation_id: Optional conversation UUID to look up vector_index from
        vector_index: Optional vector_index to use directly
        query: Query text for similarity search
        k: Number of documents to retrieve
        db: Database session
        
    Returns:
        List of Document objects, or None if no vector_index available
        
    Raises:
        ConversationNotFoundError: If conversation_id provided but not found in DB
    """
    # If conversation_id is provided, load conversation and use its vector_index
    if conversation_id:
        conversation = ChatHistoryService.get_conversation(db, conversation_id)
        if not conversation:
            raise ConversationNotFoundError(str(conversation_id))
        vector_index = conversation.vector_index
    
    # If no vector_index (either from conversation or direct parameter), return None
    if not vector_index:
        return None
    
    rag = get_rag()
    rag.init_db(collection_name=vector_index)
    return rag.similarity_search(query, k=k)


@router.post("/stream")
async def stream_chat_response(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Stream a chat response from the LLM.
    
    Supports RAG context injection if conversation_id is provided.
    Yields Server-Sent Events (SSE) with tokens and reasoning content.
    """
    if not request.messages:
        raise HTTPException(
            status_code=400,
            detail=ERROR_MESSAGES["EMPTY_MESSAGES"]
        )

    # Extract the last user message for RAG context retrieval
    last_user_msg = extract_last_user_message(request.messages)

    try:
        rag_context = _retrieve_context(
            conversation_id=request.conversation_id,
            vector_index=None,
            query=last_user_msg,
            k=request.k,
            db=db
        )
    except ConversationNotFoundError as e:
        raise e.to_http_exception()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG retrieval failed: {e}")

    # Prepare messages with system prompts
    messages_for_llm = prepare_messages_for_llm(
        messages=request.messages,
        include_structured_output=True,
        include_rag_context=bool(rag_context),
    )

    async def event_generator():
        try:
            async for chunk in LLMService.stream(
                messages=messages_for_llm,
                model_name=request.model_name,
                rag_context=rag_context,
                **request.kwargs,
            ):
                if chunk.content:
                    yield f"data: {json.dumps({'token': chunk.content})}\n\n"

                reasoning = LLMService._extract_reasoning(chunk)
                if reasoning:
                    yield f"data: {json.dumps({'reasoning': reasoning})}\n\n"

            yield "data: [DONE]\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/response", response_model=ChatResponse)
async def get_chat_response(
    request: ChatRequest,
    db: Session = Depends(get_db)
):
    """
    Get a non-streaming chat response from the LLM.
    
    Supports RAG context injection if conversation_id is provided.
    Returns structured response with content, model name, usage, and reasoning.
    """
    if not request.messages:
        raise HTTPException(
            status_code=400,
            detail=ERROR_MESSAGES["EMPTY_MESSAGES"]
        )

    # Extract the last user message for RAG context retrieval
    last_user_msg = extract_last_user_message(request.messages)

    try:
        rag_context = _retrieve_context(
            conversation_id=request.conversation_id,
            vector_index=None,
            query=last_user_msg,
            k=request.k,
            db=db
        )
    except ConversationNotFoundError as e:
        raise e.to_http_exception()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG retrieval failed: {e}")

    # Prepare messages with system prompts
    messages_for_llm = prepare_messages_for_llm(
        messages=request.messages,
        include_structured_output=True,
        include_rag_context=bool(rag_context),
    )
    
    try:
        ai_message = await LLMService.generate(
            messages=messages_for_llm,
            model_name=request.model_name,
            rag_context=rag_context,
            **request.kwargs,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {e}")

    # Extract usage information if available
    usage = None
    if ai_message.usage_metadata:
        usage = {
            "input_tokens": ai_message.usage_metadata.get("input_tokens"),
            "output_tokens": ai_message.usage_metadata.get("output_tokens"),
            "total_tokens": ai_message.usage_metadata.get("total_tokens"),
        }

    return ChatResponse(
        content=ai_message.content,
        model_name=request.model_name,
        usage=usage,
        reasoning_content=LLMService._extract_reasoning(ai_message),
    )


# Include chat history sub‑router
router.include_router(chat_history.router)
