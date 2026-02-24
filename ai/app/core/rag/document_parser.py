import os
from typing import Dict, Tuple, Literal
from marker.models import create_model_dict
from marker.output import text_from_rendered
from marker.config.parser import ConfigParser
from marker.converters.pdf import PdfConverter


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

_DEFAULT_CONFIG: Dict = {
    "output_format": "markdown",
    "paginate_output": True,
}


class DocumentParser:
    def __init__(self, config: Dict = _DEFAULT_CONFIG):
        try:
            config_parser = ConfigParser(config)
            self.converter = PdfConverter(
                renderer=config_parser.get_renderer(),
                artifact_dict=create_model_dict(),
                config=config,
            )
        except Exception as e:
            raise ParserInitError(f"Failed to initialize DocumentParser: {e}") from e

    def _validate_path(self, pdf_path: str) -> None:
        if not pdf_path or not pdf_path.strip():
            raise InvalidDocumentError("PDF path cannot be empty.")
        if not os.path.isfile(pdf_path):
            raise InvalidDocumentError(f"File not found: {pdf_path}")
        if not pdf_path.lower().endswith(".pdf"):
            raise InvalidDocumentError(
                f"Expected a .pdf file, got: {os.path.basename(pdf_path)}"
            )

    def parse(self, pdf_path: str) -> ParseResult:
        self._validate_path(pdf_path)
        try:
            rendered = self.converter(pdf_path)
        except DocumentParserError:
            raise
        except Exception as e:
            raise DocumentConversionError(f"Failed to convert '{pdf_path}': {e}") from e

        try:
            raw_corpus, fmt, images = text_from_rendered(rendered)
        except Exception as e:
            raise DocumentConversionError(
                f"Failed to extract text from rendered output: {e}"
            ) from e

        return raw_corpus, fmt, images
