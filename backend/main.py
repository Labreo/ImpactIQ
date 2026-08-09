"""
ImpactIQ — Asteroid Impact Risk Predictor
FastAPI backend entry-point.

Endpoints
---------
GET /                              Health check
GET /api/neo/browse                NeoWs browse (paginated)
GET /api/asteroid/{designation}    SBDB + CAD data for one object
GET /api/validate/{designation}    Two-body propagation vs. JPL CAD (Week-1 milestone)
GET /api/sentry                    Full JPL Sentry risk-table
GET /api/sentry/{designation}      Single-object Sentry entry (404 if not on list)
GET /api/cache/stats               SQLite cache stats (hit/miss proof)
"""

import asyncio
from functools import partial

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from services.cache import cache_stats
from services.nasa_api import (
    get_cad_data,
    get_sbdb_data,
    get_sentry_data,
    search_neows,
)
from services.physics import (
    parse_sbdb_orbit,
    validate_close_approach,
)

app = FastAPI(
    title="ImpactIQ — Asteroid Impact Risk Predictor API",
    description=(
        "Fetch real NASA/JPL near-Earth object data, propagate orbits, "
        "score impact risk, and generate AI-powered mission briefs."
    ),
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten to the deployed frontend URL before production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/", tags=["Health"])
def read_root():
    return {"status": "ok", "message": "ImpactIQ API is running."}


# ---------------------------------------------------------------------------
# NeoWs browse
# ---------------------------------------------------------------------------

@app.get("/api/neo/browse", tags=["NEOs"])
async def browse_neos():
    """Return the NeoWs browse feed (first page, ~20 objects)."""
    try:
        return await search_neows()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---------------------------------------------------------------------------
# Single asteroid: SBDB + CAD
# ---------------------------------------------------------------------------

@app.get("/api/asteroid/{designation}", tags=["NEOs"])
async def get_asteroid_info(designation: str):
    """Return full SBDB orbital elements + CAD close-approach table for one object.

    Parameters
    ----------
    designation : str
        Asteroid name or designation, e.g. ``Apophis``, ``99942``, ``2025+UC11``.
    """
    try:
        sbdb = await get_sbdb_data(designation)
        numeric_des = sbdb.get("object", {}).get("des", designation)
        cad = await get_cad_data(designation=numeric_des)
        return {"sbdb": sbdb, "cad": cad}
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---------------------------------------------------------------------------
# Orbit-propagation validation  (Week-1 milestone endpoint)
# ---------------------------------------------------------------------------

@app.get("/api/validate/{designation}", tags=["Validation"])
async def validate_orbit(designation: str, year_min: str = None, year_max: str = None):
    """Validate two-body Keplerian propagation against the nearest JPL CAD record.

    Fetches SBDB orbital elements, propagates the orbit to the date of the
    closest CAD close-approach entry (within the optional year range), then
    compares the computed Earth-distance against JPL's published value.

    This is the **Week-1 technical-credibility milestone** from the project plan.

    Parameters
    ----------
    designation : str
        Asteroid designation, e.g. ``99942`` (Apophis) or ``2025+UC11``.
    year_min : str, optional
        Earliest year to search for a CAD entry (e.g. ``"2025"``).
    year_max : str, optional
        Latest year to search for a CAD entry (e.g. ``"2030"``).

    Returns
    -------
    dict
        ``{
          "designation": str,
          "jpl_date": str,
          "jpl_dist_au": float,
          "computed_dist_au": float,
          "abs_error_au": float,
          "rel_error_pct": float,
          "tolerance_au": float,
          "passed": bool,
          "note": str
        }``
    """
    try:
        # Build date range
        date_min = f"{year_min}-01-01" if year_min else "2020-01-01"
        date_max = f"{year_max}-12-31" if year_max else "2035-12-31"

        # Fetch SBDB first — we need the numeric designation for CAD
        # (CAD rejects names like "Apophis"; it requires the number "99942")
        sbdb = await get_sbdb_data(designation)
        numeric_des = sbdb.get("object", {}).get("des", designation)

        cad = await get_cad_data(
            designation=numeric_des, date_min=date_min, date_max=date_max
        )

        data = cad.get("data")
        if not data:
            raise HTTPException(
                status_code=404,
                detail=f"No CAD close-approach records found for '{designation}' "
                       f"between {date_min} and {date_max}.",
            )

        # Pick the first (closest-in-time) record
        fields = cad["fields"]
        jd_idx = fields.index("jd")
        dist_idx = fields.index("dist")
        cd_idx = fields.index("cd")

        first = data[0]
        jpl_jd = float(first[jd_idx])
        jpl_dist_au = float(first[dist_idx])
        jpl_date_str = first[cd_idx]  # human-readable, e.g. "2026-Sep-14 03:58"

        from astropy.time import Time
        jpl_date_iso = Time(jpl_jd, format="jd", scale="tdb").isot

        # Parse orbit (CPU-bound — offload to thread pool)
        loop = asyncio.get_event_loop()
        orbit = await loop.run_in_executor(None, parse_sbdb_orbit, sbdb)

        # Run validation — use 60 steps for API speed; tests use 500 for accuracy
        result = await loop.run_in_executor(
            None,
            partial(
                validate_close_approach,
                orbit,
                jpl_date_iso,
                jpl_dist_au,
                5,   # search_window_days
                60,  # n_steps (fast enough for HTTP; ~5s instead of ~2min)
            ),
        )

        return {
            "designation": designation,
            "jpl_date": jpl_date_str,
            "jpl_date_iso": jpl_date_iso,
            **result,
            "note": (
                "Two-body Keplerian propagation; planetary perturbations excluded. "
                "Tolerance is set generously to account for this fidelity limitation."
            ),
        }

    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---------------------------------------------------------------------------
# Sentry impact-risk table
# ---------------------------------------------------------------------------

@app.get("/api/sentry", tags=["Sentry"])
async def get_sentry_list():
    """Return the full JPL Sentry impact-risk table."""
    try:
        return await get_sentry_data()
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/api/sentry/{designation}", tags=["Sentry"])
async def get_sentry_object(designation: str):
    """Return JPL Sentry data for a single object, or 404 if not on the risk list."""
    try:
        result = await get_sentry_data(designation)
        if result is None:
            raise HTTPException(
                status_code=404,
                detail=f"'{designation}' is not currently on the JPL Sentry risk list.",
            )
        return result
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


# ---------------------------------------------------------------------------
# Cache diagnostics
# ---------------------------------------------------------------------------

@app.get("/api/cache/stats", tags=["Debug"])
def get_cache_stats():
    """Return SQLite cache row count and timestamps — proves caching is live."""
    return cache_stats()
