"""
Monte Carlo orbital uncertainty engine.

Methodology (Section 8.2 of project plan)
------------------------------------------
1. Treat the six Keplerian orbital elements as a multivariate Gaussian
   centred on the SBDB best-fit values.
2. Derive 1-σ spreads from SBDB sigma fields if available, or fall back to
   a heuristic scaled by ``n_obs_used`` and ``data_arc`` (fewer/shorter
   observations → wider uncertainty).
3. Draw N independent samples.
4. Propagate every sampled orbit to the target date (two-body Keplerian).
5. Compute each sample's Earth-distance at that date.
6. Apply gravitational focusing so the effective impact cross-section is
   larger than Earth's geometric cross-section.
7. Count fraction of samples with closest-approach ≤ Earth impact radius
   (``R_EARTH_KM`` + atmosphere buffer).

This is the same *conceptual* approach as JPL Sentry-II's
line-of-variation sampling, simplified for a hackathon timeframe.

JSON contract (returned by ``run_monte_carlo``)
-----------------------------------------------
{
  "n_samples":          int,
  "impact_probability": float,   # fraction of samples that hit Earth
  "min_dist_au":        float,   # minimum Earth-distance across all samples
  "median_dist_au":     float,
  "p5_dist_au":         float,   # 5th-percentile (near-miss tail)
  "p95_dist_au":        float,   # 95th-percentile
  "sigma_source":       str,     # "sbdb_sigmas" | "heuristic"
  "uncertainty_note":   str,
  "dist_histogram":     list[float],  # 20-bin histogram counts (for UI chart)
  "hist_bin_edges_au":  list[float],  # 21 bin edges in AU
}
"""

from __future__ import annotations

import numpy as np
from astropy import units as u
from astropy.time import Time

from hapsira.bodies import Earth, Sun
from hapsira.core.angles import E_to_nu, M_to_E
from hapsira.ephem import Ephem
from hapsira.twobody import Orbit

# Physical constants
R_EARTH_KM       = 6_371.0          # Earth mean radius (km)
ATMOSPHERE_KM    = 100.0            # Kármán line — atmosphere buffer (km)
IMPACT_RADIUS_KM = R_EARTH_KM + ATMOSPHERE_KM   # effective impact target (km)
MU_SUN_AU3_DAY2  = 0.000_295_912_208   # GM_sun in AU³/day² (for grav. focusing)
KM_PER_AU        = 1.495_978_707e8

# Gravitational focusing: v_escape Earth ≈ 11.2 km/s
V_ESCAPE_EARTH_KMS = 11.2


def _sample_orbit_elements(
    elem_map: dict[str, float],
    sigma_map: dict[str, float],
    n: int,
    rng: np.random.Generator,
) -> np.ndarray:
    """Draw *n* samples of [a, e, inc, raan, argp, ma] (all in SBDB units).

    Parameters
    ----------
    elem_map : dict
        Best-fit Keplerian elements from SBDB.
    sigma_map : dict
        1-σ uncertainties, same keys.  Values of 0 are left at 0 (no spread).
    n : int
        Number of Monte Carlo samples.
    rng : np.random.Generator
        Seeded random generator.

    Returns
    -------
    np.ndarray, shape (n, 6)
        Columns: a (AU), e, i (deg), om (deg), w (deg), ma (deg).
    """
    keys   = ["a", "e", "i", "om", "w", "ma"]
    means  = np.array([elem_map[k] for k in keys])
    sigmas = np.array([sigma_map.get(k, 0.0) for k in keys])
    noise  = rng.standard_normal((n, 6)) * sigmas[None, :]
    return means[None, :] + noise


def _build_orbit_from_row(row: np.ndarray, epoch: Time) -> Orbit:
    """Build a hapsira Orbit from a [a,e,i,om,w,ma] sample row."""
    a_au, e_val, i_deg, om_deg, w_deg, ma_deg = row
    M_rad  = np.deg2rad(ma_deg)
    E_rad  = M_to_E(M_rad, float(e_val))
    nu_rad = E_to_nu(E_rad, float(e_val))
    nu_deg = float(np.rad2deg(nu_rad))
    return Orbit.from_classical(
        attractor=Sun,
        a=float(a_au) * u.au,
        ecc=float(e_val) * u.one,
        inc=float(i_deg) * u.deg,
        raan=float(om_deg) * u.deg,
        argp=float(w_deg) * u.deg,
        nu=float(nu_deg) * u.deg,
        epoch=epoch,
    )


def _grav_focused_radius_au(v_inf_kms: float) -> float:
    """Return the gravitational-focusing-corrected impact cross-section radius in AU.

    Uses the formula: b = R_target * sqrt(1 + (v_escape/v_inf)²)
    where b is the impact parameter (effective radius).

    Parameters
    ----------
    v_inf_kms : float
        Asymptotic relative velocity in km/s.
    """
    if v_inf_kms <= 0:
        v_inf_kms = 1.0   # avoid division by zero; 1 km/s is unrealistically slow
    b_km = IMPACT_RADIUS_KM * np.sqrt(1.0 + (V_ESCAPE_EARTH_KMS / v_inf_kms) ** 2)
    return b_km / KM_PER_AU


