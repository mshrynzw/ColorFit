from __future__ import annotations

from io import BytesIO

from PIL import Image, UnidentifiedImageError

from app.core.exceptions import AppError, ErrorCode

EXPORT_FORMATS = frozenset({"webp", "jpeg", "png"})
EXPORT_QUALITIES = frozenset({"high", "standard", "light"})

_MIME = {"webp": "image/webp", "jpeg": "image/jpeg", "png": "image/png"}
_EXTENSION = {"webp": "webp", "jpeg": "jpg", "png": "png"}
_WEBP_QUALITY = {"high": 92, "standard": 80, "light": 62}
_JPEG_QUALITY = {"high": 92, "standard": 80, "light": 62}
_PNG_COMPRESS = {"high": 3, "standard": 6, "light": 9}


def normalize_export_options(
    export_format: str | None,
    quality: str | None,
) -> tuple[str | None, str | None]:
    fmt = (export_format or "").strip().lower() or None
    level = (quality or "").strip().lower() or None
    if fmt is None and level is None:
        return None, None
    if fmt is not None and fmt not in EXPORT_FORMATS:
        raise AppError(
            ErrorCode.INVALID_REQUEST,
            "書き出し形式が正しくありません。",
            400,
        )
    if level is not None and level not in EXPORT_QUALITIES:
        raise AppError(
            ErrorCode.INVALID_REQUEST,
            "画質の指定が正しくありません。",
            400,
        )
    return fmt or "webp", level or "standard"


def encode_for_download(
    data: bytes,
    export_format: str,
    quality: str,
) -> tuple[bytes, str, str]:
    try:
        with Image.open(BytesIO(data)) as image:
            image.load()
            buffer = BytesIO()
            if export_format == "jpeg":
                _flatten_rgb(image).save(
                    buffer,
                    format="JPEG",
                    quality=_JPEG_QUALITY[quality],
                    optimize=True,
                )
            elif export_format == "png":
                converted = (
                    image.convert("RGBA")
                    if _has_alpha(image)
                    else image.convert("RGB")
                )
                converted.save(
                    buffer,
                    format="PNG",
                    compress_level=_PNG_COMPRESS[quality],
                    optimize=True,
                )
            else:
                converted = (
                    image.convert("RGBA")
                    if _has_alpha(image)
                    else image.convert("RGB")
                )
                converted.save(
                    buffer,
                    format="WEBP",
                    quality=_WEBP_QUALITY[quality],
                    method=4,
                )
            return buffer.getvalue(), _MIME[export_format], _EXTENSION[export_format]
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise AppError(
            ErrorCode.IMAGE_PROCESSING_FAILED,
            "画像の書き出しに失敗しました。",
            500,
        ) from exc


def _has_alpha(image: Image.Image) -> bool:
    return image.mode in {"RGBA", "LA"} or (
        image.mode == "P" and "transparency" in image.info
    )


def _flatten_rgb(image: Image.Image) -> Image.Image:
    if not _has_alpha(image):
        return image.convert("RGB")
    rgba = image.convert("RGBA")
    background = Image.new("RGB", rgba.size, (255, 255, 255))
    background.paste(rgba, mask=rgba.getchannel("A"))
    return background
