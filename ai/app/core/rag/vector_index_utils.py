"""
Utilities for vector index naming and parsing.
Centralizes logic for building and parsing vector index names for RAG collections.
"""

from typing import Optional
from uuid import UUID


# Vector index naming format: org_{org_id}_conv_{conversation_id}
VECTOR_INDEX_PREFIX = "org_"
VECTOR_INDEX_CONV_SEPARATOR = "_conv_"


def build_vector_index_name(org_id: str, conversation_id: UUID) -> str:
    """
    Build a vector index name from organization ID and conversation ID.
    
    Args:
        org_id: Organization identifier
        conversation_id: Conversation UUID
        
    Returns:
        Vector index name in format: org_{org_id}_conv_{conversation_id}
        
    NOTE: This centralizes the naming convention used throughout the codebase.
    Must be consistent with parsing logic.
    """
    return f"{VECTOR_INDEX_PREFIX}{org_id}{VECTOR_INDEX_CONV_SEPARATOR}{conversation_id}"


def parse_conversation_id_from_vector_index(
    vector_index: str,
) -> Optional[UUID]:
    """
    Extract conversation ID from a vector index name.
    
    Args:
        vector_index: Vector index name to parse
        
    Returns:
        Extracted UUID if index follows expected format, None otherwise
        
    NOTE: Returns None for non-conversation-based indices (e.g., user-defined ones).
    This preserves original behavior where parsing failures are silent.
    """
    if not vector_index.startswith(VECTOR_INDEX_PREFIX):
        return None
    
    if VECTOR_INDEX_CONV_SEPARATOR not in vector_index:
        return None
    
    try:
        # Extract the part after "_conv_"
        conv_part = vector_index.split(VECTOR_INDEX_CONV_SEPARATOR)[1]
        return UUID(conv_part)
    except (ValueError, IndexError):
        # Not a valid UUID or unexpected format - return None (silent failure)
        # Preserves original behavior
        return None


def is_conversation_vector_index(vector_index: str) -> bool:
    """
    Check if a vector index name follows the conversation naming convention.
    
    Args:
        vector_index: Vector index name to check
        
    Returns:
        True if index appears to be conversation-based, False otherwise
    """
    return (
        vector_index.startswith(VECTOR_INDEX_PREFIX)
        and VECTOR_INDEX_CONV_SEPARATOR in vector_index
    )
