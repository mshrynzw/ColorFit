from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.core.exceptions import ErrorCode
from app.core.rate_limit import match_rate_limit_bucket
from app.main import create_app
from app.storage.factory import get_storage_backend


def test_match_rate_limit_bucket() -> None:
    assert match_rate_limit_bucket("POST", "/api/images") == "upload"
    assert match_rate_limit_bucket("POST", "/api/images/") == "upload"
    assert (
        match_rate_limit_bucket(
            "POST",
            "/api/images/550e8400-e29b-41d4-a716-446655440000/process",
        )
        == "process"
    )
    assert (
        match_rate_limit_bucket(
            "GET",
            "/api/images/550e8400-e29b-41d4-a716-446655440000/download",
        )
        == "download"
    )
    assert match_rate_limit_bucket("GET", "/api/images/abc") is None
    assert match_rate_limit_bucket("OPTIONS", "/api/images") is None


def test_upload_rate_limit_returns_unified_error(tmp_path, monkeypatch) -> None:
    monkeypatch.setenv("STORAGE_BACKEND", "local")
    monkeypatch.setenv("STORAGE_LOCAL_PATH", str(tmp_path / "storage"))
    monkeypatch.setenv("RATE_LIMIT_UPLOAD", "2")
    monkeypatch.setenv("RATE_LIMIT_WINDOW_SECONDS", "60")
    get_settings.cache_clear()
    get_storage_backend.cache_clear()
    try:
        client = TestClient(create_app())
        first = client.post("/api/images")
        second = client.post("/api/images")
        third = client.post("/api/images")
    finally:
        get_settings.cache_clear()
        get_storage_backend.cache_clear()

    assert first.status_code in {400, 422}
    assert second.status_code in {400, 422}
    assert third.status_code == 429
    body = third.json()["error"]
    assert body["code"] == ErrorCode.RATE_LIMIT_EXCEEDED
    assert "リクエスト回数が多すぎます" in body["message"]
    assert "traceback" not in third.text.lower()
