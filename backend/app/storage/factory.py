from functools import lru_cache

from app.core.config import get_settings
from app.core.exceptions import AppError, ErrorCode
from app.storage.base import StorageBackend
from app.storage.local import LocalStorage


@lru_cache
def get_storage_backend() -> StorageBackend:
    settings = get_settings()
    backend = settings.storage_backend.strip().lower()
    if backend == "r2":
        from app.storage.r2 import R2Storage

        return R2Storage(
            endpoint=settings.r2_endpoint,
            access_key_id=settings.r2_access_key_id,
            secret_access_key=settings.r2_secret_access_key,
            bucket_name=settings.r2_bucket_name,
        )
    if backend == "local":
        return LocalStorage(settings.storage_local_path)
    raise AppError(
        ErrorCode.STORAGE_CONNECTION_FAILED,
        "画像を保存できませんでした。",
        503,
    )
