"""
Actuals route.

Returns half-hourly actual wind generation records from the
Elexon FUELHH dataset for a requested date range.
"""
from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from app.core.config import get_settings
from app.models.schemas import ActualsResponse, ErrorResponse
from app.services.data_service import DataService

router = APIRouter()

_data_service = DataService()


def _resolve_date_range(
    start_date: Optional[str],
    end_date: Optional[str],
    settings,
) -> tuple[datetime, datetime]:
    """Resolve start and end datetimes from query parameters."""
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
        return start, end
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid date format: {exc}")


@router.get(
    "/actuals",
    response_model=ActualsResponse,
    responses={400: {"model": ErrorResponse}, 500: {"model": ErrorResponse}},
    summary="Get actual wind generation",
)
async def get_actuals(
    start_date: Optional[str] = Query(
        None, description="Start date (YYYY-MM-DD). Defaults to 1st of analysis month."
    ),
    end_date: Optional[str] = Query(
        None, description="End date (YYYY-MM-DD). Defaults to last day of analysis month."
    ),
    force_refresh: bool = Query(
        False, description="Bypass cache and re-fetch from Elexon API."
    ),
) -> ActualsResponse:
    """Fetch actual wind generation records for a date range."""
    settings = get_settings()
    start, end = _resolve_date_range(start_date, end_date, settings)

    records = await _data_service.get_actuals(
        start_date=start, end_date=end, force_refresh=force_refresh
    )
    return ActualsResponse(
        data=records,
        count=len(records),
        start_date=start_date,
        end_date=end_date,
    )