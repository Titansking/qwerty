"""
Elexon BMRS API client.

Handles all communication with the Elexon Balancing Mechanism
Reporting Service (BMRS) API for fetching wind generation
actuals (FUELHH) and forecasts (WINDFOR).
"""
from datetime import datetime, timedelta
from typing import List, Optional

import httpx

from app.core.config import get_settings


class ElexonClientError(Exception):
    """Raised when the Elexon API client fails."""


class ElexonClient:
    """Client for the Elexon BMRS streaming API datasets."""

    def __init__(
        self,
        base_url: Optional[str] = None,
        timeout: Optional[int] = None,
    ) -> None:
        settings = get_settings()
        self._base_url = (base_url or settings.elexon_api_base_url).rstrip("/")
        self._timeout = timeout or settings.elexon_api_timeout

    async def _fetch_json(
        self, dataset: str, params: dict
    ) -> List[dict]:
        """Fetch JSON records from a BMRS dataset stream endpoint."""
        url = f"{self._base_url}/datasets/{dataset}/stream"
        try:
            async with httpx.AsyncClient(timeout=self._timeout) as client:
                response = await client.get(url, params=params)
                response.raise_for_status()
                data = response.json()
                if not isinstance(data, list):
                    raise ElexonClientError(
                        f"Unexpected response format from {dataset}: expected list"
                    )
                return data
        except httpx.HTTPStatusError as exc:
            raise ElexonClientError(
                f"Elexon API returned HTTP {exc.response.status_code} for {dataset}"
            ) from exc
        except httpx.RequestError as exc:
            raise ElexonClientError(
                f"Network error while calling Elexon API {dataset}: {exc}"
            ) from exc
        except ValueError as exc:
            raise ElexonClientError(
                f"Invalid JSON response from Elexon API {dataset}: {exc}"
            ) from exc

    async def fetch_actuals(
        self,
        start_time_from: datetime,
        start_time_to: datetime,
        fuel_type: str = "WIND",
    ) -> List[dict]:
        """Fetch actual half-hourly generation records (FUELHH dataset)."""
        params = {
            "startTimeFrom": start_time_from.strftime("%Y-%m-%dT%H:%M:%S"),
            "startTimeTo": start_time_to.strftime("%Y-%m-%dT%H:%M:%S"),
            "fuelType": fuel_type,
        }
        return await self._fetch_json("FUELHH", params)

    async def fetch_forecasts(
        self,
        start_time_from: datetime,
        start_time_to: datetime,
    ) -> List[dict]:
        """Fetch wind forecast records (WINDFOR dataset)."""
        params = {
            "startTimeFrom": start_time_from.strftime("%Y-%m-%dT%H:%M:%S"),
            "startTimeTo": start_time_to.strftime("%Y-%m-%dT%H:%M:%S"),
        }
        return await self._fetch_json("WINDFOR", params)