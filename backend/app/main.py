"""
FastAPI application entry point.

Creates the application, configures middleware (CORS, error
handling), and mounts the API router. Kept minimal so that
route and business logic live in their own modules.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(
    title="Wind Forecast Accuracy API",
    description=(
        "Backend for the UK wind generation forecast portal. "
        "Serves actuals, forecasts, and accuracy metrics from Elexon BMRS data."
    ),
    version="1.0.0",
)

# CORS middleware - allows the frontend to call the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=settings.cors_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global exception handler for service-level errors
from app.services.elexon_client import ElexonClientError
from fastapi import Request
from fastapi.responses import JSONResponse


@app.exception_handler(ElexonClientError)
async def elexon_client_error_handler(_: Request, exc: ElexonClientError):
    return JSONResponse(status_code=502, content={"error": "upstream_api_error", "detail": str(exc)})

app.include_router(api_router)


@app.get("/", tags=["root"])
def root():
    return {
        "service": "wind-forecast-api",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/health",
    }