from typing import Dict

from llama_parse import LlamaParse

from .base import (
    BaseDocumentParser,
    ParseResult,
    DocumentConversionError,
    ParserInitError,
)


class LlamaParser(BaseDocumentParser):
    def __init__(self, config: Dict | None = None):
        from app.core.config import settings

        api_key = getattr(settings, "LLAMA_CLOUD_API_KEY", None)
        if not api_key:
            raise ParserInitError(
                "LLAMA_CLOUD_API_KEY is not set. "
                "Add it to your .env to use the 'speed' parser strategy."
            )

        resolved_config = config or {}
        try:
            self.parser = LlamaParse(
                api_key=api_key,
                result_type=resolved_config.get("result_type", "markdown"),
                verbose=resolved_config.get("verbose", False),
            )
        except Exception as e:
            raise ParserInitError(f"Failed to initialize LlamaParser: {e}") from e

    def parse(self, pdf_path: str) -> ParseResult:
        self._validate_path(pdf_path)
        try:
            documents = self.parser.load_data(pdf_path)
        except Exception as e:
            raise DocumentConversionError(
                f"LlamaParser failed to convert '{pdf_path}': {e}"
            ) from e

        if not documents:
            raise DocumentConversionError(
                f"LlamaParser returned no content for '{pdf_path}'."
            )

        raw_corpus = "\n\n---\n\n".join(doc.text for doc in documents)
        return raw_corpus, "md", {}
