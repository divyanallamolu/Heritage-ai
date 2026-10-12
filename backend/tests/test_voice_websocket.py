import pytest
import json
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient
from app.main import app


def test_http_voice_transcribe_empty():
    client = TestClient(app)
    response = client.post("/voice/transcribe", files={"audio": ("empty.webm", b"", "audio/webm")})
    assert response.status_code == 400


def test_websocket_endpoint_registration():
    # Verify /ws/voice is an active registered route in FastAPI app
    route_paths = [r.path for r in app.routes]
    assert "/ws/voice" in route_paths


def test_websocket_missing_api_key():
    client = TestClient(app)
    with patch.dict("os.environ", {"DEEPGRAM_API_KEY": ""}, clear=False):
        with client.websocket_connect("/ws/voice") as ws:
            msg = ws.receive_json()
            assert msg.get("type") == "error"
            assert "not configured" in msg.get("message")


def test_websocket_mocked_deepgram_session():
    """
    Test the complete WebSocket streaming lifecycle with mocked Deepgram connection:
    1. Connect to /ws/voice?language=Telugu
    2. Receive 'ready' event
    3. Stream binary audio chunk
    4. Receive interim (is_final=False) transcript
    5. Receive finalized (is_final=True) transcript
    6. Send 'stop' and receive 'session_ended'
    """
    client = TestClient(app)

    # Mock Deepgram WebSocket
    class MockDeepgramSocket:
        def __init__(self):
            self.sent_messages = []
            self.closed = False

        async def send(self, data):
            self.sent_messages.append(data)

        async def close(self):
            self.closed = True

        def __aiter__(self):
            return self

        async def __anext__(self):
            if not hasattr(self, "_step"):
                self._step = 0
            self._step += 1
            if self._step == 1:
                return json.dumps({
                    "type": "Results",
                    "is_final": False,
                    "speech_final": False,
                    "channel": {
                        "alternatives": [{"transcript": "నమస్కారం"}]
                    }
                })
            elif self._step == 2:
                return json.dumps({
                    "type": "Results",
                    "is_final": True,
                    "speech_final": True,
                    "channel": {
                        "alternatives": [{"transcript": "నమస్కారం బాగున్నారా"}]
                    }
                })
            else:
                # Keep open or pause
                import asyncio
                await asyncio.sleep(5)
                raise StopAsyncIteration

    mock_dg = MockDeepgramSocket()

    with patch("websockets.connect", new_callable=AsyncMock) as mock_connect:
        mock_connect.return_value = mock_dg

        with client.websocket_connect("/ws/voice?language=Telugu") as ws:
            # 1. First message from server must be ready
            ready_msg = ws.receive_json()
            assert ready_msg.get("type") == "ready"
            assert ready_msg.get("lang_code") == "te"

            # 2. Receive interim transcript
            interim_msg = ws.receive_json()
            assert interim_msg.get("type") == "transcript"
            assert interim_msg.get("is_final") is False
            assert "నమస్కారం" in interim_msg.get("text")

            # 3. Receive finalized transcript
            final_msg = ws.receive_json()
            assert final_msg.get("type") == "transcript"
            assert final_msg.get("is_final") is True
            assert "నమస్కారం బాగున్నారా" in final_msg.get("text")

            # 4. Send binary audio chunk
            ws.send_bytes(b"\x1aE\xdf\xa3fake-webm-audio")

            # 5. Send stop message
            ws.send_json({"type": "stop"})
            session_ended_msg = ws.receive_json()
            assert session_ended_msg.get("type") == "session_ended"
