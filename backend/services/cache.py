"""
SQLite-backed HTTP response cache for NASA/JPL API calls.

Design
------
- Single table: ``cache(key TEXT PK, value TEXT, fetched_at REAL)``
- Key   = SHA-256 of the full request URL + sorted query params string
- Value = JSON-serialised response body (text)
- TTL   = configurable per-call; default 3600 s (1 hour)
- Thread-safe: uses ``check_same_thread=False``; each call opens/closes
  its own connection so concurrent async workers don't collide.

Usage
-----
    from services.cache import cached_get

    data = await cached_get(url, params, ttl=3600)
    # Returns parsed dict; uses cache if fresh, calls upstream if stale/missing.

The cache file lives at ``backend/cache.db`` (git-ignored).
Delete it at any time to force a full refresh.
"""

from __future__ import annotations

import hashlib
import json
import sqlite3
import time
from pathlib import Path

import httpx

_DB_PATH = Path(__file__).parent.parent / "cache.db"
_TIMEOUT = 30.0


def _db_key(url: str, params: dict) -> str:
    """Stable SHA-256 key from URL + sorted params."""
    canonical = url + "?" + "&".join(f"{k}={v}" for k, v in sorted(params.items()))
    return hashlib.sha256(canonical.encode()).hexdigest()


def _ensure_table(conn: sqlite3.Connection) -> None:
    conn.execute(
        "CREATE TABLE IF NOT EXISTS cache "
        "(key TEXT PRIMARY KEY, value TEXT, fetched_at REAL)"
    )
    conn.commit()


def get_cached(key: str, ttl: int) -> dict | None:
    """Return cached value if it exists and is younger than *ttl* seconds."""
    with sqlite3.connect(_DB_PATH, check_same_thread=False) as conn:
        _ensure_table(conn)
        row = conn.execute(
            "SELECT value, fetched_at FROM cache WHERE key = ?", (key,)
        ).fetchone()
    if row is None:
        return None
    value_json, fetched_at = row
    if time.time() - fetched_at > ttl:
        return None          # stale
    return json.loads(value_json)


def set_cached(key: str, data: dict) -> None:
    """Write *data* to the cache under *key* with the current timestamp."""
    with sqlite3.connect(_DB_PATH, check_same_thread=False) as conn:
        _ensure_table(conn)
        conn.execute(
            "INSERT OR REPLACE INTO cache (key, value, fetched_at) VALUES (?, ?, ?)",
            (key, json.dumps(data), time.time()),
        )
        conn.commit()


def cache_stats() -> dict:
    """Return row count and oldest/newest fetch timestamps."""
    if not _DB_PATH.exists():
        return {"rows": 0, "oldest": None, "newest": None}
    with sqlite3.connect(_DB_PATH, check_same_thread=False) as conn:
        _ensure_table(conn)
        row = conn.execute(
            "SELECT COUNT(*), MIN(fetched_at), MAX(fetched_at) FROM cache"
        ).fetchone()
    count, oldest, newest = row
    return {
        "rows": count,
        "oldest": oldest,
        "newest": newest,
        "db_path": str(_DB_PATH),
    }


async def cached_get(url: str, params: dict, ttl: int = 3600) -> dict:
    """GET *url* with *params*, serving from SQLite cache if fresh.

    Parameters
    ----------
    url : str
        Full upstream URL, e.g. ``https://ssd-api.jpl.nasa.gov/sbdb.api``.
    params : dict
        Query parameters.
    ttl : int
        Cache lifetime in seconds.  Default 3600 (1 hour).
        Pass ``ttl=0`` to bypass the cache entirely (force fresh fetch).

    Returns
    -------
    dict
        Parsed JSON response.

    Notes
    -----
    Cache hits are logged to stdout as ``[CACHE HIT]`` so you can verify
    interception in the server log without needing a separate hit counter.
    """
    key = _db_key(url, params)

    if ttl > 0:
        cached = get_cached(key, ttl)
        if cached is not None:
            print(f"[CACHE HIT]  {url.split('/')[-1]}  key={key[:12]}...")
            return cached

    print(f"[CACHE MISS] {url.split('/')[-1]}  key={key[:12]}... fetching upstream")
    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        data = response.json()

    set_cached(key, data)
    return data
