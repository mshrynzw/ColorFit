from fastapi.testclient import TestClient

from app.core.config import get_settings


def test_allows_configured_frontend_origin(client: TestClient) -> None:
    response = client.get(
        "/health",
        headers={"Origin": "http://localhost:5173"},
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_does_not_reflect_unknown_origin(client: TestClient) -> None:
    response = client.get(
        "/health",
        headers={"Origin": "https://evil.example"},
    )

    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers


def test_wildcard_origin_is_ignored(monkeypatch) -> None:
    monkeypatch.setenv("CORS_ORIGINS", "*,http://localhost:5173")
    get_settings.cache_clear()
    try:
        settings = get_settings()
        assert "*" not in settings.cors_origin_list
        assert settings.cors_origin_list == ["http://localhost:5173"]
    finally:
        get_settings.cache_clear()

