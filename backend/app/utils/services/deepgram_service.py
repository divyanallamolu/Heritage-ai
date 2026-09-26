import os
import logging
from dotenv import load_dotenv

try:
    from deepgram import DeepgramClient, PrerecordedOptions, FileSource
except ImportError:
    from deepgram import DeepgramClient, AsyncDeepgramClient
    PrerecordedOptions = dict
    FileSource = dict

load_dotenv()

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

def get_deepgram_client():
    """
    Initialize and return Deepgram client using DEEPGRAM_API_KEY from environment or .env.
    """
    api_key = os.getenv("DEEPGRAM_API_KEY")
    if not api_key:
        logger.error("DEEPGRAM_API_KEY not found in environment or .env")
        raise RuntimeError("DEEPGRAM_API_KEY is missing in backend/.env")
    
    try:
        return AsyncDeepgramClient(api_key=api_key)
    except NameError:
        return DeepgramClient(api_key=api_key)


async def transcribe_audio_bytes(audio_bytes: bytes, language: str = "English") -> str:
    """
    Transcribe audio bytes using Deepgram SDK.
    Supports English, Telugu, Hindi, Tamil, Kannada, Bengali, Marathi via nova-3 / nova-2.
    """
    api_key = os.getenv("DEEPGRAM_API_KEY")
    if not api_key:
        logger.error("Cannot transcribe: DEEPGRAM_API_KEY is not configured.")
        raise RuntimeError("DEEPGRAM_API_KEY is missing in backend/.env")

    if not audio_bytes or len(audio_bytes) < 50:
        logger.warning("Received empty or insufficient audio payload.")
        return ""

    client = get_deepgram_client()
    lang_code = LANGUAGE_MAP.get(language.lower(), "en") if language else "en"

    models_to_try = ["nova-3", "nova-2", "general"]
    last_exception = None

    for model_name in models_to_try:
        try:
            if hasattr(client.listen, "asyncrest") and hasattr(client.listen.asyncrest, "v"):
                payload = {"buffer": audio_bytes}
                options = {"model": model_name, "smart_format": True, "punctuate": True, "language": lang_code}
                response = await client.listen.asyncrest.v("1").analyze_file(payload, options)
            elif hasattr(client.listen, "v1") and hasattr(client.listen.v1, "media"):
                response = await client.listen.v1.media.transcribe_file(
                    request=audio_bytes,
                    model=model_name,
                    smart_format=True,
                    punctuate=True,
                    language=lang_code,
                )
            elif hasattr(client, "listen") and hasattr(client.listen, "prerecorded"):
                source = {"buffer": audio_bytes, "mimetype": "audio/webm"}
                options = {"model": model_name, "smart_format": True, "punctuate": True, "language": lang_code}
                response = await client.listen.prerecorded.v("1").transcribe_file(source, options)
            else:
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
            elif isinstance(response, dict):
                results = response.get("results", {})
                channels = results.get("channels", [])
                if channels and len(channels) > 0:
                    alts = channels[0].get("alternatives", [])
                    if alts and len(alts) > 0:
                        transcript = alts[0].get("transcript", "")

            return transcript.strip()
        except Exception as e:
            last_exception = e
            err_str = str(e)
            if "model" in err_str.lower() or "language" in err_str.lower():
                logger.warning(f"Deepgram model '{model_name}' failed for lang '{lang_code}': {err_str}. Retrying next model...")
                continue
            logger.error(f"Deepgram transcription error ({model_name}, {lang_code}): {err_str}")
            raise e

    if last_exception:
        raise last_exception
    return ""
