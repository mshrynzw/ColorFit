from io import BytesIO

import numpy as np
from PIL import Image

from app.processing.color_space import lab_distance, rgb_to_lab
from app.processing.matcher import match_rgb, prepare_palette
from app.processing.transformer import match_rgb_array, transform_image
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


def test_array_match_agrees_with_scalar_match() -> None:
    source = (220, 40, 40)
    palette = prepare_palette(sample_input(0.7).palette)
    vector = match_rgb_array(
        np.array([[source]], dtype=np.uint8),
        palette,
        0.7,
    )[0, 0]
    scalar = match_rgb(source, palette, 0.7)
    assert abs(int(vector[0]) - scalar[0]) <= 2
    assert abs(int(vector[1]) - scalar[1]) <= 2
    assert abs(int(vector[2]) - scalar[2]) <= 2


def test_transform_preserves_alpha_and_size() -> None:
    image = Image.new("RGBA", (8, 6), (220, 30, 30, 255))
    image.putpixel((0, 0), (220, 30, 30, 0))
    buffer = BytesIO()
    image.save(buffer, format="PNG")

    processed = transform_image(buffer.getvalue(), sample_input(0.8))
    result = Image.open(BytesIO(processed))
    assert result.format == "WEBP"
    assert result.size == (8, 6)
    assert result.mode in {"RGBA", "RGB"}
    with_alpha = result.convert("RGBA")
    assert with_alpha.getpixel((0, 0))[3] == 0


def test_high_strength_moves_red_toward_palette() -> None:
    image = Image.new("RGB", (8, 8), (220, 30, 30))
    buffer = BytesIO()
    image.save(buffer, format="PNG")
    processed = Image.open(
        BytesIO(transform_image(buffer.getvalue(), sample_input(1))),
    ).convert("RGB")
    mean = processed.resize((1, 1)).getpixel((0, 0))
    source_lab = rgb_to_lab((220, 30, 30))
    result_lab = rgb_to_lab((int(mean[0]), int(mean[1]), int(mean[2])))
    palette = prepare_palette(sample_input(1).palette)
    source_gap = min(lab_distance(source_lab, item.lab) for item in palette)
    result_gap = min(lab_distance(result_lab, item.lab) for item in palette)
    assert result_gap < source_gap
