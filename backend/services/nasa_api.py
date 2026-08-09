"""
NASA / JPL API data-fetch layer.

All functions return raw parsed JSON from the upstream APIs.
All functions use ``full-prec=1`` for orbital elements so downstream physics
has full double-precision values rather than the truncated strings returned by
the default SBDB response.

JSON contracts
--------------
search_neows()          → NeoWs browse response dict
get_sbdb_data(des)      → SBDB object dict with ``orbit`` and ``phys_par`` keys
get_cad_data(des, ...)  → CAD response with ``fields`` + ``data`` keys
get_sentry_data(des)    → Sentry response dict; ``None`` if object not on list
"""

import httpx
from core.config import settings

NASA_BASE_URL = "https://api.nasa.gov"
JPL_SSD_BASE_URL = "https://ssd-api.jpl.nasa.gov"

# Shared timeout – JPL endpoints can be slow under load
_TIMEOUT = 30.0


async def search_neows(query: str = None):
    """Search for Near Earth Objects using NeoWs browse endpoint.

    Parameters
    ----------
    query : str, optional
        Reserved for future free-text filtering; not used by NeoWs browse.

    Returns
    -------
    dict
        Raw NeoWs JSON response containing ``near_earth_objects`` list.
    """
    url = f"{NASA_BASE_URL}/neo/rest/v1/neo/browse"
    params = {"api_key": settings.NASA_API_KEY}

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def get_sbdb_data(designation: str):
    """Get full-precision orbital elements and physical parameters from JPL SBDB.

    Parameters
    ----------
    designation : str
        Asteroid designation or name (e.g. ``"Apophis"``, ``"99942"``,
        ``"2025 UC11"``).

    Returns
    -------
    dict
        SBDB JSON response.  Key fields used downstream:

        ``orbit.elements``
            List of dicts with ``name`` and ``value`` (full precision string).
        ``orbit.epoch``
            Reference epoch as Julian Date string.
        ``phys_par``
            Physical parameters (diameter, albedo, H magnitude, etc.)
    """
    url = f"{JPL_SSD_BASE_URL}/sbdb.api"
    params = {
        "sstr": designation,
        "phys-par": "1",
        "full-prec": "1",          # <-- full double-precision orbital elements
        "cov": "mat",              # covariance matrix – needed for Monte Carlo later
    }

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


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
        Asteroid designation for single-object queries.
    date_min : str, optional
        Start date in ISO format (``"2029-01-01"``).
    date_max : str, optional
        End date in ISO format (``"2029-12-31"``).
    dist_max : str, optional
        Maximum close-approach distance in AU (e.g. ``"0.1"``).

    Returns
    -------
    dict
        CAD JSON response with ``fields`` list and ``data`` list-of-lists.
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

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()


async def get_sentry_data(designation: str = None):
    """Fetch JPL Sentry impact-risk data.

    Parameters
    ----------
    designation : str, optional
        Asteroid designation.  If omitted the full Sentry risk-table is returned.

    Returns
    -------
    dict or None
        Sentry JSON response, or ``None`` if the object is not on the risk list.
    """
    url = f"{JPL_SSD_BASE_URL}/sentry.api"
    params: dict = {}
    if designation:
        params["des"] = designation

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        response = await client.get(url, params=params)
        if response.status_code == 200:
            return response.json()
        # Sentry returns 400 (unknown designation) or 404 — both mean "not on list"
        if response.status_code in (400, 404):
            return None
        response.raise_for_status()
        return None  # unreachable but satisfies type checkers
