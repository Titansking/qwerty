"""
API response/request schemas.

Defines Pydantic models for all data exchanged between the
backend and frontend. Keeps the contract explicit and
self-documenting.
"""
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


# ---------------------------------------------------------------------------
# Domain models
# ---------------------------------------------------------------------------


class GenerationRecord(BaseModel):
    """A single generation data point (actual or forecast)."""

    model_config = ConfigDict(from_attributes=True)

    start_time: datetime
    generation_mw: float
    publish_time: Optional[datetime] = None
    fuel_type: Optional[str] = None


class ForecastActualPair(BaseModel):
    """A matched forecast and actual generation pair for the same period."""

    model_config = ConfigDict(from_attributes=True)

    start_time: datetime
    forecast_mw: float
    actual_mw: float
    error_mw: float  # forecast - actual
    abs_error_mw: float
    publish_time: Optional[datetime] = None
    forecast_hour: Optional[int] = None  # hours ahead of delivery


class AccuracyMetrics(BaseModel):
    """Quantitative forecast accuracy metrics."""

    model_config = ConfigDict(from_attributes=True)

    mean_absolute_error_mw: float
    root_mean_squared_error_mw: float
    mean_absolute_percentage_error: float  # percentage
    mean_bias_mw: float  # mean(forecast - actual); positive = over-forecast
    correlation: float
    sample_count: int
    mean_forecast_mw: float
    mean_actual_mw: float


# ---------------------------------------------------------------------------
# API response wrappers
# ---------------------------------------------------------------------------


class ActualsResponse(BaseModel):
    """Response for actual generation data."""

    data: List[GenerationRecord]
    count: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ForecastsResponse(BaseModel):
    """Response for forecast generation data."""

    data: List[GenerationRecord]
    count: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ForecastActualResponse(BaseModel):
    """Response for matched forecast-actual pairs."""

    data: List[ForecastActualPair]
    count: int


class AccuracyResponse(BaseModel):
    """Response for forecast accuracy metrics."""

    metrics: AccuracyMetrics
    pairs: List[ForecastActualPair]


class HealthResponse(BaseModel):
    """Health check response."""

    status: str
    service: str
    version: str = "1.0.0"


class ErrorResponse(BaseModel):
    """Standard error response."""

    error: str
    detail: Optional[str] = None
    code: Optional[str] = None