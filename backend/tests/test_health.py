from fastapi.testclient import TestClient

from app.core.request_context import REQUEST_ID_HEADER


def test_health_returns_ok(client: TestClient) -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
    assert REQUEST_ID_HEADER in response.headers
