from __future__ import annotations

import math
import re

from app.core.exceptions import AppError, ErrorCode
from app.schemas.palette import AdjustmentInput, PaletteColor

HEX_COLOR_PATTERN = re.compile(r"^#[0-9A-Fa-f]{6}$")
MIN_PALETTE_SIZE = 3
MAX_PALETTE_SIZE = 3
RATIO_SUM = 100.0
RATIO_SUM_TOLERANCE = 0.51


def parse_hex_color(value: str) -> tuple[int, int, int]:
    if not HEX_COLOR_PATTERN.fullmatch(value or ""):
        raise AppError(
            ErrorCode.INVALID_COLOR,
            "カラーコードが正しくありません。",
            422,
        )
    hex_value = value[1:]
    return (
        int(hex_value[0:2], 16),
        int(hex_value[2:4], 16),
        int(hex_value[4:6], 16),
    )


def validate_adjustment(data: AdjustmentInput) -> AdjustmentInput:
    if len(data.palette) < MIN_PALETTE_SIZE or len(data.palette) > MAX_PALETTE_SIZE:
        raise AppError(
            ErrorCode.INVALID_PALETTE,
            "カラーパレットが正しくありません。",
            422,
        )

    names: list[str] = []
    for item in data.palette:
        name = item.name.strip()
        if not name:
            raise AppError(
                ErrorCode.INVALID_PALETTE,
                "カラーパレットが正しくありません。",
                422,
            )
        if name in names:
            raise AppError(
                ErrorCode.INVALID_PALETTE,
                "カラーパレットが正しくありません。",
                422,
            )
        names.append(name)
        parse_hex_color(item.color)
        if item.ratio < 0 or item.ratio > 100:
            raise AppError(
                ErrorCode.INVALID_RATIO,
                "配色割合が正しくありません。",
                422,
            )

    total = sum(item.ratio for item in data.palette)
    if not math.isclose(total, RATIO_SUM, abs_tol=RATIO_SUM_TOLERANCE):
        raise AppError(
            ErrorCode.INVALID_RATIO,
            "配色割合が正しくありません。",
            422,
        )

    if data.strength < 0 or data.strength > 1:
        raise AppError(
            ErrorCode.INVALID_STRENGTH,
            "色の適用強度が正しくありません。",
            422,
        )

    return AdjustmentInput(
        palette=[
            PaletteColor(
                name=item.name.strip(),
                color=item.color.upper(),
                ratio=item.ratio,
            )
            for item in data.palette
        ],
        strength=data.strength,
    )
