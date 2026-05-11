from typing import Dict

from pypdf import PdfReader

from .base import (
    BaseDocumentParser,
    ParseResult,
    DocumentConversionError,
    ParserInitError,
)


class LlamaParser(BaseDocumentParser):
    def __init__(self, config: Dict | None = None):
        # No API key needed for pypdf
        # Config can be used for PdfReader options if needed
        self.config = config or {}

    def parse(self, pdf_path: str) -> ParseResult:
        self._validate_path(pdf_path)
        
        try:
            reader = PdfReader(pdf_path)
        except Exception as e:
            raise DocumentConversionError(
                f"Failed to open PDF file '{pdf_path}': {e}"
            ) from e

        pages_text = []
        for page_num, page in enumerate(reader.pages, start=1):
            try:
                text = page.extract_text()
                if text and text.strip():
                    pages_text.append(text.strip())
            except Exception as e:
                # If a page fails, we can skip it or raise error.
                # For robustness, we skip and continue.
                # Logging could be added here.
                pass

        if not pages_text:
            raise DocumentConversionError(
                f"No extractable text found in PDF '{pdf_path}'"
            )

        raw_corpus = "\n\n---\n\n".join(pages_text)
        return raw_corpus, "md", {}
