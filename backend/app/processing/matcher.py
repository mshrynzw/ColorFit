from __future__ import annotations

from dataclasses import dataclass

from app.processing.color_space import (
    lab_distance,
    lab_to_rgb,
    lerp_lab,
    rgb_to_hex,
    rgb_to_lab,
)
from app.processing.validation import parse_hex_color, validate_adjustment
from app.schemas.palette import AdjustmentInput, PaletteColor


@dataclass(frozen=True)
class PaletteLabColor:
    name: str
    hex: str
    rgb: tuple[int, int, int]
    lab: tuple[float, float, float]
    ratio: float


@dataclass(frozen=True)
class MatchedColor:
    source_hex: str
    result_hex: str
    result_rgb: tuple[int, int, int]


def prepare_palette(palette: list[PaletteColor]) -> list[PaletteLabColor]:
    prepared: list[PaletteLabColor] = []
    for item in palette:
        rgb = parse_hex_color(item.color)
        prepared.append(
            PaletteLabColor(
                name=item.name,
                hex=item.color.upper(),
                rgb=rgb,
                lab=rgb_to_lab(rgb),
                ratio=item.ratio,
            )
        )
    return prepared


def target_lab_for(
    source_lab: tuple[float, float, float],
    palette: list[PaletteLabColor],
) -> tuple[float, float, float]:
    weighted: list[tuple[float, PaletteLabColor]] = []
    for color in palette:
        distance = lab_distance(source_lab, color.lab)
        weight = color.ratio / (distance + 1e-6)
        weighted.append((weight, color))
    total = sum(weight for weight, _ in weighted)
    return (
        sum(weight * color.lab[0] for weight, color in weighted) / total,
        sum(weight * color.lab[1] for weight, color in weighted) / total,
        sum(weight * color.lab[2] for weight, color in weighted) / total,
    )


def match_rgb(
    source_rgb: tuple[int, int, int],
    palette: list[PaletteLabColor],
    strength: float,
) -> tuple[int, int, int]:
    if strength <= 0:
        return source_rgb
    source_lab = rgb_to_lab(source_rgb)
    target = target_lab_for(source_lab, palette)
    mixed = lerp_lab(source_lab, target, min(strength, 1))
    return lab_to_rgb(mixed)


def match_adjustment(
    data: AdjustmentInput,
    source_colors: list[str] | None = None,
) -> list[MatchedColor]:
    validated = validate_adjustment(data)
    palette = prepare_palette(validated.palette)
    sources = source_colors or [item.color for item in validated.palette]
    matched: list[MatchedColor] = []
    for source in sources:
        rgb = parse_hex_color(source)
        result = match_rgb(rgb, palette, validated.strength)
        matched.append(
            MatchedColor(
                source_hex=source.upper(),
                result_hex=rgb_to_hex(result),
                result_rgb=result,
            )
        )
    return matched
