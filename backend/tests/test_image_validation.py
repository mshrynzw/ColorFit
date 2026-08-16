from app.utils.filenames import sanitize_filename
from app.utils.image_validation import detect_format_from_signature


def test_sanitize_filename_strips_path_and_unsafe_chars() -> None:
    assert sanitize_filename("../../etc/passwd") == "passwd"
    assert sanitize_filename('a<b>.png') == "ab.png"
    assert sanitize_filename("...") == "image"
    assert sanitize_filename(None) == "image"


def test_detect_format_from_signature() -> None:
    assert detect_format_from_signature(b"\xff\xd8\xff\xe0rest") == "jpeg"
    assert detect_format_from_signature(b"\x89PNG\r\n\x1a\nrest") == "png"
    assert detect_format_from_signature(b"RIFF....WEBP") == "webp"
    assert detect_format_from_signature(b"GIF89a") is None
