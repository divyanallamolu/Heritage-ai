import json
import base64
import asyncio
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from app.services.deepgram_service import transcribe_audio_bytes
from app.services.groq_service import get_groq_response_async
from app.services.elevenlabs_service import iter_speech_chunks

router = APIRouter()


@router.post("/voice/transcribe")
async def transcribe_voice(
    audio: UploadFile = File(...),
    language: str = Form("English"),
):
    """
    HTTP POST endpoint for transcribing audio file recordings using Deepgram.
    """
    audio_bytes = await audio.read()

    if not audio_bytes:
        raise HTTPException(status_code=400, detail="Empty audio file received.")

    try:
        transcript = await transcribe_audio_bytes(
            audio_bytes=audio_bytes,
            language=language,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {str(e)}")

    if not transcript:
        raise HTTPException(status_code=422, detail="Could not detect speech in recording.")

    return {"transcript": transcript}


@router.websocket("/ws/voice")
async def websocket_voice_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time voice interaction.
    Flow: Browser audio chunk -> Deepgram STT -> Groq Voice AI -> ElevenLabs TTS -> Audio stream to Browser.
    """
    await websocket.accept()
    print("🟢 Browser WebSocket connected for Voice Session")

    try:
        while True:
            # Receive text or binary message from client
            message = await websocket.receive()

            if "bytes" in message and message["bytes"]:
                audio_bytes = message["bytes"]
                # Transcribe using Deepgram
                try:
                    transcript = await transcribe_audio_bytes(audio_bytes)
                except Exception as e:
                    print(f"⚠️ STT transcription warning: {e}")
                    transcript = ""

                if transcript:
                    # 1. Send live transcript back to frontend
                    await websocket.send_json({"type": "transcript", "text": transcript})

                    # 2. Get AI response from Groq
                    ai_response = await get_groq_response_async(transcript)
                    await websocket.send_json({"type": "assistant", "text": ai_response})

                    # 3. Stream ElevenLabs TTS audio chunks to browser
                    await websocket.send_json({"type": "audio_start"})
                    for chunk in iter_speech_chunks(ai_response):
                        chunk_b64 = base64.b64encode(chunk).decode("utf-8")
                        await websocket.send_json({"type": "audio_chunk", "data": chunk_b64})
                    await websocket.send_json({"type": "audio_end"})

            elif "text" in message and message["text"]:
                try:
                    payload = json.loads(message["text"])
                    msg_type = payload.get("type")

                    if msg_type == "audio_base64":
                        b64_data = payload.get("data", "")
                        language = payload.get("language", "English")
                        if b64_data:
                            raw_bytes = base64.b64decode(b64_data)
                            try:
                                transcript = await transcribe_audio_bytes(raw_bytes, language=language)
                            except Exception as e:
                                print(f"⚠️ STT transcription warning: {e}")
                                transcript = ""

                            if transcript:
                                await websocket.send_json({"type": "transcript", "text": transcript})
                                
                                # If conversational voice response requested
                                if payload.get("generate_response", False):
                                    ai_response = await get_groq_response_async(transcript)
                                    await websocket.send_json({"type": "assistant", "text": ai_response})

                                    await websocket.send_json({"type": "audio_start"})
                                    for chunk in iter_speech_chunks(ai_response):
                                        chunk_b64 = base64.b64encode(chunk).decode("utf-8")
                                        await websocket.send_json({"type": "audio_chunk", "data": chunk_b64})
                                    await websocket.send_json({"type": "audio_end"})

                    elif msg_type == "chat_text":
                        text = payload.get("text", "")
                        if text:
                            ai_response = await get_groq_response_async(text)
                            await websocket.send_json({"type": "assistant", "text": ai_response})

                            await websocket.send_json({"type": "audio_start"})
                            for chunk in iter_speech_chunks(ai_response):
                                chunk_b64 = base64.b64encode(chunk).decode("utf-8")
                                await websocket.send_json({"type": "audio_chunk", "data": chunk_b64})
                            await websocket.send_json({"type": "audio_end"})

                except json.JSONDecodeError:
                    pass

    except WebSocketDisconnect:
        print("🔴 Browser WebSocket disconnected")
    except Exception as e:
        print(f"WebSocket error: {e}")
