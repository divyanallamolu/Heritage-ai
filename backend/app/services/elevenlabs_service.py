import os
from typing import Iterator, Optional, Callable
from dotenv import load_dotenv

load_dotenv()

ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
ELEVENLABS_MODEL = "eleven_flash_v2_5"
ELEVENLABS_VOICE_ID = "JBFqnCBsd6RMkjVDRZzb"  # Gentle, warm voice suitable for story preservation
ELEVENLABS_OUTPUT_FORMAT = "mp3_44100_128"


def get_elevenlabs_client():
    if not ELEVENLABS_API_KEY:
        raise RuntimeError("ELEVENLABS_API_KEY not found in .env environment variables.")
    from elevenlabs.client import ElevenLabs
    return ElevenLabs(api_key=ELEVENLABS_API_KEY)


def iter_speech_chunks(text: str, on_first_chunk: Optional[Callable[[], None]] = None) -> Iterator[bytes]:
    """
    Stream audio speech chunks from ElevenLabs API for a given text response.
    """
    if not ELEVENLABS_API_KEY:
        print("ELEVENLABS_API_KEY missing.")
        return

    try:
        client = get_elevenlabs_client()
        audio_stream = client.text_to_speech.stream(
            voice_id=ELEVENLABS_VOICE_ID,
            text=text,
            model_id=ELEVENLABS_MODEL,
            output_format=ELEVENLABS_OUTPUT_FORMAT,
            optimize_streaming_latency=3,
        )

        first = True
        for chunk in audio_stream:
            if not chunk:
                continue
            if first:
                if on_first_chunk:
                    on_first_chunk()
                first = False
            yield chunk
    except Exception as e:
        print(f"ElevenLabs TTS streaming error: {e}")


def text_to_speech_bytes(text: str) -> bytes:
    """
    Convert text to complete audio bytes using ElevenLabs.
    """
    audio_data = bytearray()
    for chunk in iter_speech_chunks(text):
        audio_data.extend(chunk)
    return bytes(audio_data)
