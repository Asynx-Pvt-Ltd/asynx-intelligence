from functools import lru_cache
from langchain_openai import OpenAIEmbeddings

from app.core.rag import RAG


@lru_cache(maxsize=1)
def get_embedding_model() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(model="text-embedding-3-small")


def get_rag() -> RAG:
    return RAG(embedding=get_embedding_model())