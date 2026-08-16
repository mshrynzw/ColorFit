from app.processing.color_space import lab_distance, rgb_to_hex, rgb_to_lab
from app.processing.matcher import match_adjustment, match_rgb, prepare_palette
from app.schemas.palette import AdjustmentInput, PaletteColor


def sample_input(strength: float) -> AdjustmentInput:
    return AdjustmentInput(
        palette=[
            PaletteColor(name="primary", color="#1E3A5F", ratio=60),
            PaletteColor(name="secondary", color="#D8B26E", ratio=30),
            PaletteColor(name="accent", color="#F5F1E8", ratio=10),
        ],
        strength=strength,
    )


def test_strength_zero_keeps_source_color() -> None:
    source = (220, 40, 40)
    palette = prepare_palette(sample_input(0).palette)
    assert match_rgb(source, palette, 0) == source


def test_strength_one_moves_color_toward_palette() -> None:
    source = (220, 40, 40)
    palette = prepare_palette(sample_input(1).palette)
    result = match_rgb(source, palette, 1)
    palette_labs = [item.lab for item in palette]
    source_lab = rgb_to_lab(source)
    result_lab = rgb_to_lab(result)
    source_gap = min(lab_distance(source_lab, item) for item in palette_labs)
    result_gap = min(lab_distance(result_lab, item) for item in palette_labs)
    assert result_gap < source_gap


def test_match_adjustment_returns_hex_results() -> None:
    matched = match_adjustment(sample_input(0.5), ["#FF0000"])
    assert len(matched) == 1
    assert matched[0].source_hex == "#FF0000"
    assert matched[0].result_hex.startswith("#")
    assert len(matched[0].result_hex) == 7


def test_higher_ratio_color_pulls_more_than_distant_accent() -> None:
    source = (30, 60, 90)
    palette = prepare_palette(sample_input(1).palette)
    result = match_rgb(source, palette, 1)
    primary = palette[0].lab
    accent = palette[2].lab
    result_lab = rgb_to_lab(result)
    assert lab_distance(result_lab, primary) <= lab_distance(result_lab, accent)


def test_rgb_hex_roundtrip_helper() -> None:
    assert rgb_to_hex((255, 0, 128)) == "#FF0080"
