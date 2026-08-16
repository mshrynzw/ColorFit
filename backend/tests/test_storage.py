from pathlib import Path

import pytest

from app.core.exceptions import AppError, ErrorCode
from app.storage.keys import original_key
from app.storage.local import LocalStorage


def test_local_storage_round_trip(tmp_path: Path) -> None:
    storage = LocalStorage(str(tmp_path / "storage"))
    key = original_key("550e8400-e29b-41d4-a716-446655440000")
    storage.put(key, b"payload", "image/png")

    assert storage.exists(key)
    assert storage.get(key) == b"payload"

    storage.delete(key)
    assert not storage.exists(key)


def test_local_storage_rejects_path_traversal(tmp_path: Path) -> None:
    storage = LocalStorage(str(tmp_path / "storage"))

    with pytest.raises(AppError) as exc_info:
        storage.put("../secret", b"nope", "text/plain")

    assert exc_info.value.code == ErrorCode.INVALID_REQUEST
    assert not list(tmp_path.rglob("secret"))


def test_local_storage_rejects_nested_path_traversal(tmp_path: Path) -> None:
    storage = LocalStorage(str(tmp_path / "storage"))

    with pytest.raises(AppError) as exc_info:
        storage.get("images/../../../secret")

    assert exc_info.value.code == ErrorCode.INVALID_REQUEST
    assert not (tmp_path / "secret").exists()


def test_local_storage_missing_object_is_not_found(tmp_path: Path) -> None:
    storage = LocalStorage(str(tmp_path / "storage"))
    with pytest.raises(AppError) as exc_info:
        storage.get(original_key("550e8400-e29b-41d4-a716-446655440000"))
    assert exc_info.value.code == ErrorCode.IMAGE_NOT_FOUND
