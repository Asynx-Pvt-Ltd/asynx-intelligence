# from langchain_openai import ChatOpenAI
# from langchain_core.documents import Document
# from typing import Any, AsyncIterator, Dict, List, Optional
# from langchain_core.messages import (
#     AIMessage,
#     AIMessageChunk,
#     BaseMessage,
#     HumanMessage,
#     SystemMessage,
# )


# class LLMService:
#     """
#     Service for interacting with LLM APIs (OpenAI).
#     Handles message formatting, model initialization, and both streaming and non-streaming inference.
#     """

#     @staticmethod
#     def _build_llm(
#         model_name: str, streaming: bool = False, **kwargs: Any
#     ) -> ChatOpenAI:
#         """
#         Initialize a ChatOpenAI instance with the given configuration.
        
#         Args:
#             model_name: Name of the model to use (e.g., "gpt-4", "gpt-5-mini")
#             streaming: Whether to enable streaming mode
#             **kwargs: Additional arguments passed to ChatOpenAI
            
#         Returns:
#             Configured ChatOpenAI instance
#         """
#         from app.core.config import settings
#         return ChatOpenAI(
#             model=model_name,
#             streaming=streaming,
#             api_key=settings.OPENAI_API_KEY,
#             **kwargs,
#         )

#     @staticmethod
#     def _to_langchain_messages(
#         messages: List[Dict[str, str]],
#         rag_context: Optional[List[Document]] = None,
#     ) -> List[BaseMessage]:
#         """
#         Convert message dicts and optional RAG context to LangChain message objects.
        
#         Args:
#             messages: List of message dicts with 'role' and 'content' keys
#             rag_context: Optional list of Document objects from RAG retrieval
            
#         Returns:
#             List of LangChain BaseMessage objects ready for LLM invocation
            
#         NOTE: If rag_context is provided, injects a system message with context.
#         This preserves original behavior of context being prepended to messages.
#         """
#         role_map = {
#             "system": SystemMessage,
#             "user": HumanMessage,
#             "assistant": AIMessage,
#         }

#         lc_messages: List[BaseMessage] = []

#         if rag_context:
#             context_str = "\n\n---\n\n".join(doc.page_content for doc in rag_context)
#             lc_messages.append(
#                 SystemMessage(
#                     content=(
#                         "Use the following context to answer the user's question. "
#                         "If the context is not relevant, say so and answer based on your own knowledge.\n\n"
#                         f"Context:\n{context_str}"
#                     )
#                 )
#             )

#         for msg in messages:
#             cls = role_map.get(msg["role"])
#             if cls is None:
#                 raise ValueError(f"Unknown message role: {msg['role']}")
#             lc_messages.append(cls(content=msg["content"]))

#         return lc_messages

#     @staticmethod
#     def _extract_reasoning(message: AIMessage | AIMessageChunk) -> Optional[str]:
#         """
#         Extract reasoning content from an AI message.
        
#         Tries multiple approaches to find reasoning:
#         1. Check 'reasoning_content' key
#         2. Check 'reasoning' dict key and get 'content' from it
#         3. Check 'reasoning' as a string
        
#         Args:
#             message: AIMessage or AIMessageChunk from LLM
            
#         Returns:
#             Reasoning content if found, None otherwise
            
#         NOTE: Preserves original multi-path fallback behavior to handle
#         different LLM response formats.
#         """
#         reasoning = message.additional_kwargs.get("reasoning_content")
#         if reasoning:
#             return reasoning

#         reasoning = message.additional_kwargs.get("reasoning", {})
#         if isinstance(reasoning, dict):
#             return reasoning.get("content")
#         if isinstance(reasoning, str) and reasoning:
#             return reasoning

#         return None

#     @staticmethod
#     async def generate(
#         messages: List[Dict[str, str]],
#         model_name: str = "gpt-5-mini",
#         rag_context: Optional[List[Document]] = None,
#         **kwargs: Any,
#     ) -> AIMessage:
#         """
#         Generate a single response from the LLM (non-streaming).
        
#         Args:
#             messages: List of message dicts to send to the LLM
#             model_name: Name of the model to use
#             rag_context: Optional RAG context documents to include
#             **kwargs: Additional LLM parameters (temperature, max_tokens, etc.)
            
#         Returns:
#             AIMessage object containing the complete LLM response
#         """
#         llm = LLMService._build_llm(model_name, streaming=False, **kwargs)
#         lc_messages = LLMService._to_langchain_messages(messages, rag_context)
#         return await llm.ainvoke(lc_messages)

