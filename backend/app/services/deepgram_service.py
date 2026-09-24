import os
import logging
from dotenv import load_dotenv
from deepgram import AsyncDeepgramClient

load_dotenv()

DEEPGRAM_API_KEY = os.getenv("DEEPGRAM_API_KEY")

logger = logging.getLogger("heritageai.deepgram")
logger.setLevel(logging.INFO)

LANGUAGE_MAP = {
    "english": "en",
    "telugu": "te",
    "hindi": "hi",
    "tamil": "ta",
    "kannada": "kn",
    "bengali": "bn",
    "marathi": "mr",
}

def get_deepgram_client() -> AsyncDeepgramClient:
    """
    Initialize and return the AsyncDeepgramClient using DEEPGRAM_API_KEY from .env.
    """
    if not DEEPGRAM_API_KEY:
        logger.error("DEEPGRAM_API_KEY not found in .env")
        raise RuntimeError("DEEPGRAM_API_KEY is missing in backend/.env")
    return AsyncDeepgramClient(api_key=DEEPGRAM_API_KEY)


async def transcribe_audio_bytes(audio_bytes: bytes, language: str = "English") -> str:
    """
    Transcribe audio bytes using Deepgram SDK 7.8.1 API (listen.v1.media.transcribe_file).
    Supports English, Telugu, Hindi, Tamil, Kannada, Bengali, Marathi via nova-3 / nova-2.
    """
    if not DEEPGRAM_API_KEY:
        logger.error("Cannot transcribe: DEEPGRAM_API_KEY is not configured.")
        raise RuntimeError("DEEPGRAM_API_KEY is missing in backend/.env")

    if not audio_bytes or len(audio_bytes) < 50:
        logger.warning("Received empty or insufficient audio payload.")
        return ""

    client = get_deepgram_client()
    lang_code = LANGUAGE_MAP.get(language.lower(), "en") if language else "en"

    # Try nova-3 first for broadest language coverage (Telugu, Tamil, Hindi, English, etc.)
    models_to_try = ["nova-3", "nova-2", "general"]

    for model_name in models_to_try:
        try:
            response = await client.listen.v1.media.transcribe_file(
                request=audio_bytes,
                model=model_name,
                smart_format=True,
                punctuate=True,
                language=lang_code,
            )

            transcript = ""
            if response and hasattr(response, "results") and response.results:
                if hasattr(response.results, "channels") and response.results.channels:
                    channel = response.results.channels[0]
                    if hasattr(channel, "alternatives") and channel.alternatives:
                        transcript = channel.alternatives[0].transcript or ""

            return transcript.strip()
        except Exception as e:
            err_str = str(e)
            if "model" in err_str.lower() or "language" in err_str.lower():
                logger.warning(f"Deepgram model '{model_name}' failed for lang '{lang_code}': {err_str}. Retrying next model...")
                continue
            logger.error(f"Deepgram transcription error ({model_name}, {lang_code}): {err_str}")
            raise e

    return ""
