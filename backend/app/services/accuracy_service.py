"""
Forecast accuracy computation service.

Calculates quantitative error metrics comparing forecasted
wind generation against actual generation. Metrics include
MAE, RMSE, MAPE, bias, and correlation.
"""
import math
from typing import List, Optional

from app.models.schemas import (
    AccuracyMetrics,
    ForecastActualPair,
    GenerationRecord,
)
from app.utils.cache import TTLCache


class AccuracyService:
    """Service for computing forecast accuracy metrics."""

    def __init__(self, cache: Optional[TTLCache] = None) -> None:
        self._cache = cache or TTLCache()

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def compute_metrics(
        self,
        pairs: List[ForecastActualPair],
    ) -> AccuracyMetrics:
        """Compute accuracy metrics from forecast-actual pairs."""
        if not pairs:
            return AccuracyMetrics(
                mean_absolute_error_mw=0.0,
                root_mean_squared_error_mw=0.0,
                mean_absolute_percentage_error=0.0,
                mean_bias_mw=0.0,
                correlation=0.0,
                sample_count=0,
                mean_forecast_mw=0.0,
                mean_actual_mw=0.0,
            )

        forecasts = [p.forecast_mw for p in pairs]
        actuals = [p.actual_mw for p in pairs]
        errors = [p.error_mw for p in pairs]
        abs_errors = [p.abs_error_mw for p in pairs]

        n = len(pairs)
        mae = sum(abs_errors) / n
        rmse = math.sqrt(sum(e * e for e in errors) / n)

        # MAPE: guard against zero actuals
        mape_terms = []
        for f, a in zip(forecasts, actuals):
            if a != 0:
                mape_terms.append(abs((f - a) / a) * 100.0)
        mape = sum(mape_terms) / len(mape_terms) if mape_terms else 0.0

        bias = sum(errors) / n

        mean_forecast = sum(forecasts) / n
        mean_actual = sum(actuals) / n

        correlation = self._pearson_correlation(forecasts, actuals)

        return AccuracyMetrics(
            mean_absolute_error_mw=round(mae, 2),
            root_mean_squared_error_mw=round(rmse, 2),
            mean_absolute_percentage_error=round(mape, 2),
            mean_bias_mw=round(bias, 2),
            correlation=round(correlation, 4),
            sample_count=n,
            mean_forecast_mw=round(mean_forecast, 2),
            mean_actual_mw=round(mean_actual, 2),
        )

    def build_pairs(
        self,
        forecasts: List[GenerationRecord],
        actuals: List[GenerationRecord],
    ) -> List[ForecastActualPair]:
        """
        Match forecasts to actuals by start time.

        WINDFOR forecasts are hourly; FUELHH actuals are half-hourly.
        For each hourly forecast we average the two half-hourly actuals
        that fall within that hour (start_time H and H+30min).
        """
        # Index actuals by start time (truncated to the hour)
        actuals_by_hour: dict[str, List[GenerationRecord]] = {}
        for a in actuals:
            hour_key = a.start_time.replace(minute=0, second=0, microsecond=0).isoformat()
            actuals_by_hour.setdefault(hour_key, []).append(a)

        pairs: List[ForecastActualPair] = []
        for f in forecasts:
            hour_key = f.start_time.replace(minute=0, second=0, microsecond=0).isoformat()
            hour_actuals = actuals_by_hour.get(hour_key, [])
            if not hour_actuals:
                continue

            avg_actual = sum(a.generation_mw for a in hour_actuals) / len(hour_actuals)
            forecast_mw = f.generation_mw
            error = forecast_mw - avg_actual

            # Estimate hours-ahead: how far publish_time is before start_time
            hours_ahead: Optional[int] = None
            if f.publish_time and f.start_time:
                delta = f.start_time - f.publish_time
                hours_ahead = max(0, round(delta.total_seconds() / 3600))

            pairs.append(
                ForecastActualPair(
                    start_time=f.start_time,
                    forecast_mw=round(forecast_mw, 2),
                    actual_mw=round(avg_actual, 2),
                    error_mw=round(error, 2),
                    abs_error_mw=round(abs(error), 2),
                    publish_time=f.publish_time,
                    forecast_hour=hours_ahead,
                )
            )

        pairs.sort(key=lambda p: p.start_time)
        return pairs

    # ------------------------------------------------------------------
    # Helpers
    # ------------------------------------------------------------------

    @staticmethod
    def _pearson_correlation(x: List[float], y: List[float]) -> float:
        n = len(x)
        if n < 2:
            return 0.0
        mx = sum(x) / n
        my = sum(y) / n
        num = sum((a - mx) * (b - my) for a, b in zip(x, y))
        den_x = math.sqrt(sum((a - mx) ** 2 for a in x))
        den_y = math.sqrt(sum((b - my) ** 2 for b in y))
        if den_x == 0 or den_y == 0:
            return 0.0
        return num / (den_x * den_y)