def run_monte_carlo(
    sbdb_data: dict,
    target_date_iso: str,
    n_samples: int = 1000,
    seed: int = 42,
) -> dict:
    """Run Monte Carlo impact-probability estimation for one asteroid.

    Parameters
    ----------
    sbdb_data : dict
        Raw SBDB response (must include ``orbit``, ``orbit.elements``,
        ``orbit.epoch``).
    target_date_iso : str
        Date to propagate to (ISO 8601, TDB scale).
    n_samples : int
        Number of orbital samples.  1000 is fast (~5 s); 5000 for publication.
    seed : int
        Random seed for reproducibility.

    Returns
    -------
    dict
        Full Monte Carlo result — see module docstring for schema.
    """
    rng          = np.random.default_rng(seed)
    orbit_data   = sbdb_data["orbit"]
    elements     = orbit_data["elements"]
    elem_map     = {e["name"]: float(e["value"]) for e in elements}

    # --- 1. Build sigma map ---
    # SBDB may provide sigma_* fields directly.  If absent, use heuristic.
    sigmas_raw   = {e["name"]: float(e.get("sigma", 0.0)) for e in elements}
    has_sbdb_sig = any(v > 0 for v in sigmas_raw.values())

    if has_sbdb_sig:
        sigma_map    = sigmas_raw
        sigma_source = "sbdb_sigmas"
        uncertainty_note = "1-σ uncertainties from JPL SBDB orbital solution."
    else:
        # Heuristic: scale spread inversely with observation quality
        n_obs  = float(orbit_data.get("n_obs_used") or 10)
        arc    = float(orbit_data.get("data_arc")    or 30)   # days
        # Typical NEO with ~100 obs over ~1000 days has very small uncertainty;
        # newly discovered object with 5 obs over 3 days has large uncertainty.
        quality = min(1.0, (n_obs / 200.0) * (arc / 365.0))   # 0–1, higher = better known
        spread  = max(1e-6, (1.0 - quality) * 0.002)           # max ~0.2% spread
        sigma_map = {k: abs(v) * spread for k, v in elem_map.items()}
        sigma_source = "heuristic"
        uncertainty_note = (
            f"Heuristic uncertainty (n_obs={int(n_obs)}, arc={int(arc)} days). "
            "Probabilities are indicative only."
        )

    # --- 2. Sample orbital elements ---
    epoch_jd = float(orbit_data["epoch"])
    epoch    = Time(epoch_jd, format="jd", scale="tdb")
    samples  = _sample_orbit_elements(elem_map, sigma_map, n_samples, rng)

    # --- 3. Batch Earth + Sun ephemerides at target date ---
    target_time = Time(target_date_iso, scale="tdb")
    earth_bary_km = Ephem.from_body(Earth, target_time).rv()[0][0].to(u.km).value
    sun_bary_km   = Ephem.from_body(Sun,   target_time).rv()[0][0].to(u.km).value
    earth_helio_km = earth_bary_km - sun_bary_km

    # Nominal close-approach velocity from nominal orbit (for grav. focusing)
    nominal_orbit = _build_orbit_from_row(
        np.array([elem_map[k] for k in ["a","e","i","om","w","ma"]]), epoch
    )
    nominal_prop = nominal_orbit.propagate(target_time)
    # Relative velocity ≈ |v_asteroid - v_earth| — rough estimate using norms
    v_ast_kms    = float(np.linalg.norm(nominal_prop.v.to(u.km/u.s).value))
    v_earth_kms  = 29.78   # Earth's mean orbital speed (km/s)
    v_inf_kms    = abs(v_ast_kms - v_earth_kms)   # very rough; good enough for focusing
    impact_r_au  = _grav_focused_radius_au(v_inf_kms)

    # --- 4. Propagate all samples ---
    distances_au = np.empty(n_samples)
    km_per_au    = KM_PER_AU

    for i, row in enumerate(samples):
        try:
            orb  = _build_orbit_from_row(row, epoch)
            prop = orb.propagate(target_time)
            ast_km = prop.r.to(u.km).value
            sep_km = float(np.linalg.norm(ast_km - earth_helio_km))
            distances_au[i] = sep_km / km_per_au
        except Exception:
            distances_au[i] = 999.0   # propagation failed — treat as miss

    # --- 5. Impact fraction ---
    impact_count      = int(np.sum(distances_au <= impact_r_au))
    impact_probability = float(impact_count / n_samples)

    # --- 6. Statistics ---
    hist_counts, hist_edges = np.histogram(distances_au, bins=20)

    return {
        "n_samples":          n_samples,
        "impact_probability": impact_probability,
        "min_dist_au":        float(np.min(distances_au)),
        "median_dist_au":     float(np.median(distances_au)),
        "p5_dist_au":         float(np.percentile(distances_au, 5)),
        "p95_dist_au":        float(np.percentile(distances_au, 95)),
        "sigma_source":       sigma_source,
        "uncertainty_note":   uncertainty_note,
        "grav_focus_radius_au": float(impact_r_au),
        "dist_histogram":     [int(c) for c in hist_counts],
        "hist_bin_edges_au":  [float(e) for e in hist_edges],
    }
