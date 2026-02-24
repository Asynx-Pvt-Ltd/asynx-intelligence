from fastapi import APIRouter

router = APIRouter(prefix="/chat", tags=["Chat Bot"])

@router.post("/stream")
async def stream_chat_response():
    pass

@router.post("/response")
async def get_chat_response():
    pass

