"""
NASA / JPL API data-fetch layer.

All functions return raw parsed JSON from the upstream APIs.
All responses are cached in a local SQLite store (services/cache.py) to:
  - protect against rate limits during development and live demos
  - make repeated calls instant (SBDB + CAD are slow on cold hits)

Default TTLs
------------
NeoWs browse   : 1 hour  (changes daily at most)
SBDB           : 24 hours (orbital solutions update infrequently)
CAD            : 6 hours  (new close-approach data added periodically)
Sentry         : 6 hours  (risk table updates are rare)

JSON contracts
--------------
search_neows()          → NeoWs browse response dict
get_sbdb_data(des)      → SBDB object dict with ``orbit`` and ``phys_par`` keys
get_cad_data(des, ...)  → CAD response with ``fields`` + ``data`` keys
get_sentry_data(des)    → Sentry response dict; ``None`` if object not on list
"""

import httpx
from core.config import settings
from services.cache import cached_get

NASA_BASE_URL = "https://api.nasa.gov"
JPL_SSD_BASE_URL = "https://ssd-api.jpl.nasa.gov"

_TIMEOUT = 30.0

# Cache TTLs (seconds)
_TTL_NEOWS  = 3_600        # 1 hour
_TTL_SBDB   = 86_400       # 24 hours
_TTL_CAD    = 21_600       # 6 hours
_TTL_SENTRY = 21_600       # 6 hours


async def search_neows(query: str = None):
    """Browse Near Earth Objects via NeoWs.

    Returns
    -------
    dict
        Raw NeoWs JSON response containing ``near_earth_objects`` list.
    """
    url = f"{NASA_BASE_URL}/neo/rest/v1/neo/browse"
    params = {"api_key": settings.NASA_API_KEY}
    return await cached_get(url, params, ttl=_TTL_NEOWS)


async def get_sbdb_data(designation: str):
    """Get full-precision orbital elements and physical parameters from JPL SBDB.

    Parameters
    ----------
    designation : str
        Asteroid designation or name (e.g. ``"Apophis"``, ``"99942"``).

    Returns
    -------
    dict
        SBDB JSON response with ``orbit.elements``, ``orbit.epoch``,
        ``phys_par``, and ``object`` keys.
    """
    url = f"{JPL_SSD_BASE_URL}/sbdb.api"
    params = {
        "sstr": designation,
        "phys-par": "1",
        "full-prec": "1",
        "cov": "mat",
    }
    return await cached_get(url, params, ttl=_TTL_SBDB)


async def get_cad_data(
    designation: str = None,
    date_min: str = None,
    date_max: str = None,
    dist_max: str = None,
):
    """Get Close-Approach Data from JPL CAD API.

    Parameters
    ----------
    designation : str, optional
        Numeric asteroid designation (CAD rejects names; pass the number).
    date_min : str, optional
        Start date ``"YYYY-MM-DD"``.
    date_max : str, optional
        End date ``"YYYY-MM-DD"``.
    dist_max : str, optional
        Maximum distance in AU, e.g. ``"0.1"``.

    Returns
    -------
    dict
        CAD JSON with ``fields`` list and ``data`` list-of-lists.
    """
    url = f"{JPL_SSD_BASE_URL}/cad.api"
    params: dict = {}
    if designation:
        params["des"] = designation
    if date_min:
        params["date-min"] = date_min
    if date_max:
        params["date-max"] = date_max
    if dist_max:
        params["dist-max"] = dist_max
    return await cached_get(url, params, ttl=_TTL_CAD)


async def get_sentry_data(designation: str = None):
    """Fetch JPL Sentry impact-risk data.

    Parameters
    ----------
    designation : str, optional
        Asteroid designation.  If omitted returns the full risk table.

    Returns
    -------
    dict or None
        Sentry JSON, or ``None`` if the object is not on the risk list.
    """
    url = f"{JPL_SSD_BASE_URL}/sentry.api"
    params: dict = {}
    if designation:
        params["des"] = designation

    # Sentry 400/404 = not on list; don't cache these negative hits
    try:
        return await cached_get(url, params, ttl=_TTL_SENTRY)
    except httpx.HTTPStatusError as exc:
        if exc.response.status_code in (400, 404):
            return None
        raise
