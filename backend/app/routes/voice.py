from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.services.speech_service import transcribe_audio

router = APIRouter()


@router.post("/voice/transcribe")
async def transcribe_voice(
    audio: UploadFile = File(...),
    language: str = Form("English"),
):
    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file received.")

    try:
        transcript = transcribe_audio(
            audio_bytes=audio_bytes,
            mime_type=audio.content_type or "audio/webm",
            language=language,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    if not transcript:
        raise HTTPException(status_code=422, detail="Could not detect any speech in the recording.")

    return {"transcript": transcript}
