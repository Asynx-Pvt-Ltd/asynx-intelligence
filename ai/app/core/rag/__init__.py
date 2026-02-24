from typing import List, Optional
from langchain_postgres import PGVector
from langchain_openai import OpenAIEmbeddings
from langchain_core.documents import Document

from ..config import settings


class RAGError(Exception):
    """Base exception for RAG operations."""

    pass


class DBNotInitializedError(RAGError):
    """Raised when database operations are attempted before initialization."""

    pass


class DocumentOperationError(RAGError):
    """Raised when document add/delete operations fail."""

    pass


class SearchError(RAGError):
    """Raised when search or retrieval operations fail."""

    pass


class DBConnectionError(RAGError):
    """Raised when database connection/initialization fails."""

    pass


class RAG:
    def __init__(self, embedding: OpenAIEmbeddings):
        self.embedding = embedding
        self.db: Optional[PGVector] = None

    def init_db(self, collection_name: str = "default_collection") -> None:
        try:
            self.db = PGVector(
                embeddings=self.embedding,
                collection_name=collection_name,
                connection=settings.POSTGRES_URI,
                use_jsonb=True,
            )
        except Exception as e:
            raise DBConnectionError(
                f"Failed to initialize database with collection '{collection_name}': {e}"
            ) from e

    def _validate_db(self) -> PGVector:
        if not self.db:
            raise DBNotInitializedError(
                "Database not initialized. Call init_db() first."
            )
        return self.db

    def add_documents(self, docs: List[Document], **kwargs) -> List[str]:
        db = self._validate_db()
        if not docs:
            raise DocumentOperationError("Cannot add an empty document list.")
        try:
            return db.add_documents(docs, **kwargs)
        except RAGError:
            raise
        except Exception as e:
            raise DocumentOperationError(
                f"Failed to add {len(docs)} documents: {e}"
            ) from e

    def delete(self, ids: List[str]) -> bool:
        db = self._validate_db()
        if not ids:
            raise DocumentOperationError("Cannot delete with an empty ID list.")
        try:
            return db.delete(ids)
        except RAGError:
            raise
        except Exception as e:
            raise DocumentOperationError(
                f"Failed to delete documents {ids}: {e}"
            ) from e

    def similarity_search(self, query: str, k: int = 10, **kwargs) -> List[Document]:
        db = self._validate_db()
        if not query.strip():
            raise SearchError("Search query cannot be empty.")
        if k < 1:
            raise SearchError(f"k must be >= 1, got {k}")
        try:
            return db.similarity_search(query, k, **kwargs)
        except RAGError:
            raise
        except Exception as e:
            raise SearchError(
                f"Similarity search failed for query '{query}': {e}"
            ) from e

    def retriever(
        self, query: str, search_type: str = "mmr", **kwargs
    ) -> List[Document]:
        db = self._validate_db()
        if not query.strip():
            raise SearchError("Retriever query cannot be empty.")

        valid_search_types = {"mmr", "similarity", "similarity_score_threshold"}
        if search_type not in valid_search_types:
            raise SearchError(
                f"Invalid search_type '{search_type}'. Must be one of {valid_search_types}"
            )
        try:
            retriever = db.as_retriever(search_type=search_type, **kwargs)
            return retriever.invoke(query)
        except RAGError:
            raise
        except Exception as e:
            raise SearchError(
                f"Retrieval failed for query '{query}' with search_type '{search_type}': {e}"
            ) from e
