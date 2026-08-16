from fastapi.testclient import TestClient


def test_allows_configured_frontend_origin(client: TestClient) -> None:
    response = client.get(
        "/health",
        headers={"Origin": "http://localhost:5173"},
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"
