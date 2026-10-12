import os
from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session
from app.models.interview import Interview

load_dotenv()

PREFERRED_GEMINI_MODELS = [
    "gemini-3.6-flash",
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash",
]


def get_gemini_client():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        return None
    try:
        return genai.Client(api_key=api_key)
    except Exception:
        return None


def generate_knowledge_vault_fallback(interviews: list, message: str) -> str:
    if not interviews:
        return (
            "I searched the Heritage Knowledge Vault for your query, but could not find a direct "
            "matching oral history in our preserved recordings yet. You can explore all published stories in the Heritage Library catalog."
        )

    lines = [
        "Here are the relevant oral recordings preserved in the Heritage Knowledge Vault:\n"
    ]
    for item in interviews[:3]:
        name = safe_text(item.elder_name)
        location = format_location(item)
        summary = safe_text(item.ai_summary) or (safe_text(item.transcript)[:180] + "...")
        loc_str = f" ({location})" if location else ""
        lines.append(f"• **{name}**{loc_str}: {summary}\n")

    lines.append("Explore these complete transcripts and recordings in our Heritage Library.")
    return "\n".join(lines)


def generate_chat_response(db: Session, message: str) -> str:
    relevant_interviews = search_relevant_interviews(db, message)
    context = build_context(relevant_interviews)

    prompt = f"""You are HeritageAI, a warm, knowledgeable cultural heritage research assistant.

{context}

User question: {message}

Instructions:
1. If relevant interviews are present in the Heritage Library Context above, ground your answer in those recordings. Explain details directly from the stories and cite the elder names and locations (e.g., "According to Lakshmi Devi from Dharmavaram...").
2. Do NOT invent elder stories, do NOT hallucinate interview details, and do NOT claim unsupported information came from an interview.
3. If no matching interviews are found in the context, politely and warmly state that there are currently no direct oral recordings on this topic in the local archive, and share respectful general cultural details about the tradition if applicable.
4. Maintain a warm, storytelling tone that honors traditional knowledge and elders.
"""

    client = get_gemini_client()
    if client:
        for model_name in PREFERRED_GEMINI_MODELS:
            try:
                response = client.models.generate_content(
                    model=model_name,
                    contents=prompt,
                )
                if response and response.text and response.text.strip():
                    return response.text.strip()
            except Exception as e:
                print(f"[Gemini Chat Warning] Model {model_name} call failed: {e}")
                continue

    # Graceful fallback: return answer derived directly from Knowledge Vault
    return generate_knowledge_vault_fallback(relevant_interviews, message)


TOPIC_SYNONYMS = {
    "recipe": ["recipe", "food", "cooking", "dish", "pickle", "curry", "rotte", "sangati"],
    "recipes": ["recipe", "food", "cooking", "dish", "pickle", "curry", "rotte", "sangati"],
    "food": ["food", "recipe", "cooking", "dish", "pickle", "curry"],
    "festival": ["festival", "bonalu", "bathukamma", "sankranti", "diwali", "ugadi", "celebration", "puja"],
    "festivals": ["festival", "bonalu", "bathukamma", "sankranti", "diwali", "ugadi", "celebration", "puja"],
    "marriage": ["marriage", "wedding", "bride", "groom", "shaadi"],
    "wedding": ["marriage", "wedding", "bride", "groom", "shaadi"],
    "tradition": ["tradition", "custom", "ritual", "practice"],
    "traditions": ["tradition", "custom", "ritual", "practice"],
    "farming": ["farming", "agriculture", "crop", "field", "pest", "harvest"],
    "medicine": ["medicine", "herbal", "remedy", "healing", "ayurveda"],
    "handicraft": ["handicraft", "weaving", "pottery", "craft", "handloom"],
    "handicrafts": ["handicraft", "weaving", "pottery", "craft", "handloom"],
}


class MockInterviewModel:
    """Wrapper class so dict mock objects behave like SQLAlchemy Interview models."""
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


