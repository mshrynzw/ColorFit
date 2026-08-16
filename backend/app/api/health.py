from fastapi import APIRouter, Response

from app.schemas.health import HealthResponse
from app.services import health_service

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    return health_service.get_health()


@router.head("/health", include_in_schema=False)
def head_health() -> Response:
    return Response(status_code=200)
