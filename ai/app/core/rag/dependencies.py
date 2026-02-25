from functools import lru_cache
from langchain_openai import OpenAIEmbeddings

from app.core.rag import RAG
from app.core.config import settings


@lru_cache(maxsize=1)
def get_embedding_model() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(model="text-embedding-3-small", api_key=settings.OPENAI_API_KEY)


def get_rag() -> RAG:
    return RAG(embedding=get_embedding_model())