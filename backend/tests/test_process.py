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


VALID_BODY = {
    "palette": [
        {"name": "primary", "color": "#1E3A5F", "ratio": 60},
        {"name": "secondary", "color": "#D8B26E", "ratio": 30},
        {"name": "accent", "color": "#F5F1E8", "ratio": 10},
    ],
    "strength": 0.7,
}


def _solid_png(color: tuple[int, int, int], size: tuple[int, int] = (16, 16)) -> bytes:
    image = Image.new("RGB", size, color)
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def _upload(client: TestClient, color: tuple[int, int, int] = (220, 30, 30)) -> str:
    response = client.post(
        "/api/images",
        files={"file": ("sample.png", _solid_png(color), "image/png")},
    )
    assert response.status_code == 201
    return response.json()["image"]["id"]


def test_process_returns_completed_result(image_client: TestClient) -> None:
    image_id = _upload(image_client)
    response = image_client.post(f"/api/images/{image_id}/process", json=VALID_BODY)

    assert response.status_code == 200
    result = response.json()["result"]
    assert result["imageId"] == image_id
    assert result["status"] == "completed"
    assert result["resultUrl"] == f"/api/images/{image_id}/result"

    fetched = image_client.get(f"/api/images/{image_id}/result")
    assert fetched.status_code == 200
    assert fetched.json()["result"]["resultUrl"] == f"/api/images/{image_id}/download"

    info = image_client.get(f"/api/images/{image_id}")
    assert info.json()["image"]["status"] == "completed"

    download = image_client.get(f"/api/images/{image_id}/download")
    assert download.status_code == 200
    assert download.headers["content-type"].startswith("image/webp")
    assert "colorfit-result.webp" in download.headers["content-disposition"]
    assert download.content != _solid_png((220, 30, 30))


def test_process_rejects_invalid_ratio(image_client: TestClient) -> None:
    image_id = _upload(image_client)
    body = {
        "palette": [
            {"name": "primary", "color": "#1E3A5F", "ratio": 80},
            {"name": "secondary", "color": "#D8B26E", "ratio": 30},
            {"name": "accent", "color": "#F5F1E8", "ratio": 10},
        ],
        "strength": 0.5,
    }
    response = image_client.post(f"/api/images/{image_id}/process", json=body)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == ErrorCode.INVALID_RATIO


def test_process_unknown_image_is_not_found(image_client: TestClient) -> None:
    response = image_client.post(
        "/api/images/550e8400-e29b-41d4-a716-446655440000/process",
        json=VALID_BODY,
    )
    assert response.status_code == 404
    assert response.json()["error"]["code"] == ErrorCode.IMAGE_NOT_FOUND


def test_get_result_before_process_is_not_found(image_client: TestClient) -> None:
    image_id = _upload(image_client)
    response = image_client.get(f"/api/images/{image_id}/result")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == ErrorCode.IMAGE_NOT_FOUND


def test_strength_zero_keeps_average_color(image_client: TestClient) -> None:
    image_id = _upload(image_client, (12, 34, 56))
    body = {**VALID_BODY, "strength": 0}
    processed = image_client.post(f"/api/images/{image_id}/process", json=body)
    assert processed.status_code == 200
    download = image_client.get(f"/api/images/{image_id}/download")
    image = Image.open(BytesIO(download.content)).convert("RGB")
    mean = image.resize((1, 1)).getpixel((0, 0))
    assert abs(mean[0] - 12) < 8
    assert abs(mean[1] - 34) < 8
    assert abs(mean[2] - 56) < 8
