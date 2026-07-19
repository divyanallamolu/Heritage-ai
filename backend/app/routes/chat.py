from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.chat_service import generate_chat_response

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


class ChatResponse(BaseModel):
    answer: str


@router.post("/chat", response_model=ChatResponse)
def chat_with_heritage_ai(request: ChatRequest, db: Session = Depends(get_db)):
    if not request.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    try:
        answer = generate_chat_response(db, request.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

    return {"answer": answer}