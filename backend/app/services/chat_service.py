import os
from dotenv import load_dotenv
from google import genai
from sqlalchemy.orm import Session

from app.models.interview import Interview

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=api_key)

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
        return candidates[:top_n]  # return default set if empty

    scored = [(interview, score_interview(interview, search_terms)) for interview in candidates]
    relevant = [item for item in scored if item[1] > 0]
    
    # If no records scored hits, return top mock archives matching general terms
    if not relevant:
        return MOCK_ARCHIVES[:top_n]

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
        return "No matching interviews were found in the Heritage Library."

    context_parts = ["Heritage Library Context\n"]
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


def generate_chat_response(db: Session, message: str) -> str:
    relevant_interviews = search_relevant_interviews(db, message)
    context = build_context(relevant_interviews)

    prompt = f"""You are HeritageAI, a warm, knowledgeable cultural heritage research assistant.
    
    Answer using the Heritage Library context below. If the user's question relates to these local elder recordings, explain details directly from the stories, citing the elder names and locations.
    
    If the context does not contain direct answers to the user's prompt (e.g. they ask about a general festival or recipe not documented in the archives yet), search your broad general knowledge about Indian heritage and traditions to answer them. In this case, prefix your answer with a polite, warm sentence noting that while you couldn't find a direct recording matching this in the local database, you can share general details about the tradition.
    
    Maintain a warm, storytelling tone that shows deep respect for traditional culture and elders.
    
    {context}
    
    User question: {message}
    """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
    )

    response_text = response.text
    return response_text.strip() if response_text else "I couldn't generate a response. Please try again."