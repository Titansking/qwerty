"""
Accuracy route.

Returns quantitative forecast accuracy metrics (MAE, RMSE, MAPE,
bias, correlation) comparing forecasts against actuals.
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.core.config import get_settings
from app.models.schemas import AccuracyResponse, ErrorResponse
from app.services.data_service import DataService

router = APIRouter()

_data_service = DataService()


@router.get(
    "/accuracy",
    response_model=AccuracyResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Get forecast accuracy metrics",
)
async def get_accuracy(
    start_date: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD). Defaults to 1st of analysis month."
    ),
    end_date: Optional[str] = Query(
        None, description="End date (YYYY-MM-DD). Defaults to last day of analysis month."
    ),
) -> AccuracyResponse:
    """Return accuracy metrics and the underlying pairs for a date range."""
    settings = get_settings()

    try:
        start = (
            datetime.strptime(start_date, "%Y-%m-%d")
            if start_date
            else datetime(settings.analysis_year, settings.analysis_month, 1)
        )
        if end_date:
            end = datetime.strptime(end_date, "%Y-%m-%d") + timedelta(days=1)
        else:
            if settings.analysis_month == 12:
                end = datetime(settings.analysis_year + 1, 1, 1)
            else:
                end = datetime(settings.analysis_year, settings.analysis_month + 1, 1)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {exc}")

    metrics = await _data_service.get_accuracy_metrics(
        start_date=start, end_date=end
    )
    pairs = await _data_service.get_forecast_actual_pairs(
        start_date=start, end_date=end
    )
    return AccuracyResponse(metrics=metrics, pairs=pairs)