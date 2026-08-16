from __future__ import annotations

import threading
import time

from app.core.config import Settings


class RateLimiter:
    def __init__(self) -> None:
        self._hits: dict[tuple[str, str], list[float]] = {}
        self._lock = threading.Lock()

    def allow(self, client_id: str, bucket: str, settings: Settings) -> bool:
        limit, window = settings.rate_limit_for(bucket)
        if limit <= 0:
            return True

        now = time.monotonic()
        key = (client_id, bucket)
        with self._lock:
            recent = [
                stamp for stamp in self._hits.get(key, []) if now - stamp < window
            ]
            if len(recent) >= limit:
                self._hits[key] = recent
                return False
            recent.append(now)
            self._hits[key] = recent
            return True


def match_rate_limit_bucket(method: str, path: str) -> str | None:
    normalized = path.rstrip("/") or "/"
    if method == "POST" and normalized == "/api/images":
        return "upload"
    if method == "POST" and normalized.endswith("/process"):
        return "process"
    if method == "GET" and normalized.endswith("/download"):
        return "download"
    return None
