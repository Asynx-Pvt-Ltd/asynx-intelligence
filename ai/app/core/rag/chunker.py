from typing import Dict, List, Optional
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter


def chunk_document(
    text: str,
    metadata: Optional[Dict] = None,
    chunk_size: int = 1000,
    chunk_overlap: int = 200,
) -> List[Document]:
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=["\n\n", "\n", ". ", " ", ""],
    )
    base_metadata = metadata or {}
    chunks = splitter.split_text(text)
    return [
        Document(page_content=chunk, metadata={**base_metadata, "chunk_index": i})
        for i, chunk in enumerate(chunks)
    ]