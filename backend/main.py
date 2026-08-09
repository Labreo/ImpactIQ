"""
ImpactIQ — Asteroid Impact Risk Predictor
FastAPI backend entry-point.

Endpoints
---------
GET /                              Health check
GET /api/neo/browse                NeoWs browse (paginated)
GET /api/asteroid/{designation}    SBDB + CAD data for one object
GET /api/validate/{designation}    Two-body propagation vs. JPL CAD (Week-1 milestone)
GET /api/analyze/{designation}     FULL PIPELINE: propagation + MC + risk + consequence + AI brief
GET /api/sentry                    Full JPL Sentry risk-table
GET /api/sentry/{designation}      Single-object Sentry entry (404 if not on list)
GET /api/cache/stats               SQLite cache stats (hit/miss proof)
"""

import asyncio
from datetime import datetime, timezone
from functools import partial

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from services.cache import cache_stats
from services.consequence import estimate_consequences
from services.granite import generate_brief
from services.monte_carlo import run_monte_carlo
from services.nasa_api import (
    get_cad_data,
    get_sbdb_data,
    get_sentry_data,
    search_neows,
)
from services.physics import (
    get_orbit_points,
    parse_sbdb_orbit,
    validate_close_approach,
)
from services.risk_scoring import compute_risk_scores

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
# FULL PIPELINE: analyze endpoint (Week-2 milestone)
# ---------------------------------------------------------------------------

@app.get("/api/analyze/{designation}", tags=["Analysis"])
async def analyze_asteroid(
    designation: str,
    n_samples: int = Query(500, ge=100, le=5000, description="Monte Carlo sample count"),
    skip_ai: bool = Query(False, description="Skip Granite brief (faster, for testing)"),
):
    """Full ImpactIQ analysis pipeline for one asteroid.

    Fetches SBDB + CAD data, propagates the orbit, runs Monte Carlo
    uncertainty sampling, computes Torino/Palermo/Insight scores,
    estimates impact consequences, and generates an IBM Granite mission brief.

    Parameters
    ----------
    designation : str
        Asteroid name or designation, e.g. ``Apophis``, ``2010+FX9``.
    n_samples : int
        Monte Carlo sample count (100–5000).  Default 500.
    skip_ai : bool
        If True, skips the Granite brief call (useful for rapid testing).

    Returns
    -------
    dict
        Full structured analysis result — see inline keys below.
    """
    try:
        loop = asyncio.get_event_loop()

        # --- 1. Fetch data ---
        sbdb = await get_sbdb_data(designation)
        numeric_des = sbdb.get("object", {}).get("des", designation)
        full_name   = sbdb.get("object", {}).get("fullname", designation)

        # Get next close approach (next 20 years)
        now_year  = datetime.now(timezone.utc).year
        cad = await get_cad_data(
            designation=numeric_des,
            date_min=f"{now_year}-01-01",
            date_max=f"{now_year + 20}-12-31",
        )

        cad_rows = cad.get("data") or []
        if not cad_rows:
            # No close approach found — use a nominal 1-year forward date
            from astropy.time import Time
            target_date_iso = Time.now().isot
            jpl_dist_au     = 1.0
            jpl_date_str    = "no close approach in 20-year window"
            years_until     = 1.0
            velocity_kms    = 15.0
        else:
            fields       = cad["fields"]
            first        = cad_rows[0]
            jpl_jd       = float(first[fields.index("jd")])
            jpl_dist_au  = float(first[fields.index("dist")])
            jpl_date_str = first[fields.index("cd")]
            velocity_kms = float(first[fields.index("v_rel")])
            from astropy.time import Time
            target_date_iso = Time(jpl_jd, format="jd", scale="tdb").isot
            years_until     = max(0.01, (jpl_jd - Time.now().jd) / 365.25)

        # --- 2. Parse orbit + orbit path for 3D ---
        orbit      = await loop.run_in_executor(None, parse_sbdb_orbit, sbdb)
        orbit_path = await loop.run_in_executor(None, partial(get_orbit_points, orbit, 60))

        # --- 3. Monte Carlo ---
        mc = await loop.run_in_executor(
            None, partial(run_monte_carlo, sbdb, target_date_iso, n_samples)
        )

        # --- 4. Physical parameters ---
        # Diameter: try phys_par, fall back to NeoWs estimated_diameter
        phys   = {p["name"]: p for p in (sbdb.get("phys_par") or [])}
        diam_m = 0.0
        if "diameter" in phys:
            try:
                diam_m = float(phys["diameter"]["value"]) * 1_000  # km → m
            except (ValueError, TypeError):
                diam_m = 0.0
        if diam_m <= 0:
            # Fall back to absolute magnitude H → diameter estimate
            h_mag = float(phys["H"]["value"]) if "H" in phys else 20.0
            # D ≈ 1329 / sqrt(albedo) * 10^(-H/5)  km; assume albedo=0.154 (S-type avg)
            diam_m = 1329 / (0.154 ** 0.5) * (10 ** (-h_mag / 5)) * 1_000

        # --- 5. Consequence model ---
        consequence = await loop.run_in_executor(
            None, partial(estimate_consequences, max(1.0, diam_m), velocity_kms)
        )
        energy_mt = consequence["energy_mt"]

        # --- 6. Risk scoring ---
        risk = compute_risk_scores(mc["impact_probability"], energy_mt, years_until)

        # --- 7. Granite AI brief ---
        if skip_ai:
            brief = {
                "title": f"{full_name} — Mission Brief",
                "bottom_line": "AI brief skipped (skip_ai=true).",
                "if_it_happened": "",
                "whats_next": "",
                "guardian_ok": True,
                "raw_model": "skipped",
            }
        else:
            brief_input = {
                "designation":         numeric_des,
                "full_name":           full_name,
                "close_approach_date": jpl_date_str,
                "jpl_dist_au":         round(jpl_dist_au, 6),
                "computed_dist_au":    round(mc["median_dist_au"], 6),
                "impact_probability":  mc["impact_probability"],
                "torino_scale":        risk["torino_scale"],
                "torino_label":        risk["torino_label"],
                "palermo_scale":       risk["palermo_scale"],
                "insight_score":       risk["insight_score"],
                "diameter_m":          round(diam_m, 1),
                "energy_mt":           round(energy_mt, 4),
                "damage_category":     consequence["damage_category"],
                "damage_radius_km":    round(consequence["damage_radius_km"], 1),
                "airburst":            consequence["airburst"],
                "sigma_source":        mc["sigma_source"],
                "uncertainty_note":    mc["uncertainty_note"],
            }
            brief = await loop.run_in_executor(None, partial(generate_brief, brief_input))

        return {
            "designation":      numeric_des,
            "full_name":        full_name,
            "close_approach":   {
                "date":         jpl_date_str,
                "jpl_dist_au":  jpl_dist_au,
                "velocity_kms": velocity_kms,
                "years_until":  round(years_until, 2),
            },
            "monte_carlo":      mc,
            "consequence":      consequence,
            "risk":             risk,
            "orbit_path":       orbit_path,
            "ai_brief":         brief,
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
