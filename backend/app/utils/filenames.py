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
