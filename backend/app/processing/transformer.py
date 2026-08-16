from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from PIL import Image, ImageOps, UnidentifiedImageError

from app.core.exceptions import AppError, ErrorCode
from app.processing.color_space import lab_array_to_rgb, rgb_array_to_lab
from app.processing.matcher import PaletteLabColor, prepare_palette
from app.processing.validation import validate_adjustment
from app.schemas.palette import AdjustmentInput


@dataclass(frozen=True)
class ImageAnalysis:
    mean_rgb: tuple[int, int, int]
    width: int
    height: int


def analyze_rgb(rgb: np.ndarray) -> ImageAnalysis:
    height, width, _ = rgb.shape
    mean = rgb.reshape(-1, 3).mean(axis=0)
    return ImageAnalysis(
        mean_rgb=(int(round(mean[0])), int(round(mean[1])), int(round(mean[2]))),
        width=width,
        height=height,
    )


# Render 無料枠（512MB）でもピークメモリを抑えるため、画素を分割して変換する。
MATCH_CHUNK_SIZE = 16_384


def match_rgb_array(
    rgb: np.ndarray,
    palette: list[PaletteLabColor],
    strength: float,
    *,
    chunk_size: int = MATCH_CHUNK_SIZE,
) -> np.ndarray:
    if strength <= 0:
        return rgb

    flat = rgb.reshape(-1, 3)
    palette_labs = np.array([color.lab for color in palette], dtype=np.float64)
    ratios = np.array([color.ratio for color in palette], dtype=np.float64)
    amount = min(float(strength), 1.0)
    step = max(int(chunk_size), 1)
    output = np.empty_like(flat)

    for start in range(0, flat.shape[0], step):
        chunk = flat[start : start + step]
        output[start : start + step] = _match_rgb_chunk(
            chunk,
            palette_labs,
            ratios,
            amount,
        )

    return output.reshape(rgb.shape)


def _match_rgb_chunk(
    rgb_chunk: np.ndarray,
    palette_labs: np.ndarray,
    ratios: np.ndarray,
    amount: float,
) -> np.ndarray:
    labs = rgb_array_to_lab(rgb_chunk)
    color_count = palette_labs.shape[0]
    distance = np.empty((labs.shape[0], color_count), dtype=np.float64)
    for index, color in enumerate(palette_labs):
        delta = labs - color
        distance[:, index] = np.sqrt(np.sum(delta * delta, axis=1))
    weights = ratios[None, :] / (distance + 1e-6)
    weights = weights / np.sum(weights, axis=1, keepdims=True)
    target = weights @ palette_labs
    mixed = labs + (target - labs) * amount
    return lab_array_to_rgb(mixed)


def transform_image(data: bytes, adjustment: AdjustmentInput) -> bytes:
    validated = validate_adjustment(adjustment)
    palette = prepare_palette(validated.palette)
    try:
        rgb, alpha = _load_rgb(data)
        _ = analyze_rgb(rgb)
        processed = match_rgb_array(rgb, palette, validated.strength)
        return _encode_webp(processed, alpha)
    except AppError:
        raise
    except (UnidentifiedImageError, OSError, ValueError) as exc:
        raise AppError(
            ErrorCode.IMAGE_PROCESSING_FAILED,
            "画像の処理に失敗しました。",
            500,
        ) from exc
    except Exception as exc:
        raise AppError(
            ErrorCode.COLOR_MATCHING_FAILED,
            "画像の色合わせに失敗しました。",
            500,
        ) from exc


def _load_rgb(data: bytes) -> tuple[np.ndarray, np.ndarray | None]:
    from io import BytesIO

    with Image.open(BytesIO(data)) as image:
        image = ImageOps.exif_transpose(image)
        if image.mode == "P":
            image = image.convert(
                "RGBA" if "transparency" in image.info else "RGB",
            )
        elif image.mode == "LA":
            image = image.convert("RGBA")
        elif image.mode not in {"RGB", "RGBA"}:
            image = image.convert("RGB")

        alpha: np.ndarray | None = None
        if image.mode == "RGBA":
            alpha = np.array(image.getchannel("A"))
            rgb = np.array(image.convert("RGB"), dtype=np.uint8)
        else:
            rgb = np.array(image, dtype=np.uint8)
        return rgb, alpha


def _encode_webp(rgb: np.ndarray, alpha: np.ndarray | None) -> bytes:
    from io import BytesIO

    image = Image.fromarray(rgb, mode="RGB")
    if alpha is not None:
        image.putalpha(Image.fromarray(alpha, mode="L"))
    buffer = BytesIO()
    image.save(buffer, format="WEBP", quality=90, method=4)
    return buffer.getvalue()
