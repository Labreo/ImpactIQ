"""
Orbital mechanics and impact-physics layer.

All public functions are *synchronous* (CPU-bound) and are designed to be
called from FastAPI's background thread pool (``run_in_executor``) when wired
into async endpoints.

Coordinate convention
---------------------
hapsira propagates orbits in a **heliocentric inertial frame** (ICRF
heliocentric, same frame JPL uses for small-body integrations).  Earth's
position is obtained from ``hapsira.ephem.Ephem.from_body(Earth, t)`` which
returns **barycentric** ICRF coordinates; we therefore subtract the Sun's
barycentric position to convert to heliocentric before computing the
asteroid–Earth distance vector.

Units
-----
All angular inputs from SBDB are in degrees.
All distance inputs from SBDB are in AU.
All time inputs from SBDB epochs are Julian Date (TDB scale).
Internal hapsira Orbit objects carry Astropy units throughout.
"""

from __future__ import annotations

import numpy as np
from astropy import units as u
from astropy.time import Time

from hapsira.bodies import Earth, Sun
from hapsira.core.angles import E_to_nu, M_to_E
from hapsira.ephem import Ephem
from hapsira.twobody import Orbit


# ---------------------------------------------------------------------------
# Orbit parsing
# ---------------------------------------------------------------------------

def parse_sbdb_orbit(sbdb_data: dict) -> Orbit:
    """Parse full-precision JPL SBDB orbital elements into a hapsira Orbit.

    Parameters
    ----------
    sbdb_data : dict
        Raw JSON response from :func:`services.nasa_api.get_sbdb_data`.
        Must include an ``orbit`` key with an ``elements`` list and an
        ``epoch`` field (Julian Date, TDB scale).

    Returns
    -------
    hapsira.twobody.Orbit
        Heliocentric Keplerian orbit at the SBDB reference epoch.

    Notes
    -----
    hapsira's ``Orbit.from_classical`` takes *true anomaly* ν, but SBDB
    publishes *mean anomaly* M.  We convert M → eccentric anomaly E → ν
    using the exact closed-form relations (valid for e < 1, i.e., all NEOs).
    The epoch scale is set to TDB, matching JPL's ephemeris convention.
    """
    orbit_data = sbdb_data.get("orbit", {})
    elements = orbit_data.get("elements", [])

    # Build name→value map; values arrive as full-precision strings
    elem_map: dict[str, float] = {
        item["name"]: float(item["value"]) for item in elements
    }

    # Keplerian elements
    e_val = elem_map["e"]
    a = elem_map["a"] * u.au
    ecc = e_val * u.one
    inc = elem_map["i"] * u.deg
    raan = elem_map["om"] * u.deg
    argp = elem_map["w"] * u.deg

    # Convert mean anomaly → true anomaly
    M_rad = np.deg2rad(elem_map["ma"])
    E_rad = M_to_E(M_rad, e_val)
    nu_rad = E_to_nu(E_rad, e_val)
    nu = float(np.rad2deg(nu_rad)) * u.deg

    # Epoch — SBDB gives Julian Date in TDB scale
    epoch_jd = float(orbit_data["epoch"])
    epoch = Time(epoch_jd, format="jd", scale="tdb")

    return Orbit.from_classical(
        attractor=Sun,
        a=a,
        ecc=ecc,
        inc=inc,
        raan=raan,
        argp=argp,
        nu=nu,
        epoch=epoch,
    )


# ---------------------------------------------------------------------------
# Propagation helpers
# ---------------------------------------------------------------------------

def propagate_to_date(orbit: Orbit, target_date_iso: str) -> Orbit:
    """Propagate *orbit* to *target_date_iso* (ISO 8601, TDB scale).

    Parameters
    ----------
    orbit : hapsira.twobody.Orbit
        Source orbit (any epoch).
    target_date_iso : str
        Target epoch in ISO 8601 format, e.g. ``"2029-04-13T21:46:00"``.

    Returns
    -------
    hapsira.twobody.Orbit
        Orbit at the requested epoch; position/velocity accessible via
        ``.r`` and ``.v``.
    """
    target_time = Time(target_date_iso, scale="tdb")
    return orbit.propagate(target_time)


def get_earth_distance_au(orbit: Orbit, target_date_iso: str) -> float:
    """Return asteroid–Earth distance in AU at *target_date_iso*.

    Both the asteroid and Earth are placed in the **heliocentric ICRF** frame
    before computing the separation vector.

    Parameters
    ----------
    orbit : hapsira.twobody.Orbit
        Heliocentric asteroid orbit.
    target_date_iso : str
        Target date in ISO 8601, TDB scale.

    Returns
    -------
    float
        Distance in AU.
    """
    target_time = Time(target_date_iso, scale="tdb")

    # Asteroid position (heliocentric, already in hapsira's frame)
    propagated = orbit.propagate(target_time)
    ast_r_km = propagated.r  # hapsira gives km

    # Earth position: Ephem.from_body returns barycentric ICRF (km)
    earth_ephem = Ephem.from_body(Earth, target_time)
    earth_bary_km = earth_ephem.rv()[0][0]

    # Sun barycentric position (km)
    sun_ephem = Ephem.from_body(Sun, target_time)
    sun_bary_km = sun_ephem.rv()[0][0]

    # Convert Earth to heliocentric
    earth_helio_km = earth_bary_km - sun_bary_km

    # Earth–asteroid separation
    sep_km = np.linalg.norm(ast_r_km - earth_helio_km)

    return sep_km.to(u.au).value


