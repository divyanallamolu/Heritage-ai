import os
import json
import base64
import asyncio
import logging
import websockets
from dotenv import load_dotenv

load_dotenv()
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, WebSocket, WebSocketDisconnect
from app.services.deepgram_service import transcribe_audio_bytes
from app.services.groq_service import get_groq_response_async
from app.services.elevenlabs_service import iter_speech_chunks

logger = logging.getLogger("heritageai.voice")
router = APIRouter()

LANGUAGE_MAP = {
    "english": "en",
    "telugu": "te",
    "hindi": "hi",
    "tamil": "ta",
    "kannada": "kn",
    "bengali": "bn",
    "marathi": "mr",
}


@router.post("/voice/transcribe")
async def transcribe_voice(
    audio: UploadFile = File(...),
    language: str = Form("English"),
):
    """
    HTTP POST endpoint for transcribing audio file recordings using Deepgram.
    Preserved as a deliberate recovery fallback when live streaming is not available.
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
    WebSocket endpoint for real-time live voice transcription using Deepgram streaming.
    Provides continuous interim (partial) and finalized transcription updates to the browser.
    """
    await websocket.accept()
    logger.info("[WebSocket] Client connected to /ws/voice")

    api_key = os.getenv("DEEPGRAM_API_KEY")
    if not api_key:
        logger.error("[WebSocket] DEEPGRAM_API_KEY is not configured in backend environment.")
        await websocket.send_json({
            "type": "error",
            "message": "Deepgram API key is not configured on the server."
        })
        await websocket.close(code=1008)
        return

    # Language requested via query parameters or default English
    requested_lang = websocket.query_params.get("language", "English")
    lang_code = LANGUAGE_MAP.get(requested_lang.strip().lower(), "en")

    # Connect to Deepgram's live streaming WebSocket
    # We use nova-3 which supports English and Indian regional languages (hi, te, ta, kn, bn, mr).
    models_to_try = ["nova-3", "nova-2", "general"]
    dg_socket = None

    for model_name in models_to_try:
        deepgram_ws_url = (
            f"wss://api.deepgram.com/v1/listen?"
            f"model={model_name}&language={lang_code}&smart_format=true&interim_results=true&endpointing=300"
        )
        headers = {"Authorization": f"Token {api_key}"}
        try:
            dg_socket = await websockets.connect(deepgram_ws_url, additional_headers=headers)
            logger.info(f"[WebSocket] Connected to Deepgram live streaming (model={model_name}, lang={lang_code})")
            break
        except Exception as conn_err:
            logger.warning(f"[WebSocket] Deepgram connection attempt with model '{model_name}' failed: {conn_err}")
            continue

    if not dg_socket:
        logger.error("[WebSocket] Could not connect to Deepgram live streaming service with any model.")
        await websocket.send_json({
            "type": "error",
            "message": "Unable to connect to Deepgram live streaming service. Please verify server API credentials."
        })
        await websocket.close(code=1011)
        return

    # Signal to the frontend that live streaming is ready to receive audio
    await websocket.send_json({
        "type": "ready",
        "language": requested_lang,
        "lang_code": lang_code,
    })

    stop_event = asyncio.Event()

    async def forward_deepgram_to_client():
        """Reads real-time transcription events from Deepgram and forwards them to the browser."""
        try:
            async for raw_msg in dg_socket:
                if stop_event.is_set():
                    break
                if isinstance(raw_msg, str):
                    try:
                        data = json.loads(raw_msg)
                        msg_type = data.get("type")

                        if msg_type == "Results":
                            channel = data.get("channel", {})
                            alternatives = channel.get("alternatives", [])
                            if alternatives:
                                transcript = alternatives[0].get("transcript", "")
                                is_final = data.get("is_final", False)
                                speech_final = data.get("speech_final", False)

                                # Forward partial or final transcript
                                if transcript or is_final:
                                    await websocket.send_json({
                                        "type": "transcript",
                                        "text": transcript,
                                        "is_final": is_final,
                                        "speech_final": speech_final,
                                    })

                        elif msg_type == "Error":
                            err_desc = data.get("message", "Deepgram streaming transcription error.")
                            logger.error(f"[Deepgram Streaming Error] {err_desc}")
                            await websocket.send_json({"type": "error", "message": err_desc})

                    except json.JSONDecodeError:
                        pass
        except asyncio.CancelledError:
            pass
        except Exception as e:
            if not stop_event.is_set():
                logger.warning(f"[WebSocket] Error reading from Deepgram: {e}")

    async def forward_client_to_deepgram():
        """Receives audio frames and control messages from the browser and sends them to Deepgram."""
        try:
            while not stop_event.is_set():
                message = await websocket.receive()
                msg_type = message.get("type")

                if msg_type == "websocket.disconnect":
                    stop_event.set()
                    break

                # Binary audio frames (e.g. MediaRecorder chunks)
                if "bytes" in message and message["bytes"]:
                    await dg_socket.send(message["bytes"])

                # Text / JSON messages
                elif "text" in message and message["text"]:
                    try:
                        payload = json.loads(message["text"])
                        p_type = payload.get("type")

                        if p_type == "audio_base64":
                            b64_data = payload.get("data", "")
                            if b64_data:
                                audio_bytes = base64.b64decode(b64_data)
                                await dg_socket.send(audio_bytes)

                        elif p_type == "stop":
                            # Tell Deepgram to finish and flush remaining audio
                            try:
                                await dg_socket.send(json.dumps({"type": "CloseStream"}))
                            except Exception:
                                pass
                            # Allow brief time for Deepgram to flush final segments
                            await asyncio.sleep(0.4)
                            await websocket.send_json({"type": "session_ended"})
                            stop_event.set()
                            break

                        elif p_type == "ping":
                            await websocket.send_json({"type": "pong"})

                        elif p_type == "chat_text":
                            # Preserved for conversational voice agent capability
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
            logger.info("[WebSocket] Client disconnected.")
            stop_event.set()
        except asyncio.CancelledError:
            pass
        except Exception as e:
            if not stop_event.is_set():
                logger.warning(f"[WebSocket] Error receiving from client: {e}")
            stop_event.set()

    # Run client receiver and Deepgram receiver concurrently
    client_task = asyncio.create_task(forward_client_to_deepgram())
    deepgram_task = asyncio.create_task(forward_deepgram_to_client())

    try:
        # Wait until either task completes
        done, pending = await asyncio.wait(
            [client_task, deepgram_task],
            return_when=asyncio.FIRST_COMPLETED,
        )
        for task in pending:
            task.cancel()
    finally:
        stop_event.set()
        # Cleanly close Deepgram connection if still open
        try:
            await dg_socket.close()
        except Exception:
            pass
        logger.info("[WebSocket] Session finished and resources cleanly released.")
