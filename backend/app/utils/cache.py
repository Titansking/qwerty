"""
Simple in-memory time-to-live cache.

Used to cache Elexon API responses so the backend does not
re-fetch the same data on every request. In a production
deployment this could be replaced with Redis.
"""
import time
from threading import RLock
from typing import Any, Optional


class TTLCache:
    """Thread-safe TTL cache storing (value, expiry_timestamp)."""

    def __init__(self, ttl_seconds: int = 3600, enabled: bool = True) -> None:
        self._ttl = ttl_seconds
        self._enabled = enabled
        self._store: dict[str, tuple[Any, float]] = {}
        self._lock = RLock()

    def get(self, key: str) -> Optional[Any]:
        if not self._enabled:
            return None
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                return None
            value, expiry = entry
            if time.time() > expiry:
                del self._store[key]
                return None
            return value

    def set(self, key: str, value: Any) -> None:
        if not self._enabled:
            return
        with self._lock:
            self._store[key] = (value, time.time() + self._ttl)

    def delete(self, key: str) -> None:
        with self._lock:
            self._store.pop(key, None)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()

    def __len__(self) -> int:
        with self._lock:
            return len(self._store)