import json
from io import BytesIO

from fastapi.testclient import TestClient
from PIL import Image
from pytest import fixture

from app.core.config import get_settings
from app.core.exceptions import ErrorCode
from app.main import create_app
from app.storage.factory import get_storage_backend


@fixture
def image_client(tmp_path, monkeypatch) -> TestClient:
    monkeypatch.setenv("STORAGE_BACKEND", "local")
    monkeypatch.setenv("STORAGE_LOCAL_PATH", str(tmp_path / "storage"))
    monkeypatch.setenv("IMAGE_TTL_HOURS", "24")
    get_settings.cache_clear()
    get_storage_backend.cache_clear()
    try:
        yield TestClient(create_app())
    finally:
        get_settings.cache_clear()
        get_storage_backend.cache_clear()


def _image_bytes(fmt: str = "PNG", size: tuple[int, int] = (32, 24)) -> bytes:
    image = Image.new("RGB", size, (12, 34, 56))
    buffer = BytesIO()
    image.save(buffer, format=fmt)
    return buffer.getvalue()


def test_upload_get_download_delete_png(image_client: TestClient) -> None:
    payload = _image_bytes("PNG", (32, 24))

    upload = image_client.post(
        "/api/images",
        files={"file": ("sample.png", payload, "image/png")},
    )
    assert upload.status_code == 201
    image = upload.json()["image"]
    image_id = image["id"]
    assert image["filename"] == "sample.png"
    assert image["mimeType"] == "image/png"
    assert image["fileSize"] == len(payload)
    assert image["width"] == 32
    assert image["height"] == 24
    assert "status" not in image

    info = image_client.get(f"/api/images/{image_id}")
    assert info.status_code == 200
    detail = info.json()["image"]
    assert detail["id"] == image_id
    assert detail["status"] == "uploaded"
    assert detail["mimeType"] == "image/png"

    download = image_client.get(f"/api/images/{image_id}/download")
    assert download.status_code == 200
    assert download.content == payload
    assert download.headers["content-type"].startswith("image/png")
    assert "sample.png" in download.headers["content-disposition"]

    deleted = image_client.delete(f"/api/images/{image_id}")
    assert deleted.status_code == 204
    assert deleted.content == b""

    missing = image_client.get(f"/api/images/{image_id}")
    assert missing.status_code == 404
    assert missing.json()["error"]["code"] == ErrorCode.IMAGE_NOT_FOUND

    deleted_again = image_client.delete(f"/api/images/{image_id}")
    assert deleted_again.status_code == 204


def test_upload_jpeg_and_webp(image_client: TestClient) -> None:
    jpeg = image_client.post(
        "/api/images",
        files={"file": ("photo.jpg", _image_bytes("JPEG"), "image/jpeg")},
    )
    assert jpeg.status_code == 201
    assert jpeg.json()["image"]["mimeType"] == "image/jpeg"

    webp = image_client.post(
        "/api/images",
        files={"file": ("photo.webp", _image_bytes("WEBP"), "image/webp")},
    )
    assert webp.status_code == 201
    assert webp.json()["image"]["mimeType"] == "image/webp"


def test_upload_rejects_missing_file(image_client: TestClient) -> None:
    response = image_client.post("/api/images")
    assert response.status_code in {400, 422}
    assert response.json()["error"]["code"] in {
        ErrorCode.INVALID_FILE,
        ErrorCode.INVALID_REQUEST,
    }


def test_upload_rejects_empty_file(image_client: TestClient) -> None:
    response = image_client.post(
        "/api/images",
        files={"file": ("empty.png", b"", "image/png")},
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == ErrorCode.INVALID_FILE


def test_upload_rejects_oversized_file(
    image_client: TestClient,
    monkeypatch,
) -> None:
    monkeypatch.setenv("MAX_UPLOAD_SIZE", "16")
    get_settings.cache_clear()
    response = image_client.post(
        "/api/images",
        files={"file": ("big.png", _image_bytes("PNG"), "image/png")},
    )
    get_settings.cache_clear()
    assert response.status_code == 413
    assert response.json()["error"]["code"] == ErrorCode.FILE_TOO_LARGE


def test_upload_rejects_unsupported_format(image_client: TestClient) -> None:
    gif = _image_bytes("GIF")
    response = image_client.post(
        "/api/images",
        files={"file": ("anim.gif", gif, "image/gif")},
    )
    assert response.status_code == 415
    assert response.json()["error"]["code"] == ErrorCode.UNSUPPORTED_IMAGE_FORMAT


def test_upload_rejects_mime_signature_mismatch(image_client: TestClient) -> None:
    response = image_client.post(
        "/api/images",
        files={"file": ("fake.jpg", _image_bytes("PNG"), "image/jpeg")},
    )
    assert response.status_code == 415
    assert response.json()["error"]["code"] == ErrorCode.UNSUPPORTED_IMAGE_FORMAT


def test_upload_rejects_broken_png(image_client: TestClient) -> None:
    payload = _image_bytes("PNG")[:20]
    response = image_client.post(
        "/api/images",
        files={"file": ("broken.png", payload, "image/png")},
    )
    assert response.status_code == 422
    assert response.json()["error"]["code"] == ErrorCode.IMAGE_DECODE_FAILED


def test_upload_rejects_dimensions_too_large(
    image_client: TestClient,
    monkeypatch,
) -> None:
    monkeypatch.setenv("MAX_IMAGE_WIDTH", "10")
    monkeypatch.setenv("MAX_IMAGE_HEIGHT", "10")
    get_settings.cache_clear()
    response = image_client.post(
        "/api/images",
        files={"file": ("wide.png", _image_bytes("PNG", (32, 8)), "image/png")},
    )
    get_settings.cache_clear()
    assert response.status_code == 422
    assert response.json()["error"]["code"] == ErrorCode.IMAGE_DIMENSIONS_TOO_LARGE


def test_upload_sanitizes_path_filename(image_client: TestClient) -> None:
    payload = _image_bytes("PNG")
    response = image_client.post(
        "/api/images",
        files={"file": ("../../secret.png", payload, "image/png")},
    )
    assert response.status_code == 201
    assert response.json()["image"]["filename"] == "secret.png"


def test_get_rejects_invalid_image_id(image_client: TestClient) -> None:
    response = image_client.get("/api/images/not-a-uuid")
    assert response.status_code == 400
    assert response.json()["error"]["code"] == ErrorCode.INVALID_REQUEST


def test_get_unknown_image_returns_not_found(image_client: TestClient) -> None:
    response = image_client.get("/api/images/550e8400-e29b-41d4-a716-446655440000")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == ErrorCode.IMAGE_NOT_FOUND


def test_expired_image_is_removed(image_client: TestClient, tmp_path) -> None:
    payload = _image_bytes("PNG")
    upload = image_client.post(
        "/api/images",
        files={"file": ("old.png", payload, "image/png")},
    )
    image_id = upload.json()["image"]["id"]
    meta_path = tmp_path / "storage" / "images" / image_id / "meta.json"
    meta = json.loads(meta_path.read_text(encoding="utf-8"))
    meta["createdAt"] = "2000-01-01T00:00:00+00:00"
    meta_path.write_text(json.dumps(meta), encoding="utf-8")

    response = image_client.get(f"/api/images/{image_id}")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == ErrorCode.IMAGE_NOT_FOUND
    assert not meta_path.exists()