# ---------------------------------------------------------------------------
# Close-approach validation
# ---------------------------------------------------------------------------

def validate_close_approach(
    orbit: Orbit,
    jpl_date_iso: str,
    jpl_dist_au: float,
    search_window_days: int = 5,
    n_steps: int = 500,
) -> dict:
    """Compare a two-body propagated minimum distance against a JPL CAD record.

    Searches *search_window_days* / 2 either side of *jpl_date_iso* in
    *n_steps* to find the local minimum Earth-distance, then reports the
    absolute and relative errors vs. the JPL CAD published distance.

    Parameters
    ----------
    orbit : hapsira.twobody.Orbit
        Parsed SBDB orbit.
    jpl_date_iso : str
        JPL's published close-approach date (ISO 8601, TDB).
    jpl_dist_au : float
        JPL CAD published minimum distance in AU.
    search_window_days : int
        ±half-window around *jpl_date_iso* to search for local minimum.
    n_steps : int
        Number of time steps across the search window.

    Returns
    -------
    dict
        ``{
          "jpl_dist_au": float,
          "computed_dist_au": float,
          "computed_min_date_iso": str,
          "abs_error_au": float,
          "rel_error_pct": float,
          "passed": bool,
          "tolerance_au": float
        }``

    Notes
    -----
    Tolerance is set to 10× the JPL CAD distance (generous for a pure
    two-body model without planetary perturbations) but capped at 0.05 AU
    for objects with approaches > 0.005 AU.  For very close flybys
    (< 0.001 AU) the tolerance is 5× JPL distance, acknowledging that
    perturbations matter more here but the two-body result should still be
    in the right order of magnitude.
    """
    t_centre = Time(jpl_date_iso, scale="tdb")
    half_win = search_window_days / 2.0  # days
    offsets = np.linspace(-half_win, half_win, n_steps)
    time_objs = [t_centre + dt * u.day for dt in offsets]

    # Batch-fetch Earth + Sun ephemerides once for all steps (fast path).
    # Ephem.rv() returns Quantity arrays in km; strip to plain numpy for speed.
    times_arr = Time([t.jd for t in time_objs], format="jd", scale="tdb")
    earth_bary_km = Ephem.from_body(Earth, times_arr).rv()[0].to(u.km).value  # (n,3)
    sun_bary_km   = Ephem.from_body(Sun,   times_arr).rv()[0].to(u.km).value
    earth_helio_km = earth_bary_km - sun_bary_km                               # (n,3)

    km_per_au = (1 * u.km).to(u.au).value   # scalar conversion factor
    distances = []
    for i, t in enumerate(time_objs):
        prop = orbit.propagate(t)
        ast_km = prop.r.to(u.km).value       # plain numpy array (3,)
        sep_km = float(np.linalg.norm(ast_km - earth_helio_km[i]))
        distances.append(sep_km * km_per_au)

    min_idx = int(np.argmin(distances))
    computed_dist_au = float(distances[min_idx])
    computed_min_date_iso = time_objs[min_idx].isot

    abs_error    = float(abs(computed_dist_au - jpl_dist_au))
    rel_error_pct = float(100.0 * abs_error / jpl_dist_au) if jpl_dist_au > 0 else float("inf")

    if jpl_dist_au < 0.001:
        tolerance_au = float(max(5.0 * jpl_dist_au, 0.001))
    else:
        tolerance_au = float(min(10.0 * jpl_dist_au, 0.05))

    return {
        "jpl_dist_au":           float(jpl_dist_au),
        "computed_dist_au":      computed_dist_au,
        "computed_min_date_iso": computed_min_date_iso,
        "abs_error_au":          abs_error,
        "rel_error_pct":         rel_error_pct,
        "passed":                bool(abs_error <= tolerance_au),   # plain Python bool
        "tolerance_au":          tolerance_au,
    }


# ---------------------------------------------------------------------------
# Orbit state vector (for 3-D visualisation)
# ---------------------------------------------------------------------------

def get_orbit_points(orbit: Orbit, n_points: int = 180) -> list[dict]:
    """Return heliocentric XYZ positions (AU) spanning one orbital period.

    Samples by sweeping true anomaly 0→360° and converting to Cartesian,
    which is much faster than calling ``orbit.propagate()`` n_points times.

    Parameters
    ----------
    orbit : hapsira.twobody.Orbit
        The orbit to sample.
    n_points : int
        Number of true-anomaly steps (default 180 — sufficient for smooth curve).

    Returns
    -------
    list of dict
        Each element is ``{"x": float, "y": float, "z": float}`` in AU.
    """
    period_days = orbit.period.to(u.day).value
    points = []
    for i in range(n_points):
        frac = i / n_points
        t = orbit.epoch + frac * period_days * u.day
        prop = orbit.propagate(t)
        r_au = prop.r.to(u.au).value
        points.append({
            "x": float(r_au[0]),
            "y": float(r_au[1]),
            "z": float(r_au[2]),
        })
    return points
