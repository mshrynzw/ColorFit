import logging

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.error_responses import error_json_response
from app.core.exceptions import AppError, ErrorCode

logger = logging.getLogger(__name__)


def register_exception_handlers(app: FastAPI) -> None:
    app.add_exception_handler(AppError, app_error_handler)
    app.add_exception_handler(RequestValidationError, validation_error_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(Exception, unhandled_error_handler)


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    logger.warning("application error code=%s", exc.code)
    return error_json_response(
        exc.status_code,
        exc.code,
        exc.message,
        request,
    )


async def validation_error_handler(
    request: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    logger.warning("validation error: %s", exc.errors())
    return error_json_response(
        422,
        ErrorCode.INVALID_REQUEST,
        "入力内容が正しくありません。",
        request,
    )


async def http_exception_handler(
    request: Request,
    exc: StarletteHTTPException,
) -> JSONResponse:
    if exc.status_code == 404:
        return error_json_response(
            404,
            ErrorCode.NOT_FOUND,
            "指定されたリソースが見つかりません。",
            request,
        )

    if exc.status_code >= 500:
        logger.error("http error status=%s", exc.status_code)
        return error_json_response(
            exc.status_code,
            ErrorCode.INTERNAL_SERVER_ERROR,
            "予期しないエラーが発生しました。時間をおいて再度お試しください。",
            request,
        )

    return error_json_response(
        exc.status_code,
        ErrorCode.INVALID_REQUEST,
        "リクエストが正しくありません。",
        request,
    )


async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("unhandled error: %s", type(exc).__name__)
    return error_json_response(
        500,
        ErrorCode.INTERNAL_SERVER_ERROR,
        "予期しないエラーが発生しました。時間をおいて再度お試しください。",
        request,
    )
