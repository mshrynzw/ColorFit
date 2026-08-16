import pytest
from pydantic import ValidationError

from app.core.exceptions import AppError, ErrorCode
from app.processing.validation import validate_adjustment
from app.schemas.palette import AdjustmentInput, PaletteColor


def valid_palette() -> list[PaletteColor]:
    return [
        PaletteColor(name="primary", color="#00D9FF", ratio=60),
        PaletteColor(name="secondary", color="#6C5CE7", ratio=30),
        PaletteColor(name="accent", color="#FFFFFF", ratio=10),
    ]


def test_validate_adjustment_accepts_mvp_palette() -> None:
    result = validate_adjustment(
        AdjustmentInput(palette=valid_palette(), strength=0.7),
    )
    assert result.strength == 0.7
    assert result.palette[0].color == "#00D9FF"


def test_validate_adjustment_rejects_invalid_hex() -> None:
    palette = valid_palette()
    palette[0] = PaletteColor(name="primary", color="00D9FF", ratio=60)
    with pytest.raises(AppError) as exc:
        validate_adjustment(AdjustmentInput(palette=palette, strength=0.5))
    assert exc.value.code == ErrorCode.INVALID_COLOR
    assert exc.value.status_code == 422


def test_validate_adjustment_rejects_ratio_sum() -> None:
    palette = valid_palette()
    palette[0] = PaletteColor(name="primary", color="#00D9FF", ratio=80)
    with pytest.raises(AppError) as exc:
        validate_adjustment(AdjustmentInput(palette=palette, strength=0.5))
    assert exc.value.code == ErrorCode.INVALID_RATIO


def test_validate_adjustment_rejects_strength_out_of_range() -> None:
    with pytest.raises(AppError) as exc:
        validate_adjustment(AdjustmentInput(palette=valid_palette(), strength=1.2))
    assert exc.value.code == ErrorCode.INVALID_STRENGTH


def test_validate_adjustment_rejects_wrong_size() -> None:
    with pytest.raises(AppError) as exc:
        validate_adjustment(
            AdjustmentInput(palette=valid_palette()[:2], strength=0.5),
        )
    assert exc.value.code == ErrorCode.INVALID_PALETTE


def test_adjustment_input_accepts_numeric_payload() -> None:
    payload = AdjustmentInput.model_validate(
        {
            "palette": [
                {"name": "primary", "color": "#123456", "ratio": 60},
                {"name": "secondary", "color": "#789ABC", "ratio": 30},
                {"name": "accent", "color": "#FFAA00", "ratio": 10},
            ],
            "strength": 0,
        }
    )
    assert payload.strength == 0


def test_adjustment_input_rejects_non_numeric_strength() -> None:
    with pytest.raises(ValidationError):
        AdjustmentInput.model_validate(
            {
                "palette": [
                    {"name": "primary", "color": "#123456", "ratio": 60},
                    {"name": "secondary", "color": "#789ABC", "ratio": 30},
                    {"name": "accent", "color": "#FFAA00", "ratio": 10},
                ],
                "strength": "strong",
            }
        )
