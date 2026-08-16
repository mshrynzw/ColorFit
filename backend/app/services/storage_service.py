from app.core.exceptions import AppError, ErrorCode
from app.storage.base import StorageBackend
from app.storage.keys import meta_key, original_key, processed_key


class StorageService:
    def __init__(self, backend: StorageBackend) -> None:
        self.backend = backend

    def put(self, key: str, data: bytes, content_type: str) -> None:
        try:
            self.backend.put(key, data, content_type)
        except AppError:
            raise
        except Exception as exc:
            raise AppError(
                ErrorCode.STORAGE_UPLOAD_FAILED,
                "画像を保存できませんでした。",
                503,
            ) from exc

    def get(self, key: str) -> bytes:
        try:
            return self.backend.get(key)
        except AppError:
            raise
        except Exception as exc:
            raise AppError(
                ErrorCode.STORAGE_DOWNLOAD_FAILED,
                "画像を取得できませんでした。",
                503,
            ) from exc

    def delete(self, key: str) -> None:
        try:
            self.backend.delete(key)
        except AppError:
            raise
        except Exception as exc:
            raise AppError(
                ErrorCode.STORAGE_DELETE_FAILED,
                "画像を削除できませんでした。",
                503,
            ) from exc

    def exists(self, key: str) -> bool:
        try:
            return self.backend.exists(key)
        except AppError:
            raise
        except Exception as exc:
            raise AppError(
                ErrorCode.STORAGE_DOWNLOAD_FAILED,
                "画像を取得できませんでした。",
                503,
            ) from exc

    def delete_image(self, image_id: str) -> None:
        self.delete(original_key(image_id))
        self.delete(processed_key(image_id))
        self.delete(meta_key(image_id))