#     @staticmethod
#     async def stream(
#         messages: List[Dict[str, str]],
#         model_name: str = "gpt-5-mini",
#         rag_context: Optional[List[Document]] = None,
#         **kwargs: Any,
#     ) -> AsyncIterator[AIMessageChunk]:
#         """
#         Stream a response from the LLM.
        
#         Args:
#             messages: List of message dicts to send to the LLM
#             model_name: Name of the model to use
#             rag_context: Optional RAG context documents to include
#             **kwargs: Additional LLM parameters (temperature, max_tokens, etc.)
            
#         Yields:
#             AIMessageChunk objects as they stream from the LLM
#         """
#         llm = LLMService._build_llm(model_name, streaming=True, **kwargs)
#         lc_messages = LLMService._to_langchain_messages(messages, rag_context)
#         async for chunk in llm.astream(lc_messages):
#             yield chunk


# # Re-export at module level for backward compatibility with existing imports
# def _extract_reasoning(message: AIMessage | AIMessageChunk) -> Optional[str]:
#     """Backward compatibility wrapper. Use LLMService._extract_reasoning() instead."""
#     return LLMService._extract_reasoning(message)


from typing import Any, AsyncIterator, Dict, List, Literal, Optional, Type

from langchain_core.documents import Document
from langchain_core.messages import (
    AIMessage,
    AIMessageChunk,
    BaseMessage,
    HumanMessage,
    SystemMessage,
)
from langchain_openai import ChatOpenAI

try:
    from langchain_anthropic import ChatAnthropic
except ImportError:  # optional dependency
    ChatAnthropic = None  # type: ignore[assignment]

try:
    from langchain_xai import ChatXAI
except ImportError:  # optional dependency
    ChatXAI = None  # type: ignore[assignment]


Provider = Literal["openai", "anthropic", "xai"]


