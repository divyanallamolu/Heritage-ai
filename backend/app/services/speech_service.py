import os
import subprocess
import tempfile

from faster_whisper import WhisperModel

# --------------------------------------------------
# Lazy-load Whisper model
# Prevents Render from loading the model at startup.
# --------------------------------------------------
model = None


def get_model():
    global model

    if model is None:
        model = WhisperModel(
            "tiny",              # Use tiny for Render Free
            device="cpu",
            compute_type="int8",
        )

    return model


# Supported languages
LANGUAGE_MAP = {
    "English": "en",
    "Telugu": "te",
    "Hindi": "hi",
    "Tamil": "ta",
    "Kannada": "kn",
}


def convert_to_wav(input_path: str) -> str:
    """
    Convert uploaded audio into
    16kHz mono PCM WAV.
    """

    output_path = input_path + "_converted.wav"

    result = subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            input_path,
            "-ar",
            "16000",
            "-ac",
            "1",
            "-c:a",
            "pcm_s16le",
            output_path,
        ],
        capture_output=True,
    )

    if result.returncode != 0:
        raise RuntimeError(
            f"FFmpeg conversion failed:\n{result.stderr.decode(errors='ignore')}"
        )

    return output_path


def transcribe_audio(
    audio_bytes: bytes,
    mime_type: str,
    language: str,
) -> str:
    """
    Transcribe uploaded audio using Faster-Whisper.
    """

    if not audio_bytes:
        return ""

    # Decide temp extension
    suffix = ".webm"

    if "wav" in mime_type:
        suffix = ".wav"

    elif "mp3" in mime_type or "mpeg" in mime_type:
        suffix = ".mp3"

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=suffix,
    ) as temp_audio:
        temp_audio.write(audio_bytes)
        raw_path = temp_audio.name

    wav_path = None

    try:

        wav_path = convert_to_wav(raw_path)

        language_code = LANGUAGE_MAP.get(language, "en")

        # Lazy-load Whisper model only when needed
        whisper_model = get_model()

        segments, info = whisper_model.transcribe(
            wav_path,
            language=language_code,
            beam_size=3,
            temperature=0.0,
            condition_on_previous_text=False,
            vad_filter=True,
            vad_parameters={
                "min_silence_duration_ms": 500
            },
        )

        transcript = " ".join(
            segment.text
            for segment in segments
        )

        return transcript.strip()

    finally:

        if os.path.exists(raw_path):
            os.remove(raw_path)

        if wav_path and os.path.exists(wav_path):
            os.remove(wav_path)