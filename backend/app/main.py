from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.error_handlers import register_exception_handlers
from app.core.logging import setup_logging
from app.core.middleware import RateLimitMiddleware, RequestContextMiddleware
from app.core.request_context import REQUEST_ID_HEADER


def create_app() -> FastAPI:
    settings = get_settings()
    settings.validate_for_app()
    setup_logging(settings.log_level)

    application = FastAPI(
        title="ColorFit API",
        version="0.1.0",
        docs_url="/docs" if settings.is_development else None,
        redoc_url="/redoc" if settings.is_development else None,
        openapi_url="/openapi.json" if settings.is_development else None,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origin_list,
        allow_credentials=False,
        allow_methods=["GET", "POST", "DELETE", "OPTIONS", "HEAD"],
        allow_headers=["Accept", "Content-Type", REQUEST_ID_HEADER],
        expose_headers=[REQUEST_ID_HEADER, "Content-Disposition"],
    )
    application.add_middleware(RateLimitMiddleware)
    application.add_middleware(RequestContextMiddleware)

    register_exception_handlers(application)
    application.include_router(api_router)
    return application


app = create_app()