MOCK_ARCHIVES = [
    MockInterviewModel(
        elder_name="Lakshmi Devi",
        age=82,
        village_or_city="Dharmavaram",
        district="Anantapur",
        state="Andhra Pradesh",
        language="Telugu",
        transcript="My grandfather taught me when I was nine. In those days, we didn't have electric looms. Every thread was spun by hand, and the dyes were made from barks, flowers, and leaves. A single saree would take three weeks of devotion...",
        ai_summary="A master weaver of traditional silk sarees. She shares the folklore of Dharmavaram weaving, the intricate design processes passed down through five generations, and how mechanization is changing the ancient craft."
    ),
    MockInterviewModel(
        elder_name="Thatha Venkataswamy",
        age=79,
        village_or_city="Kodad",
        district="Suryapet",
        state="Telangana",
        language="Telugu",
        transcript="The forest is a mother; she has a cure for every ailment. When my brother fell from a tree and broke his leg, my father did not run to the city. He went to the hills, fetched the 'gandhapu chekka' bark, ground it with goat milk, and bound it...",
        ai_summary="Keeper of ancient herbal medicine recipes. He details recipes for immune strength, respiratory issues, and bone healing using indigenous forest plants native to the Nallamala forest range."
    ),
    MockInterviewModel(
        elder_name="Saraswathi Amma",
        age=85,
        village_or_city="Melattur",
        district="Thanjavur",
        state="Tamil Nadu",
        language="Tamil",
        transcript="These dolls are made of paper pulp and clay from the Cauvery banks. They are balanced so that they dance when the wind blows. It represents how humans should react to life—bend but never lose our balance...",
        ai_summary="Preserving the Thanjavur doll-making tradition and Melattur Bhagavata Mela festival hymns. She sings oral folklore passed down since the Chola dynasty."
    ),
    MockInterviewModel(
        elder_name="Kempegowda Patil",
        age=74,
        village_or_city="Devalapura",
        district="Mandya",
        state="Karnataka",
        language="Kannada",
        transcript="We used to sing while grinding Ragi. It was hard work, but the song made the stone feel light. Our grain was stored in mud pits underground—they stayed cool and dry for ten years without any chemicals...",
        ai_summary="Detailed descriptions of the Ragi harvesting folklore, native songs (Ragi Beeso Hadu), and traditional storage systems called 'Hagevu' built underground."
    ),
    MockInterviewModel(
        elder_name="Rajeshwar Mishra",
        age=88,
        village_or_city="Ayodhya",
        district="Ayodhya",
        state="Uttar Pradesh",
        language="Hindi",
        transcript="The whole village would gather under the banyan tree. There were no microphones or lights—only oil lamps and the power of our voices. The story of Ram is not just a book; it is the rhythm of our daily breath...",
        ai_summary="Recounts the oral history of Ramlila celebrations, ancient hymns, and how stories were historically dramatized across villages during the Dussehra festival."
    )
]


def expand_query_terms(message: str) -> list[str]:
    words = [w.strip(".,?!").lower() for w in message.split() if len(w.strip(".,?!")) > 2]
    expanded_terms = set(words)
    for word in words:
        if word in TOPIC_SYNONYMS:
            expanded_terms.update(TOPIC_SYNONYMS[word])
    return list(expanded_terms)


def safe_text(value) -> str:
    return str(value) if value else ""


def score_interview(interview, search_terms: list[str]) -> int:
    searchable_text = " ".join([
        safe_text(interview.transcript),
        safe_text(interview.ai_summary),
        safe_text(interview.elder_name),
        safe_text(interview.language),
        safe_text(interview.village_or_city),
        safe_text(interview.district),
        safe_text(interview.state),
    ]).lower()

    score = 0
    for term in search_terms:
        score += searchable_text.count(term)
    return score


def search_relevant_interviews(db: Session, message: str, top_n: int = 5) -> list:
    all_interviews = []
    try:
        all_interviews = db.query(Interview).all()
    except Exception:
        pass

    # Merge database records with mock visual archives so they are always searchable
    candidates = list(all_interviews) + MOCK_ARCHIVES
    search_terms = expand_query_terms(message)

    if not search_terms:
        return []

    scored = [(interview, score_interview(interview, search_terms)) for interview in candidates]
    relevant = [item for item in scored if item[1] > 0]
    
    if not relevant:
        return []

    relevant.sort(key=lambda item: item[1], reverse=True)
    return [interview for interview, score in relevant[:top_n]]


def format_location(interview) -> str:
    parts = [
        safe_text(interview.village_or_city),
        safe_text(interview.district),
        safe_text(interview.state),
    ]
    non_empty_parts = [p for p in parts if p]
    return ", ".join(non_empty_parts)


def build_context(interviews: list) -> str:
    if not interviews:
        return "No matching interviews were found in the Heritage Library archive for this query."

    context_parts = ["Heritage Library Context:\n"]
    for index, interview in enumerate(interviews, start=1):
        location = format_location(interview) or "Unknown"
        summary = safe_text(interview.ai_summary) or "No summary available"

        context_parts.append(
            f"Interview {index}\n"
            f"Name: {safe_text(interview.elder_name)}\n"
            f"Age: {interview.age if interview.age is not None else 'Unknown'}\n"
            f"Location: {location}\n"
            f"Language: {safe_text(interview.language)}\n"
            f"Transcript: {safe_text(interview.transcript)}\n"
            f"Summary: {summary}\n"
        )
    return "\n".join(context_parts)