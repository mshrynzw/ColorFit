from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.request_context import REQUEST_ID_HEADER, get_request_id
from app.schemas.common import ErrorBody, ErrorResponse


def resolve_request_id(request: Request | None = None) -> str:
    if request is not None:
        request_id = getattr(request.state, "request_id", None)
        if request_id:
            return str(request_id)
    return get_request_id() or "-"


def error_response(
    code: str,
    message: str,
    request: Request | None = None,
) -> dict:
    return ErrorResponse(
        error=ErrorBody(
            code=code,
            message=message,
            request_id=resolve_request_id(request),
        )
    ).model_dump(by_alias=True)


def error_json_response(
    status_code: int,
    code: str,
    message: str,
    request: Request | None = None,
) -> JSONResponse:
    request_id = resolve_request_id(request)
    response = JSONResponse(
        status_code=status_code,
        content=error_response(code, message, request),
    )
    response.headers[REQUEST_ID_HEADER] = request_id
    return response
