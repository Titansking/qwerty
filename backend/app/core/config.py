"""
Application configuration module.

Loads environment variables and provides strongly-typed settings
for the backend application. Separates configuration from code
so the same build can run in development, staging, and production.
"""
from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Elexon BMRS API
    elexon_api_base_url: str = Field(
        default="https://data.elexon.co.uk/bmrs/api/v1",
        alias="ELEXON_API_BASE_URL",
    )
    elexon_api_timeout: int = Field(default=30, alias="ELEXON_API_TIMEOUT")

    # Application
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    api_reload: bool = Field(default=False, alias="API_RELOAD")

    # CORS (comma-separated string in .env)
    cors_origins: str = Field(default="http://localhost:5173", alias="CORS_ORIGINS")
    # Optional regex for dynamic origins (e.g. Vercel preview deployments);
    # wildcards are not supported in CORS_ORIGINS.
    cors_origin_regex: str | None = Field(default=None, alias="CORS_ORIGIN_REGEX")

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    # Cache
    cache_ttl_seconds: int = Field(default=3600, alias="CACHE_TTL_SECONDS")
    cache_enabled: bool = Field(default=True, alias="CACHE_ENABLED")

    # Analysis scope (January 2026 per requirements)
    analysis_year: int = Field(default=2026, alias="ANALYSIS_YEAR")
    analysis_month: int = Field(default=1, alias="ANALYSIS_MONTH")
    wind_fuel_type: str = Field(default="WIND", alias="WIND_FUEL_TYPE")

    # Logging
    log_level: str = Field(default="INFO", alias="LOG_LEVEL")

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8", "extra": "ignore"}


@lru_cache()
def get_settings() -> Settings:
    """Return cached settings instance (singleton pattern)."""
    return Settings()