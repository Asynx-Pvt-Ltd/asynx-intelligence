import json
from typing import Optional
from uuid import UUID
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.rag.dependencies import get_rag
from app.schemas.chat import ChatRequest, ChatResponse
from app.core.llm import LLMService, _extract_reasoning
from app.core.chat_history import ChatHistoryService

from app.constants.prompt_templates import STRUCTURED_OUTPUT_SYSTEM_PROMPT

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
    # If conversation_id is provided, load conversation and use its vector_index
    if conversation_id:
        conversation = ChatHistoryService.get_conversation(db, conversation_id)
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
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
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty.")

    last_user_msg = next(
        (m.content for m in reversed(request.messages) if m.role == "user"), ""
    )

    try:
        rag_context = _retrieve_context(
            conversation_id=request.conversation_id,
            vector_index=None,  # Will be loaded from conversation if conversation_id provided
            query=last_user_msg,
            k=request.k,
            db=db
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG retrieval failed: {e}")

    messages_dicts = [m.model_dump() for m in request.messages]

    structured_system = {
       "role": "system",
       "content": STRUCTURED_OUTPUT_SYSTEM_PROMPT.strip(),
    }
    
    messages_with_structure = [structured_system] + messages_dicts

    async def event_generator():
        try:
            async for chunk in LLMService.stream(
                messages=messages_with_structure,
                model_name=request.model_name,
                rag_context=rag_context,
                **request.kwargs,
            ):
                if chunk.content:
                    yield f"data: {json.dumps({'token': chunk.content})}\n\n"

                reasoning = _extract_reasoning(chunk)
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
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty.")

    last_user_msg = next(
        (m.content for m in reversed(request.messages) if m.role == "user"), ""
    )

    try:
        rag_context = _retrieve_context(
            conversation_id=request.conversation_id,
            vector_index=None,  # Will be loaded from conversation if conversation_id provided
            query=last_user_msg,
            k=request.k,
            db=db
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG retrieval failed: {e}")

    messages_dicts = [m.model_dump() for m in request.messages]
    
    structured_system = {
       "role": "system",
       "content": STRUCTURED_OUTPUT_SYSTEM_PROMPT.strip(),
    }
    
    messages_with_structure = [structured_system] + messages_dicts
    
    try:
        ai_message = await LLMService.generate(
            messages=messages_with_structure,
            model_name=request.model_name,
            rag_context=rag_context,
            **request.kwargs,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"LLM generation failed: {e}")

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
        reasoning_content=_extract_reasoning(ai_message),
    )


# Include chat history sub‑router
router.include_router(chat_history.router)
