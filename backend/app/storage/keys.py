from uuid import UUID

from app.core.exceptions import AppError, ErrorCode

ORIGINAL_OBJECT = "original"
PROCESSED_OBJECT = "processed"
META_OBJECT = "meta.json"


def parse_image_id(raw: str) -> str:
    try:
        return str(UUID(raw))
    except ValueError as exc:
        raise AppError(
            ErrorCode.INVALID_REQUEST,
            "画像IDの形式が正しくありません。",
            400,
        ) from exc


def original_key(image_id: str) -> str:
    return f"images/{image_id}/{ORIGINAL_OBJECT}"


def processed_key(image_id: str) -> str:
    return f"images/{image_id}/{PROCESSED_OBJECT}"


def meta_key(image_id: str) -> str:
    return f"images/{image_id}/{META_OBJECT}"
