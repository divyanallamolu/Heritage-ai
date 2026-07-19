import os
from dotenv import load_dotenv
from google import genai
from google.genai.errors import ClientError

# Load environment variables
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY not found in .env")

client = genai.Client(api_key=api_key)


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
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
        )

        return response.text or "No summary generated."

    except ClientError:
        return "oh noo we are out of gemini keys..."