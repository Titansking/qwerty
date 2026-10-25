"""
Health check route.

Provides a lightweight endpoint for uptime monitoring and
deployment readiness/liveness probes.
"""
from fastapi import APIRouter

from app.core.config import get_settings
from app.models.schemas import HealthResponse

router = APIRouter()


@router.get("/health", response_model=HealthResponse, summary="Health check")
def health() -> HealthResponse:
    """Return service health status."""
    return HealthResponse(status="ok", service="wind-forecast-api")