"""
API route registration.

Mounts all route modules under a single router with a common
prefix. This keeps the main application file clean and makes
the API structure easy to extend.
"""
from fastapi import APIRouter

from app.api.routes import accuracy, actuals, forecast_actuals, forecasts, health

api_router = APIRouter(prefix="/api")

api_router.include_router(health.router, tags=["health"])
api_router.include_router(actuals.router, tags=["actuals"])
api_router.include_router(forecasts.router, tags=["forecasts"])
api_router.include_router(forecast_actuals.router, tags=["forecast-actuals"])
api_router.include_router(accuracy.router, tags=["accuracy"])