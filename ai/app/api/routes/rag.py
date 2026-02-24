from fastapi import APIRouter

router = APIRouter(prefix="/rag", tags=["Chat Bot"])

@router.post("/upload")
async def stream_chat_response():
    pass

@router.post("/response")
async def get_chat_response():
    pass

