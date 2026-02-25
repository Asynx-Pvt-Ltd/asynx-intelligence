from typing import Dict
from marker.models import create_model_dict
from marker.output import text_from_rendered
from marker.config.parser import ConfigParser
from marker.converters.pdf import PdfConverter

from .base import (
    BaseDocumentParser,
    ParseResult,
    DocumentConversionError,
    ParserInitError,
)

_DEFAULT_CONFIG: Dict = {
    "output_format": "markdown",
    "paginate_output": True,
}


class MarkerParser(BaseDocumentParser):
    def __init__(self, config: Dict | None = None):
        resolved_config = config or _DEFAULT_CONFIG
        try:
            config_parser = ConfigParser(resolved_config)
            self.converter = PdfConverter(
                renderer=config_parser.get_renderer(),
                artifact_dict=create_model_dict(),
                config=resolved_config,
            )
        except Exception as e:
            raise ParserInitError(f"Failed to initialize MarkerParser: {e}") from e

    def parse(self, pdf_path: str) -> ParseResult:
        self._validate_path(pdf_path)
        try:
            rendered = self.converter(pdf_path)
        except Exception as e:
            raise DocumentConversionError(
                f"MarkerParser failed to convert '{pdf_path}': {e}"
            ) from e

        try:
            raw_corpus, fmt, images = text_from_rendered(rendered)
        except Exception as e:
            raise DocumentConversionError(
                f"Failed to extract text from rendered output: {e}"
            ) from e

        return raw_corpus, fmt, images
