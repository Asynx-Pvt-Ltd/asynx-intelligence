from langchain_openai import ChatOpenAI
from langchain_core.documents import Document
from typing import Any, AsyncIterator, Dict, List, Optional
from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage


def _to_langchain_messages(
    messages: List[Dict[str, str]],
    rag_context: Optional[List[Document]] = None,
) -> List[BaseMessage]:
    role_map = {
        "system": SystemMessage,
        "user": HumanMessage,
        "assistant": AIMessage,
    }

    lc_messages: List[BaseMessage] = []

    if rag_context:
        context_str = "\n\n---\n\n".join(doc.page_content for doc in rag_context)
        lc_messages.append(
            SystemMessage(
                content=(
                    "Use the following context to answer the user's question. "
                    "If the context is not relevant, say so and answer based on your own knowledge.\n\n"
                    f"Context:\n{context_str}"
                )
            )
        )

    for msg in messages:
        cls = role_map.get(msg["role"])
        if cls is None:
            raise ValueError(f"Unknown message role: {msg['role']}")
        lc_messages.append(cls(content=msg["content"]))

    return lc_messages


class LLMService:

    @staticmethod
    def _build_llm(model_name: str, streaming: bool = False, **kwargs: Any) -> ChatOpenAI:
        from app.core.config import settings

        return ChatOpenAI(model=model_name, streaming=streaming, api_key=settings.OPENAI_API_KEY, **kwargs)

    @staticmethod
    async def generate(
        messages: List[Dict[str, str]],
        model_name: str = "gpt-5-mini",
        rag_context: Optional[List[Document]] = None,
        **kwargs: Any,
    ) -> AIMessage:
        llm = LLMService._build_llm(model_name, streaming=False, **kwargs)
        lc_messages = _to_langchain_messages(messages, rag_context)
        return await llm.ainvoke(lc_messages)

    @staticmethod
    async def stream(
        messages: List[Dict[str, str]],
        model_name: str = "gpt-5-mini",
        rag_context: Optional[List[Document]] = None,
        **kwargs: Any,
    ) -> AsyncIterator[str]:
        llm = LLMService._build_llm(model_name, streaming=True, **kwargs)
        lc_messages = _to_langchain_messages(messages, rag_context)
        async for chunk in llm.astream(lc_messages):
            if chunk.content:
                yield chunk.content