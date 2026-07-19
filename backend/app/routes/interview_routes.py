from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_service import generate_summary

router = APIRouter()


class TranscriptRequest(BaseModel):
    transcript: str


@router.post("/summary")
def create_summary(request: TranscriptRequest):
    summary_text = generate_summary(request.transcript)
    return {"summary": summary_text}