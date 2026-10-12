import os
from dotenv import load_dotenv
from google import genai
from google.genai.errors import ClientError

# Load environment variables
load_dotenv()

def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError(
            "GEMINI_API_KEY environment variable is not set. "
            "Please add this environment variable in your deployment configuration."
        )
    return genai.Client(api_key=api_key)


PREFERRED_GEMINI_MODELS = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]


def generate_summary(transcript: str) -> str:
    prompt = f"""
You are HeritageAI, an AI assistant that preserves traditional knowledge.

Analyze the interview transcript below and generate:

1. Summary
2. Key Cultural Knowledge
3. Traditions Mentioned
4. Tags (comma-separated)

Transcript:
{transcript}
"""

    try:
        client = get_gemini_client()
        for model_name in PREFERRED_GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as model_err:
                print(f"Gemini API model {model_name} warning: {model_err}")
                continue
        return "Failed to generate summary with Gemini."
    except Exception as e:
        print(f"Summary error: {e}")
        return f"Oral History Preserved: {transcript[:200]}..."