class LLMService:
    """
    Service for interacting with LLM APIs.
    Supports OpenAI, Anthropic, and xAI chat models through LangChain.

    Public API is kept backward-compatible:
    - generate(...)
    - stream(...)
    - _extract_reasoning(...)
    """

    _ROLE_MAP: Dict[str, Type[BaseMessage]] = {
        "system": SystemMessage,
        "user": HumanMessage,
        "assistant": AIMessage,
    }

    @staticmethod
    def _detect_provider(model_name: str) -> Provider:
        """
        Infer the provider from the model name.

        Examples:
        - gpt-5-mini -> openai
        - claude-3-5-sonnet-latest -> anthropic
        - grok-beta -> xai
        """
        normalized = model_name.strip().lower()

        if normalized.startswith(("gpt-", "o1", "o3", "o4")):
            return "openai"
        if normalized.startswith("claude-"):
            return "anthropic"
        if normalized.startswith("grok-"):
            return "xai"

        raise ValueError(
            f"Unable to detect provider from model name: {model_name}"
        )

    @staticmethod
    def _get_api_key(provider: Provider) -> str:
        """
        Return the provider-specific API key from settings.

        Raises:
            ValueError: If the provider key is missing.
        """
        from app.core.config import settings

        key_map: Dict[Provider, Optional[str]] = {
            "openai": getattr(settings, "OPENAI_API_KEY", None),
            "anthropic": getattr(settings, "ANTHROPIC_API_KEY", None),
            "xai": getattr(settings, "XAI_API_KEY", None),
        }

        api_key = key_map.get(provider)
        if not api_key:
            raise ValueError(f"Missing API key for provider: {provider}")

        return api_key

    @staticmethod
    def _build_rag_system_message(rag_context: List[Document]) -> SystemMessage:
        """
        Build the injected system message for RAG context.

        NOTE: Preserves the original behavior of prepending a system
        context message before all user/assistant messages.
        """
        context_str = "\n\n---\n\n".join(doc.page_content for doc in rag_context)
        return SystemMessage(
            content=(
                "Use the following context to answer the user's question. "
                "If the context is not relevant, say so and answer based on your own knowledge.\n\n"
                f"Context:\n{context_str}"
            )
        )

    @staticmethod
    def _build_llm(
        model_name: str,
        streaming: bool = False,
        provider: Optional[Provider] = None,
        **kwargs: Any,
    ) -> Any:
        """
        Initialize the appropriate LangChain chat model for the provider.

        Args:
            model_name: Name of the model to use.
            streaming: Whether to enable streaming mode.
            provider: Optional explicit provider override.
            **kwargs: Additional arguments passed to the underlying chat model.

        Returns:
            Configured LangChain chat model instance.
        """
        resolved_provider = provider or LLMService._detect_provider(model_name)
        api_key = LLMService._get_api_key(resolved_provider)

        if resolved_provider == "openai":
            return ChatOpenAI(
                model=model_name,
                streaming=streaming,
                api_key=api_key,
                **kwargs,
            )

        if resolved_provider == "anthropic":
            if ChatAnthropic is None:
                raise ImportError(
                    "langchain-anthropic is not installed. "
                    "Install it with: pip install -U langchain-anthropic"
                )

            return ChatAnthropic(
                model=model_name,
                streaming=streaming,
                api_key=api_key,
                **kwargs,
            )

        if resolved_provider == "xai":
            if ChatXAI is None:
                raise ImportError(
                    "langchain-xai is not installed. "
                    "Install it with: pip install -U langchain-xai"
                )

            return ChatXAI(
                model=model_name,
                streaming=streaming,
                api_key=api_key,
                **kwargs,
            )

        raise ValueError(f"Unsupported provider: {resolved_provider}")

    @staticmethod
    def _to_langchain_messages(
        messages: List[Dict[str, str]],
        rag_context: Optional[List[Document]] = None,
    ) -> List[BaseMessage]:
        """
        Convert message dicts and optional RAG context to LangChain message objects.

        Args:
            messages: List of message dicts with 'role' and 'content' keys.
            rag_context: Optional list of Document objects from RAG retrieval.

        Returns:
            List of LangChain BaseMessage objects ready for LLM invocation.
        """
        lc_messages: List[BaseMessage] = []

        if rag_context:
            lc_messages.append(LLMService._build_rag_system_message(rag_context))

        for msg in messages:
            role = msg.get("role")
            content = msg.get("content")

            if role is None:
                raise ValueError("Message is missing required key: 'role'")
            if content is None:
                raise ValueError("Message is missing required key: 'content'")

            cls = LLMService._ROLE_MAP.get(role)
            if cls is None:
                raise ValueError(f"Unknown message role: {role}")

            lc_messages.append(cls(content=content))

        return lc_messages

    @staticmethod
    def _extract_reasoning(message: AIMessage | AIMessageChunk) -> Optional[str]:
        """
        Extract reasoning content from an AI message.

        Tries multiple fallback paths to preserve compatibility across
        provider-specific response metadata shapes.
        """
        additional_kwargs = message.additional_kwargs or {}

        reasoning = additional_kwargs.get("reasoning_content")
        if isinstance(reasoning, str) and reasoning:
            return reasoning

        reasoning = additional_kwargs.get("reasoning", {})
        if isinstance(reasoning, dict):
            content = reasoning.get("content")
            if isinstance(content, str) and content:
                return content

        if isinstance(reasoning, str) and reasoning:
            return reasoning

        return None

    @staticmethod
    async def generate(
        messages: List[Dict[str, str]],
        model_name: str = "gpt-5-mini",
        rag_context: Optional[List[Document]] = None,
        provider: Optional[Provider] = None,
        **kwargs: Any,
    ) -> AIMessage:
        """
        Generate a single response from the configured LLM.

        Backward compatibility:
        - Existing calls without `provider` still work.
        - Provider is inferred from `model_name` when omitted.
        """
        llm = LLMService._build_llm(
            model_name=model_name,
            streaming=False,
            provider=provider,
            **kwargs,
        )
        lc_messages = LLMService._to_langchain_messages(messages, rag_context)
        return await llm.ainvoke(lc_messages)

    @staticmethod
    async def stream(
        messages: List[Dict[str, str]],
        model_name: str = "gpt-5-mini",
        rag_context: Optional[List[Document]] = None,
        provider: Optional[Provider] = None,
        **kwargs: Any,
    ) -> AsyncIterator[AIMessageChunk]:
        """
        Stream a response from the configured LLM.

        Backward compatibility:
        - Existing calls without `provider` still work.
        - Provider is inferred from `model_name` when omitted.
        """
        llm = LLMService._build_llm(
            model_name=model_name,
            streaming=True,
            provider=provider,
            **kwargs,
        )
        lc_messages = LLMService._to_langchain_messages(messages, rag_context)

        async for chunk in llm.astream(lc_messages):
            yield chunk


# Re-export at module level for backward compatibility with existing imports
def _extract_reasoning(message: AIMessage | AIMessageChunk) -> Optional[str]:
    """Backward compatibility wrapper. Use LLMService._extract_reasoning() instead."""
    return LLMService._extract_reasoning(message)