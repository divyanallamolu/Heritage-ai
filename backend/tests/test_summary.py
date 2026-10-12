import pytest
from app.services.gemini_service import generate_summary


def test_generate_summary_output():
    transcript = (
        "My grandmother taught me how to make traditional ragi mudde with spicy natukodi pulusu. "
        "During Sankranti festival, the entire village in Chittoor gathered to sing folk songs and prepare sweets."
    )
    summary = generate_summary(transcript)
    assert isinstance(summary, str)
    assert len(summary) > 30
