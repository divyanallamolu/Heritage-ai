from fastapi import APIRouter
from pydantic import BaseModel
from app.services.gemini_service import generate_summary

router = APIRouter()


class TranscriptRequest(BaseModel):
    transcript: str


@router.post("/summary")
def summarize(request: TranscriptRequest):
    result = generate_summary(request.transcript)
    return {"summary": result}