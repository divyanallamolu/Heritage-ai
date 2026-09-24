import os
from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")

_groq_client: AsyncGroq | None = None

def get_groq_client() -> AsyncGroq:
    """
    Singleton factory for AsyncGroq client.
    """
    global _groq_client
    if not GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY not found in .env environment variables.")
    if _groq_client is None:
        _groq_client = AsyncGroq(api_key=GROQ_API_KEY)
    return _groq_client


async def get_groq_response_async(prompt: str, system_prompt: str | None = None) -> str:
    """
    Query Groq LLM asynchronously for conversational voice & text AI.
    """
    if not GROQ_API_KEY:
        return "Groq API key is missing from backend/.env."

    client = get_groq_client()
    default_system = (
        "You are HeritageAI Voice Assistant. You help preserve oral traditions, "
        "elder knowledge, folk songs, local recipes, and cultural stories. "
        "Respond warmly, concisely, and naturally for spoken conversation."
    )

    messages = [
        {"role": "system", "content": system_prompt or default_system},
        {"role": "user", "content": prompt},
    ]

    try:
        completion = await client.chat.completions.create(
            model=GROQ_MODEL,
            messages=messages,
            temperature=0.7,
            max_tokens=500,
        )
        return completion.choices[0].message.content or ""
    except Exception as e:
        print(f"Groq API error: {e}")
        return f"Error communicating with Groq AI: {str(e)}"
