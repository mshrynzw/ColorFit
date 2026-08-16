from fastapi.testclient import TestClient
from pytest import raises

from app.core.config import get_settings
from app.core.exceptions import ErrorCode
from app.core.request_context import REQUEST_ID_HEADER
from app.main import create_app


def test_unknown_path_returns_unified_not_found(client: TestClient) -> None:
    response = client.get("/does-not-exist")

    assert response.status_code == 404
    body = response.json()["error"]
    assert body["code"] == ErrorCode.NOT_FOUND
    assert body["message"] == "指定されたリソースが見つかりません。"
    assert body["requestId"]
    assert response.headers[REQUEST_ID_HEADER]


def test_internal_error_hides_exception_details() -> None:
    test_app = create_app()

    @test_app.get("/__test/boom")
    def boom() -> None:
        raise RuntimeError("do not leak this")

    response = TestClient(test_app, raise_server_exceptions=False).get("/__test/boom")

    assert response.status_code == 500
    body = response.json()["error"]
    assert body["code"] == ErrorCode.INTERNAL_SERVER_ERROR
    assert "do not leak this" not in response.text
    assert "RuntimeError" not in response.text
    assert REQUEST_ID_HEADER in response.headers


def test_production_hides_openapi(monkeypatch) -> None:
    monkeypatch.setenv("APP_ENV", "production")
    get_settings.cache_clear()
    try:
        response = TestClient(create_app()).get("/openapi.json")
        docs = TestClient(create_app()).get("/docs")
    finally:
        get_settings.cache_clear()

    assert response.status_code == 404
    assert docs.status_code == 404
    assert "swagger" not in response.text.lower()
    content_type = docs.headers["content-type"]
    assert "openapi" not in docs.text.lower() or content_type.startswith(
        "application/json"
    )


def test_production_requires_cors_origins(monkeypatch) -> None:
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("CORS_ORIGINS", "")
    get_settings.cache_clear()
    try:
        with raises(RuntimeError, match="CORS_ORIGINS"):
            create_app()
    finally:
        get_settings.cache_clear()


def test_production_requires_r2_credentials(monkeypatch) -> None:
    monkeypatch.setenv("APP_ENV", "production")
    monkeypatch.setenv("STORAGE_BACKEND", "r2")
    monkeypatch.setenv("R2_ENDPOINT", "")
    monkeypatch.setenv("R2_ACCESS_KEY_ID", "")
    monkeypatch.setenv("R2_SECRET_ACCESS_KEY", "")
    monkeypatch.setenv("R2_BUCKET_NAME", "")
    get_settings.cache_clear()
    try:
        with raises(RuntimeError, match="R2"):
            create_app()
    finally:
        get_settings.cache_clear()
