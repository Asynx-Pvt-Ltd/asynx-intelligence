import json
from typing import Optional
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.core.rag.dependencies import get_rag
from app.schemas.chat import ChatRequest, ChatResponse
from app.core.llm import LLMService, _extract_reasoning

router = APIRouter(prefix="/chat", tags=["Chat Bot"])


def _retrieve_context(vector_index: Optional[str], query: str, k: int):
    if not vector_index:
        return None
    rag = get_rag()
    rag.init_db(collection_name=vector_index)
    return rag.similarity_search(query, k=k)


@router.post("/stream")
async def stream_chat_response(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty.")

    last_user_msg = next(
        (m.content for m in reversed(request.messages) if m.role == "user"), ""
    )

    try:
        rag_context = _retrieve_context(request.vector_index, last_user_msg, request.k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG retrieval failed: {e}")

    messages_dicts = [m.model_dump() for m in request.messages]

    async def event_generator():
        try:
            async for chunk in LLMService.stream(
                messages=messages_dicts,
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
async def get_chat_response(request: ChatRequest):
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages list cannot be empty.")

    last_user_msg = next(
        (m.content for m in reversed(request.messages) if m.role == "user"), ""
    )

    try:
        rag_context = _retrieve_context(request.vector_index, last_user_msg, request.k)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"RAG retrieval failed: {e}")

    messages_dicts = [m.model_dump() for m in request.messages]

    try:
        ai_message = await LLMService.generate(
            messages=messages_dicts,
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
