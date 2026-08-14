"""
Utilities for message handling, prompt building, and message preparation.
Centralizes logic for extracting user messages, building system prompts, and preparing messages for LLM.
"""

from typing import Dict, List, Optional, Any
from app.schemas.chat import Message
from app.constants.prompt_templates import (
    STRUCTURED_OUTPUT_SYSTEM_PROMPT,
    DOCUMENT_CONTEXT_SYSTEM_PROMPT,
)


def extract_last_user_message(messages: List[Message]) -> str:
    """
    Extract the last user message from a list of messages.
    
    Args:
        messages: List of Message objects with role and content
        
    Returns:
        Content of the last user message, or empty string if no user message found
        
    NOTE: Preserves original behavior - returns first match searching from end
    """
    return next(
        (m.content for m in reversed(messages) if m.role == "user"), ""
    )


def build_system_prompts(
    include_structured: bool = True,
    include_rag_context: bool = False,
) -> List[Dict[str, str]]:
    """
    Build a list of system prompts to prepend to messages.
    
    Args:
        include_structured: If True, include structured output prompt
        include_rag_context: If True, include document context prompt
        
    Returns:
        List of system message dicts with role and content
        
    NOTE: Preserves original behavior of structured output always first,
    then rag context if applicable
    """
    prompts: List[Dict[str, str]] = []
    
    if include_structured:
        prompts.append({
            "role": "system",
            "content": STRUCTURED_OUTPUT_SYSTEM_PROMPT.strip(),
        })
    
    if include_rag_context:
        prompts.append({
            "role": "system",
            "content": DOCUMENT_CONTEXT_SYSTEM_PROMPT.strip(),
        })
    
    return prompts


def prepare_messages_for_llm(
    messages: List[Message],
    include_structured_output: bool = True,
    include_rag_context: bool = False,
) -> List[Dict[str, Any]]:
    """
    Prepare messages for LLM by converting to dicts and prepending system prompts.
    
    Args:
        messages: List of Message objects
        include_structured_output: Whether to include structured output system prompt
        include_rag_context: Whether to include RAG context system prompt
        
    Returns:
        List of message dicts ready for LLM, with system prompts prepended
        
    NOTE: Converts Message objects to dicts via model_dump() to preserve
    any serialization behavior (e.g., UUID to string conversion in attached_files)
    """
    # Build system prompts
    system_prompts = build_system_prompts(
        include_structured=include_structured_output,
        include_rag_context=include_rag_context,
    )
    
    # Convert messages to dicts
    messages_dicts = [m.model_dump() for m in messages]
    
    # Combine: system prompts first, then user messages
    return system_prompts + messages_dicts
