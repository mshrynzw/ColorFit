from __future__ import annotations

import numpy as np

# D65 reference white
_XN = 0.95047
_YN = 1.00000
_ZN = 1.08883
_DELTA = 6 / 29
_DELTA_CUBE = _DELTA**3


def _srgb_to_linear(channel: float) -> float:
    value = channel / 255.0
    if value <= 0.04045:
        return value / 12.92
    return ((value + 0.055) / 1.055) ** 2.4


def _linear_to_srgb(value: float) -> int:
    if value <= 0.0031308:
        srgb = 12.92 * value
    else:
        srgb = 1.055 * (value ** (1 / 2.4)) - 0.055
    return max(0, min(255, round(srgb * 255)))


def rgb_to_xyz(rgb: tuple[int, int, int]) -> tuple[float, float, float]:
    red, green, blue = (_srgb_to_linear(channel) for channel in rgb)
    x = red * 0.4124564 + green * 0.3575761 + blue * 0.1804375
    y = red * 0.2126729 + green * 0.7151522 + blue * 0.0721750
    z = red * 0.0193339 + green * 0.1191920 + blue * 0.9503041
    return x, y, z


def xyz_to_rgb(xyz: tuple[float, float, float]) -> tuple[int, int, int]:
    x, y, z = xyz
    red = x * 3.2404542 + y * -1.5371385 + z * -0.4985314
    green = x * -0.9692660 + y * 1.8760108 + z * 0.0415560
    blue = x * 0.0556434 + y * -0.2040259 + z * 1.0572252
    return (
        _linear_to_srgb(red),
        _linear_to_srgb(green),
        _linear_to_srgb(blue),
    )


def _lab_f(value: float) -> float:
    if value > _DELTA_CUBE:
        return value ** (1 / 3)
    return value / (3 * _DELTA**2) + 4 / 29


def _lab_f_inv(value: float) -> float:
    if value > _DELTA:
        return value**3
    return 3 * _DELTA**2 * (value - 4 / 29)


def xyz_to_lab(xyz: tuple[float, float, float]) -> tuple[float, float, float]:
    x, y, z = xyz
    fx = _lab_f(x / _XN)
    fy = _lab_f(y / _YN)
    fz = _lab_f(z / _ZN)
    return (116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz))


def lab_to_xyz(lab: tuple[float, float, float]) -> tuple[float, float, float]:
    lightness, a, b = lab
    fy = (lightness + 16) / 116
    fx = fy + a / 500
    fz = fy - b / 200
    return (_XN * _lab_f_inv(fx), _YN * _lab_f_inv(fy), _ZN * _lab_f_inv(fz))


def rgb_to_lab(rgb: tuple[int, int, int]) -> tuple[float, float, float]:
    return xyz_to_lab(rgb_to_xyz(rgb))


def lab_to_rgb(lab: tuple[float, float, float]) -> tuple[int, int, int]:
    return xyz_to_rgb(lab_to_xyz(lab))


def lab_distance(
    left: tuple[float, float, float],
    right: tuple[float, float, float],
) -> float:
    return (
        (left[0] - right[0]) ** 2
        + (left[1] - right[1]) ** 2
        + (left[2] - right[2]) ** 2
    ) ** 0.5


def lerp_lab(
    start: tuple[float, float, float],
    end: tuple[float, float, float],
    amount: float,
) -> tuple[float, float, float]:
    return (
        start[0] + (end[0] - start[0]) * amount,
        start[1] + (end[1] - start[1]) * amount,
        start[2] + (end[2] - start[2]) * amount,
    )


def rgb_to_hex(rgb: tuple[int, int, int]) -> str:
    return f"#{rgb[0]:02X}{rgb[1]:02X}{rgb[2]:02X}"


def rgb_array_to_lab(rgb: np.ndarray) -> np.ndarray:
    pixels = np.asarray(rgb, dtype=np.float64) / 255.0
    linear = np.where(
        pixels <= 0.04045,
        pixels / 12.92,
        ((pixels + 0.055) / 1.055) ** 2.4,
    )
    matrix = np.array(
        [
            [0.4124564, 0.3575761, 0.1804375],
            [0.2126729, 0.7151522, 0.0721750],
            [0.0193339, 0.1191920, 0.9503041],
        ],
        dtype=np.float64,
    )
    xyz = linear @ matrix.T
    xyz_n = xyz / np.array([_XN, _YN, _ZN], dtype=np.float64)
    f = np.where(
        xyz_n > _DELTA_CUBE,
        np.cbrt(xyz_n),
        xyz_n / (3 * _DELTA**2) + 4 / 29,
    )
    return np.stack(
        [
            116 * f[..., 1] - 16,
            500 * (f[..., 0] - f[..., 1]),
            200 * (f[..., 1] - f[..., 2]),
        ],
        axis=-1,
    )


def lab_array_to_rgb(lab: np.ndarray) -> np.ndarray:
    values = np.asarray(lab, dtype=np.float64)
    fy = (values[..., 0] + 16) / 116
    fx = fy + values[..., 1] / 500
    fz = fy - values[..., 2] / 200
    f = np.stack([fx, fy, fz], axis=-1)
    xyz_n = np.where(f > _DELTA, f**3, 3 * _DELTA**2 * (f - 4 / 29))
    xyz = xyz_n * np.array([_XN, _YN, _ZN], dtype=np.float64)
    matrix = np.array(
        [
            [3.2404542, -1.5371385, -0.4985314],
            [-0.9692660, 1.8760108, 0.0415560],
            [0.0556434, -0.2040259, 1.0572252],
        ],
        dtype=np.float64,
    )
    linear = xyz @ matrix.T
    srgb = np.where(
        linear <= 0.0031308,
        12.92 * linear,
        1.055 * np.power(np.clip(linear, 0, None), 1 / 2.4) - 0.055,
    )
    return np.clip(np.rint(srgb * 255.0), 0, 255).astype(np.uint8)
