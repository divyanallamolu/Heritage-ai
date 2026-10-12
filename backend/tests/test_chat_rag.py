import pytest
from app.database import SessionLocal
from app.models.interview import Interview
from app.utils.services.chat_service import (
    search_relevant_interviews,
    build_context,
    generate_chat_response,
    generate_knowledge_vault_fallback,
    expand_query_terms,
)


@pytest.fixture
def db_session():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def test_query_term_expansion():
    terms = expand_query_terms("tell me about weaving traditions and recipes")
    assert "weaving" in terms or "handloom" in terms
    assert "recipe" in terms or "cooking" in terms


def test_search_relevant_interviews_matching(db_session):
    # Search for weaving craft
    results = search_relevant_interviews(db_session, "weaving silk sarees", top_n=3)
    assert len(results) > 0
    names = [r.elder_name for r in results]
    assert "Lakshmi Devi" in names


def test_search_relevant_interviews_herbal_medicine(db_session):
    # Search for herbal remedies
    results = search_relevant_interviews(db_session, "indigenous herbal medicine for broken bones", top_n=3)
    assert len(results) > 0
    names = [r.elder_name for r in results]
    assert "Thatha Venkataswamy" in names


def test_search_relevant_interviews_irrelevant_query(db_session):
    # Irrelevant query should return empty list
    results = search_relevant_interviews(db_session, "quantum computing semiconductor photolithography", top_n=3)
    assert results == []


def test_build_context_with_records(db_session):
    records = search_relevant_interviews(db_session, "weaving", top_n=2)
    context = build_context(records)
    assert "Heritage Library Context" in context
    assert "Lakshmi Devi" in context


def test_build_context_empty():
    context = build_context([])
    assert "No matching interviews were found" in context


def test_knowledge_vault_fallback_empty():
    fallback = generate_knowledge_vault_fallback([], "test query")
    assert "could not find a direct matching oral history" in fallback


def test_knowledge_vault_fallback_with_records(db_session):
    records = search_relevant_interviews(db_session, "weaving", top_n=2)
    fallback = generate_knowledge_vault_fallback(records, "weaving")
    assert "Lakshmi Devi" in fallback


def test_generate_chat_response_structure(db_session):
    answer = generate_chat_response(db_session, "Tell me about traditional silk weaving.")
    assert isinstance(answer, str)
    assert len(answer) > 20
