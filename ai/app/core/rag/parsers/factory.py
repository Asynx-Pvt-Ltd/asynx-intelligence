from typing import Dict, Literal

from .base import BaseDocumentParser
from .llama_parser import LlamaParser
from .marker_parser import MarkerParser

ParserStrategy = Literal["quality", "speed"]

_REGISTRY: Dict[ParserStrategy, type[BaseDocumentParser]] = {
    "quality": MarkerParser,
    "speed": LlamaParser,
}


def create_parser(
    strategy: ParserStrategy = "quality",
    config: Dict | None = None,
) -> BaseDocumentParser:
    cls = _REGISTRY.get(strategy)
    if cls is None:
        valid = ", ".join(f"'{k}'" for k in _REGISTRY)
        raise ValueError(f"Unknown parser strategy '{strategy}'. Choose from: {valid}")
    return cls(config=config)
