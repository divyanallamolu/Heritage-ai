import os
import subprocess
import tempfile

from faster_whisper import WhisperModel

# Initialize the Whisper model once so the service can reuse it across requests.
model = WhisperModel(
    "small",
    device="cpu",
    compute_type="int8",
)

# Map the app's supported UI languages to Whisper language codes.
LANGUAGE_MAP = {
    "English": "en",
    "Telugu": "te",
    "Hindi": "hi",
    "Tamil": "ta",
    "Kannada": "kn",
}


def convert_to_wav(input_path: str) -> str:
    """
    Normalize uploaded audio into a 16kHz mono PCM WAV file for Whisper.
    This keeps the input format consistent regardless of whether the client sends
    webm, mp3, or another browser audio format.
    """
    output_path = input_path + "_converted.wav"

    # Use FFmpeg from PATH to convert the uploaded file into a Whisper-friendly WAV.
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

    if result.returncode != 0 or not os.path.exists(output_path):
        raise RuntimeError(
            f"FFmpeg conversion failed: {result.stderr.decode(errors='ignore')}"
        )

    return output_path


def transcribe_audio(audio_bytes: bytes, mime_type: str, language: str) -> str:
    """
    Convert the uploaded audio into WAV, run Whisper, and return the transcript.
    """
    if not audio_bytes:
        return ""

    # Pick a temporary file suffix based on the incoming MIME type.
    suffix = ".webm"
    if "wav" in mime_type:
        suffix = ".wav"
    elif "mp3" in mime_type or "mpeg" in mime_type:
        suffix = ".mp3"

    # Write the uploaded audio bytes to a temporary file so FFmpeg can read them.
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_audio:
        temp_audio.write(audio_bytes)
        raw_path = temp_audio.name

    wav_path = None
    try:
        # Convert the uploaded file to a clean 16kHz mono WAV for Whisper.
        wav_path = convert_to_wav(raw_path)

        # Convert the UI language to the code Whisper expects.
        language_code = LANGUAGE_MAP.get(language, "en")

        # Run transcription with deterministic settings and VAD to reduce hallucinations.
        segments, _info = model.transcribe(
            wav_path,
            language=language_code,
            beam_size=5,
            temperature=0.0,
            condition_on_previous_text=False,
            vad_filter=True,
            vad_parameters=dict(min_silence_duration_ms=500),
        )

        # Join the transcript segments into one clean string.
        transcript = " ".join(segment.text for segment in segments)
        return transcript.strip()

    finally:
        # Always clean up temporary files so the service stays tidy.
        if os.path.exists(raw_path):
            os.remove(raw_path)
        if wav_path and os.path.exists(wav_path):
            os.remove(wav_path)