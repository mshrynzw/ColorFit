from fastapi.testclient import TestClient

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
    assert "openapi" not in docs.text.lower() or docs.headers["content-type"].startswith(
        "application/json"
    )
