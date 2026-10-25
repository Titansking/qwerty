"""
Business logic service for wind generation data.

Orchestrates fetching actuals and forecasts from Elexon,
caching results, and matching them into forecast-actual pairs.
Keeps business rules separate from transport (API client)
and presentation (API routes).
"""
from datetime import datetime, timedelta
from typing import List, Optional

from app.core.config import get_settings
from app.models.schemas import (
    AccuracyMetrics,
    ForecastActualPair,
    GenerationRecord,
)
from app.services.accuracy_service import AccuracyService
from app.services.elexon_client import ElexonClient
from app.utils.cache import TTLCache


class DataService:
    """High-level service for wind generation data and accuracy."""

    def __init__(
        self,
        elexon_client: Optional[ElexonClient] = None,
        cache: Optional[TTLCache] = None,
        accuracy_service: Optional[AccuracyService] = None,
    ) -> None:
        settings = get_settings()
        self._elexon = elexon_client or ElexonClient()
        self._cache = cache or TTLCache(
            ttl_seconds=settings.cache_ttl_seconds,
            enabled=settings.cache_enabled,
        )
        self._accuracy = accuracy_service or AccuracyService(cache=self._cache)

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    async def get_actuals(
        self,
        start_date: datetime,
        end_date: datetime,
        force_refresh: bool = False,
    ) -> List[GenerationRecord]:
        """Fetch actual wind generation records for a date range."""
        cache_key = f"actuals:{start_date.date()}:{end_date.date()}"
        if not force_refresh:
            cached = self._cache.get(cache_key)
            if cached is not None:
                return cached

        settings = get_settings()
        records = await self._elexon.fetch_actuals(
            start_time_from=start_date,
            start_time_to=end_date,
            fuel_type=settings.wind_fuel_type,
        )
        parsed = [
            GenerationRecord(
                start_time=_parse_utc(r["startTime"]),
                generation_mw=float(r["generation"]),
                publish_time=_parse_utc(r.get("publishTime")) if r.get("publishTime") else None,
                fuel_type=r.get("fuelType"),
            )
            for r in records
        ]
        self._cache.set(cache_key, parsed)
        return parsed

    async def get_forecasts(
        self,
        start_date: datetime,
        end_date: datetime,
        force_refresh: bool = False,
    ) -> List[GenerationRecord]:
        """Fetch wind forecast records for a date range."""
        cache_key = f"forecasts:{start_date.date()}:{end_date.date()}"
        if not force_refresh:
            cached = self._cache.get(cache_key)
            if cached is not None:
                return cached

        records = await self._elexon.fetch_forecasts(
            start_time_from=start_date,
            start_time_to=end_date,
        )
        parsed = [
            GenerationRecord(
                start_time=_parse_utc(r["startTime"]),
                generation_mw=float(r["generation"]),
                publish_time=_parse_utc(r.get("publishTime")) if r.get("publishTime") else None,
            )
            for r in records
        ]
        self._cache.set(cache_key, parsed)
        return parsed

    async def get_forecast_actual_pairs(
        self,
        start_date: datetime,
        end_date: datetime,
    ) -> List[ForecastActualPair]:
        """Return matched forecast-actual pairs for a date range."""
        forecasts = await self.get_forecasts(start_date, end_date)
        actuals = await self.get_actuals(start_date, end_date)
        return self._accuracy.build_pairs(forecasts, actuals)

    async def get_accuracy_metrics(
        self,
        start_date: datetime,
        end_date: datetime,
    ) -> AccuracyMetrics:
        """Return computed accuracy metrics for a date range."""
        pairs = await self.get_forecast_actual_pairs(start_date, end_date)
        return self._accuracy.compute_metrics(pairs)

    async def get_latest_forecasts(
        self,
        start_date: datetime,
        end_date: datetime,
        limit_per_start_time: int = 1,
    ) -> List[GenerationRecord]:
        """
        Return the latest forecast for each start time.

        Multiple forecasts may exist for the same start_time (published
        at different times). This returns the most recently published
        forecast per start_time - the one available closest to decision time.
        """
        forecasts = await self.get_forecasts(start_date, end_date)
        latest_by_start: dict[str, GenerationRecord] = {}
        for f in forecasts:
            key = f.start_time.isoformat()
            existing = latest_by_start.get(key)
            if existing is None or (
                f.publish_time and existing.publish_time and f.publish_time > existing.publish_time
            ):
                latest_by_start[key] = f
        result = sorted(latest_by_start.values(), key=lambda r: r.start_time)
        return result


# ------------------------------------------------------------------
# Module-level helpers
# ------------------------------------------------------------------


def _parse_utc(value: str) -> datetime:
    """Parse an ISO-8601 timestamp into a timezone-aware UTC datetime."""
    if value.endswith("Z"):
        value = value[:-1] + "+00:00"
    dt = datetime.fromisoformat(value)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timedelta(hours=0))  # assume UTC
    return dt