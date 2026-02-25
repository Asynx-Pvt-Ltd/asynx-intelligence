import os
from abc import ABC, abstractmethod
from typing import Dict, Literal, Tuple


class DocumentParserError(Exception):
    """Base exception for document parsing operations."""

    pass


class ParserInitError(DocumentParserError):
    """Raised when the parser fails to initialize."""

    pass


class DocumentConversionError(DocumentParserError):
    """Raised when PDF conversion fails."""

    pass


class InvalidDocumentError(DocumentParserError):
    """Raised when the input document is invalid or inaccessible."""

    pass


OutputFormat = Literal["md", "html", "json"]
ParseResult = Tuple[str, OutputFormat, Dict]


class BaseDocumentParser(ABC):
    def _validate_path(self, pdf_path: str) -> None:
        if not pdf_path or not pdf_path.strip():
            raise InvalidDocumentError("PDF path cannot be empty.")
        if not os.path.isfile(pdf_path):
            raise InvalidDocumentError(f"File not found: {pdf_path}")
        if not pdf_path.lower().endswith(".pdf"):
            raise InvalidDocumentError(
                f"Expected a .pdf file, got: {os.path.basename(pdf_path)}"
            )

    @abstractmethod
    def parse(self, pdf_path: str) -> ParseResult:
        """Parse a PDF file and return (text, format, images)."""
        ...
