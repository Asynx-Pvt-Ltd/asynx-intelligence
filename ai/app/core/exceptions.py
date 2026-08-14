"""
Centralized exception handling and error response patterns for the AI backend.

This module provides custom exceptions and error utilities to ensure consistent
error handling across routes and services.
"""

from typing import Any, Dict, Optional
from fastapi import HTTPException, status


class AIBackendException(Exception):
    """
    Base exception class for AI backend errors.
    All custom exceptions inherit from this.
    """
    
    def __init__(self, message: str, status_code: int = 500, detail: Optional[str] = None):
        """
        Initialize exception.
        
        Args:
            message: Error message for logging
            status_code: HTTP status code to return
            detail: User-facing error detail (if different from message)
        """
        self.message = message
        self.status_code = status_code
        self.detail = detail or message
        super().__init__(self.message)
    
    def to_http_exception(self) -> HTTPException:
        """Convert this exception to an HTTPException for FastAPI."""
        return HTTPException(status_code=self.status_code, detail=self.detail)


class RAGRetrievalError(AIBackendException):
    """Raised when RAG context retrieval fails."""
    
    def __init__(self, message: str, original_error: Optional[Exception] = None):
        """
        Initialize RAG retrieval error.
        
        Args:
            message: Error message
            original_error: Original exception that caused this error
        """
        detail = f"RAG retrieval failed: {message}"
        super().__init__(message, status_code=500, detail=detail)
        self.original_error = original_error


class LLMGenerationError(AIBackendException):
    """Raised when LLM generation or streaming fails."""
    
    def __init__(self, message: str, original_error: Optional[Exception] = None):
        """
        Initialize LLM generation error.
        
        Args:
            message: Error message
            original_error: Original exception that caused this error
        """
        detail = f"LLM generation failed: {message}"
        super().__init__(message, status_code=500, detail=detail)
        self.original_error = original_error


class DocumentUploadError(AIBackendException):
    """Raised when document upload or processing fails."""
    
    def __init__(
        self,
        message: str,
        status_code: int = 500,
        original_error: Optional[Exception] = None,
    ):
        """
        Initialize document upload error.
        
        Args:
            message: Error message
            status_code: HTTP status code (400 for bad request, 422 for unprocessable, 500 for server error)
            original_error: Original exception that caused this error
        """
        detail = f"Upload failed: {message}"
        super().__init__(message, status_code=status_code, detail=detail)
        self.original_error = original_error


class DocumentParsingError(AIBackendException):
    """Raised when document parsing fails."""
    
    def __init__(self, message: str, original_error: Optional[Exception] = None):
        """
        Initialize document parsing error.
        
        Args:
            message: Error message
            original_error: Original exception that caused this error
        """
        detail = f"Document parsing failed: {message}"
        super().__init__(message, status_code=422, detail=detail)
        self.original_error = original_error


class ConversationNotFoundError(AIBackendException):
    """Raised when conversation is not found."""
    
    def __init__(self, conversation_id: str):
        """
        Initialize conversation not found error.
        
        Args:
            conversation_id: UUID of the conversation that was not found
        """
        message = f"Conversation {conversation_id} not found"
        super().__init__(message, status_code=404, detail=message)


class UnauthorizedAccessError(AIBackendException):
    """Raised when user tries to access resource they don't own."""
    
    def __init__(self, resource: str = "resource"):
        """
        Initialize unauthorized access error.
        
        Args:
            resource: Type of resource being accessed
        """
        message = f"{resource} does not belong to the authenticated user/org"
        super().__init__(message, status_code=403, detail=message)


class InvalidInputError(AIBackendException):
    """Raised when input validation fails."""
    
    def __init__(self, message: str):
        """
        Initialize invalid input error.
        
        Args:
            message: Description of what is invalid
        """
        super().__init__(message, status_code=400, detail=message)


# Error response builders

def build_rag_retrieval_error_detail(error: Exception) -> str:
    """
    Build user-facing error detail for RAG retrieval failures.
    
    Args:
        error: The original exception
        
    Returns:
        User-friendly error message
    """
    return f"RAG retrieval failed: {str(error)}"


def build_llm_generation_error_detail(error: Exception) -> str:
    """
    Build user-facing error detail for LLM generation failures.
    
    Args:
        error: The original exception
        
    Returns:
        User-friendly error message
    """
    return f"LLM generation failed: {str(error)}"


def build_upload_error_detail(error: Exception) -> str:
    """
    Build user-facing error detail for upload failures.
    
    Args:
        error: The original exception
        
    Returns:
        User-friendly error message
    """
    return f"Upload failed: {str(error)}"


def build_parsing_error_detail(error: Exception) -> str:
    """
    Build user-facing error detail for document parsing failures.
    
    Args:
        error: The original exception
        
    Returns:
        User-friendly error message
    """
    return f"Document parsing failed: {str(error)}"


# Constant error messages

ERROR_MESSAGES = {
    "EMPTY_MESSAGES": "Messages list cannot be empty.",
    "INVALID_PDF": "Only PDF files are supported.",
    "EMPTY_DOCUMENT": "No content extracted from the PDF.",
    "EMPTY_DOCUMENT_IDS": "document_ids cannot be empty.",
    "INVALID_CONVERSATION_ID": "Invalid conversation ID format",
}
