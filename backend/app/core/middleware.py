import logging
import time
import uuid

from starlette.datastructures import Headers, MutableHeaders
from starlette.requests import Request
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.request_context import (
    REQUEST_ID_HEADER,
    reset_request_id,
    set_request_id,
)

logger = logging.getLogger(__name__)


def _resolve_request_id(headers: Headers) -> str:
    incoming = headers.get(REQUEST_ID_HEADER, "").strip()
    if incoming and len(incoming) <= 128:
        return incoming
    return str(uuid.uuid4())


class RequestContextMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = _resolve_request_id(Headers(scope=scope))
        request = Request(scope, receive)
        request.state.request_id = request_id
        token = set_request_id(request_id)
        started = time.perf_counter()
        status_code = 500

        async def send_with_request_id(message: Message) -> None:
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = int(message["status"])
                headers = MutableHeaders(scope=message)
                headers[REQUEST_ID_HEADER] = request_id
            await send(message)

        try:
            await self.app(scope, receive, send_with_request_id)
        except Exception:
            duration_ms = (time.perf_counter() - started) * 1000
            logger.exception(
                "request failed method=%s path=%s duration_ms=%.1f",
                scope.get("method"),
                scope.get("path"),
                duration_ms,
            )
            raise
        else:
            duration_ms = (time.perf_counter() - started) * 1000
            logger.info(
                "request completed method=%s path=%s status=%s duration_ms=%.1f",
                scope.get("method"),
                scope.get("path"),
                status_code,
                duration_ms,
            )
        finally:
            reset_request_id(token)
