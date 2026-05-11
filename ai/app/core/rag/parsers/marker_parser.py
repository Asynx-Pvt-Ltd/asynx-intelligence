from typing import Dict
from pypdf import PdfReader

from .base import (
    BaseDocumentParser,
    ParseResult,
    DocumentConversionError,
    ParserInitError,
)


class MarkerParser(BaseDocumentParser):
    """
    Lightweight PDF parser using pypdf.
    Replaces Marker ML-based parser.
    """

    def __init__(self, config: Dict | None = None):
        # No heavy model initialization needed
        self.config = config or {}

    def parse(self, pdf_path: str) -> ParseResult:
        self._validate_path(pdf_path)

        try:
            reader = PdfReader(pdf_path)
        except Exception as e:
            raise DocumentConversionError(
                f"Failed to open PDF '{pdf_path}': {e}"
            ) from e

        try:
            pages_text = []

            for page_number, page in enumerate(reader.pages):
                text = page.extract_text()
                if text:
                    pages_text.append(f"\n\n--- Page {page_number + 1} ---\n\n{text}")

            if not pages_text:
                raise DocumentConversionError(
                    f"No extractable text found in '{pdf_path}'."
                )

            raw_corpus = "\n".join(pages_text)

        except Exception as e:
            raise DocumentConversionError(
                f"Failed to extract text from '{pdf_path}': {e}"
            ) from e

        # Keep return format consistent with your system
        return raw_corpus, "md", {}