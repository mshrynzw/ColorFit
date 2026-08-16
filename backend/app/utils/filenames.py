from pathlib import Path

_UNSAFE_FILENAME_CHARS = set('<>:"/\\|?*')


def sanitize_filename(raw: str | None) -> str:
    name = Path(raw or "").name.replace("\x00", "")
    cleaned = "".join(
        char
        for char in name
        if char.isprintable() and char not in _UNSAFE_FILENAME_CHARS
    ).strip(" .")
    if not cleaned or cleaned in {".", ".."}:
        return "image"
    return cleaned[:255]


def processed_download_name(raw: str | None, extension: str = "webp") -> str:
    stem = Path(sanitize_filename(raw)).stem.strip(" .")
    suffix = extension.lstrip(".") or "webp"
    if not stem or stem in {".", ".."}:
        return f"image.{suffix}"
    return f"{stem}.{suffix}"
