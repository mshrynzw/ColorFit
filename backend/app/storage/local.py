from pathlib import Path

from app.core.exceptions import AppError, ErrorCode


class LocalStorage:
    def __init__(self, root: str) -> None:
        self.root = Path(root).resolve()
        self.root.mkdir(parents=True, exist_ok=True)

    def put(self, key: str, data: bytes, content_type: str) -> None:
        path = self._resolve(key)
        try:
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_bytes(data)
        except OSError as exc:
            raise AppError(
                ErrorCode.STORAGE_UPLOAD_FAILED,
                "画像を保存できませんでした。",
                503,
            ) from exc

    def get(self, key: str) -> bytes:
        path = self._resolve(key)
        try:
            return path.read_bytes()
        except FileNotFoundError as exc:
            raise AppError(
                ErrorCode.IMAGE_NOT_FOUND,
                "画像が見つかりません。",
                404,
            ) from exc
        except OSError as exc:
            raise AppError(
                ErrorCode.STORAGE_DOWNLOAD_FAILED,
                "画像を取得できませんでした。",
                503,
            ) from exc

    def delete(self, key: str) -> None:
        path = self._resolve(key)
        try:
            path.unlink(missing_ok=True)
        except OSError as exc:
            raise AppError(
                ErrorCode.STORAGE_DELETE_FAILED,
                "画像を削除できませんでした。",
                503,
            ) from exc

    def exists(self, key: str) -> bool:
        return self._resolve(key).is_file()

    def _resolve(self, key: str) -> Path:
        parts = [part for part in key.split("/") if part]
        if not parts or any(part in {".", ".."} for part in parts):
            raise AppError(
                ErrorCode.INVALID_REQUEST,
                "不正なファイルパスです。",
                400,
            )
        path = self.root.joinpath(*parts).resolve()
        try:
            path.relative_to(self.root)
        except ValueError as exc:
            raise AppError(
                ErrorCode.INVALID_REQUEST,
                "不正なファイルパスです。",
                400,
            ) from exc
        return path
