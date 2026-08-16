from dataclasses import dataclass
from io import BytesIO

from fastapi import UploadFile
from PIL import Image, UnidentifiedImageError

from app.core.exceptions import AppError, ErrorCode

ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
}

_MAGIC_FORMATS = {
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
}

_PILLOW_FORMATS = {
    "JPEG": "image/jpeg",
    "PNG": "image/png",
    "WEBP": "image/webp",
}

_READ_CHUNK_SIZE = 64 * 1024


@dataclass(frozen=True)
class ValidatedImage:
    data: bytes
    mime_type: str
    width: int
    height: int
    file_size: int


def detect_format_from_signature(data: bytes) -> str | None:
    if data.startswith(b"\xff\xd8\xff"):
        return "jpeg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if len(data) >= 12 and data.startswith(b"RIFF") and data[8:12] == b"WEBP":
        return "webp"
    return None


def normalize_mime_type(content_type: str | None) -> str | None:
    if not content_type:
        return None
    mime = content_type.split(";", 1)[0].strip().lower()
    if mime == "image/jpg":
        return "image/jpeg"
    return mime or None


async def read_upload_limited(file: UploadFile, max_size: int) -> bytes:
    chunks: list[bytes] = []
    size = 0
    while True:
        chunk = await file.read(_READ_CHUNK_SIZE)
        if not chunk:
            break
        size += len(chunk)
        if size > max_size:
            raise AppError(
                ErrorCode.FILE_TOO_LARGE,
                "画像サイズが大きすぎます。",
                413,
            )
        chunks.append(chunk)
    return b"".join(chunks)


def validate_image(
    data: bytes,
    declared_mime: str | None,
    max_width: int,
    max_height: int,
    max_pixel_count: int,
) -> ValidatedImage:
    if not data:
        raise AppError(
            ErrorCode.INVALID_FILE,
            "画像ファイルを指定してください。",
            400,
        )

    signature_format = detect_format_from_signature(data)
    if signature_format is None:
        raise AppError(
            ErrorCode.UNSUPPORTED_IMAGE_FORMAT,
            "対応していない画像形式です。",
            415,
        )

    signature_mime = _MAGIC_FORMATS[signature_format]
    normalized_declared = normalize_mime_type(declared_mime)
    if normalized_declared and normalized_declared not in ALLOWED_MIME_TYPES:
        raise AppError(
            ErrorCode.UNSUPPORTED_IMAGE_FORMAT,
            "対応していない画像形式です。",
            415,
        )
    if normalized_declared and normalized_declared != signature_mime:
        raise AppError(
            ErrorCode.UNSUPPORTED_IMAGE_FORMAT,
            "対応していない画像形式です。",
            415,
        )

    previous_limit = Image.MAX_IMAGE_PIXELS
    Image.MAX_IMAGE_PIXELS = max_pixel_count
    try:
        with Image.open(BytesIO(data)) as image:
            try:
                image.load()
            except Image.DecompressionBombError as exc:
                raise AppError(
                    ErrorCode.IMAGE_DIMENSIONS_TOO_LARGE,
                    "画像の幅または高さが大きすぎます。",
                    422,
                ) from exc
            except OSError as exc:
                raise AppError(
                    ErrorCode.IMAGE_DECODE_FAILED,
                    "画像を読み込めませんでした。",
                    422,
                ) from exc

            pillow_mime = _PILLOW_FORMATS.get(image.format or "")
            if pillow_mime is None:
                raise AppError(
                    ErrorCode.UNSUPPORTED_IMAGE_FORMAT,
                    "対応していない画像形式です。",
                    415,
                )
            if pillow_mime != signature_mime:
                raise AppError(
                    ErrorCode.UNSUPPORTED_IMAGE_FORMAT,
                    "対応していない画像形式です。",
                    415,
                )

            width, height = image.size
    except AppError:
        raise
    except UnidentifiedImageError as exc:
        raise AppError(
            ErrorCode.IMAGE_DECODE_FAILED,
            "画像を読み込めませんでした。",
            422,
        ) from exc
    except Image.DecompressionBombError as exc:
        raise AppError(
            ErrorCode.IMAGE_DIMENSIONS_TOO_LARGE,
            "画像の幅または高さが大きすぎます。",
            422,
        ) from exc
    except OSError as exc:
        raise AppError(
            ErrorCode.IMAGE_DECODE_FAILED,
            "画像を読み込めませんでした。",
            422,
        ) from exc
    finally:
        Image.MAX_IMAGE_PIXELS = previous_limit

    if width > max_width or height > max_height:
        raise AppError(
            ErrorCode.IMAGE_DIMENSIONS_TOO_LARGE,
            "画像の幅または高さが大きすぎます。",
            422,
        )
    if width * height > max_pixel_count:
        raise AppError(
            ErrorCode.IMAGE_DIMENSIONS_TOO_LARGE,
            "画像の幅または高さが大きすぎます。",
            422,
        )

    return ValidatedImage(
        data=data,
        mime_type=signature_mime,
        width=width,
        height=height,
        file_size=len(data),
    )
