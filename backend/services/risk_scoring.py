"""
Risk scoring: Torino scale, Palermo scale, and custom Insight Score.

References
----------
- Torino Scale: Binzel (2000), Planet. Space Sci. 48, 297–303.
  https://cneos.jpl.nasa.gov/sentry/torino_scale.html
- Palermo Technical Scale: Chesley et al. (2002), Icarus 159, 423–432.
- Background impact rate: Brown et al. (2002) / Shoemaker (1983) fit used by
  JPL: R_bg(E) ≈ 1/(100 · E^0.8) impacts/year for E in megatons TNT.

JSON contract (returned by ``compute_risk_scores``)
---------------------------------------------------
{
  "torino_scale":       int,          # 0–10
  "torino_label":       str,          # human label
  "torino_color":       str,          # "white"|"green"|"yellow"|"orange"|"red"
  "palermo_scale":      float,        # log10 of ratio to background rate
  "palermo_label":      str,
  "insight_score":      int,          # 0–100 (ImpactIQ custom UX metric)
  "insight_label":      str,
  "insight_note":       str,          # disclaimer that this is not an official scale
}
"""

from __future__ import annotations

import math


# ---------------------------------------------------------------------------
# Torino Scale lookup table
# (probability thresholds and energy thresholds from the published scale)
# ---------------------------------------------------------------------------

# Each entry: (min_prob, max_prob, min_energy_mt, label, color, score)
# Energy in megatons TNT.  Probability is impact probability P.
# Simplified from the official 2-D matrix — we map (P, E) → integer 0–10.

def torino_scale(impact_probability: float, energy_mt: float) -> dict:
    """Compute Torino Scale category from impact probability and energy.

    Parameters
    ----------
    impact_probability : float
        Empirical or published impact probability (0–1).
    energy_mt : float
        Estimated impact energy in megatons TNT.

    Returns
    -------
    dict
        ``{"torino_scale": int, "torino_label": str, "torino_color": str}``

    Notes
    -----
    Uses the simplified Torino Scale matrix.  Category 0 is the default
    for all objects with negligible probability (< 1e-4 for sub-global impacts).
    """
    P   = impact_probability
    E   = max(energy_mt, 1e-9)   # avoid log(0)

    # Torino 0 — no hazard
    if P < 1e-4:
        return {"torino_scale": 0, "torino_label": "No Hazard",
                "torino_color": "white"}

    # Torino 1 — routine discovery (P small, any energy)
    if P < 1e-2 and E < 1e3:
        return {"torino_scale": 1, "torino_label": "Normal",
                "torino_color": "green"}

    # Energy gates for higher categories
    if E < 1:       # sub-megaton (small local airburst)
        if P < 0.01:  return {"torino_scale": 1, "torino_label": "Normal",       "torino_color": "green"}
        if P < 0.5:   return {"torino_scale": 2, "torino_label": "Merits Attention (Local)", "torino_color": "yellow"}
        return             {"torino_scale": 3, "torino_label": "Merits Attention (Local)", "torino_color": "yellow"}

    if E < 1e3:     # 1 MT – 1000 MT (regional)
        if P < 0.01:  return {"torino_scale": 2, "torino_label": "Merits Attention", "torino_color": "yellow"}
        if P < 0.5:   return {"torino_scale": 4, "torino_label": "Merits Attention (Regional)", "torino_color": "yellow"}
        return             {"torino_scale": 6, "torino_label": "Threatening (Regional)", "torino_color": "orange"}

    if E < 1e5:     # 1000 MT – 100,000 MT (global threat range)
        if P < 0.01:  return {"torino_scale": 3, "torino_label": "Merits Attention (Global)", "torino_color": "yellow"}
        if P < 0.5:   return {"torino_scale": 7, "torino_label": "Threatening (Global)",   "torino_color": "orange"}
        return             {"torino_scale": 9, "torino_label": "Certain Collision",       "torino_color": "red"}

    # E ≥ 100,000 MT — mass extinction range
    if P < 0.5:       return {"torino_scale": 8, "torino_label": "Certain Collision (Global)", "torino_color": "red"}
    return                  {"torino_scale": 10, "torino_label": "Certain Global Catastrophe",  "torino_color": "red"}


def palermo_scale(
    impact_probability: float,
    energy_mt: float,
    years_until_impact: float,
) -> dict:
    """Compute Palermo Technical Scale value.

    PS = log10(P / (f_bg * T))

    where:
      P     = impact probability
      f_bg  = background frequency of impacts with energy ≥ E (per year)
              using Brown et al. (2002): f_bg ≈ 0.01 * E^{-0.8} [impacts/yr/MT]
      T     = time window in years

    Parameters
    ----------
    impact_probability : float
        Impact probability (0–1).
    energy_mt : float
        Energy in megatons TNT.
    years_until_impact : float
        Years until the potential impact date.

    Returns
    -------
    dict
        ``{"palermo_scale": float, "palermo_label": str}``
    """
    if impact_probability <= 0 or energy_mt <= 0 or years_until_impact <= 0:
        return {"palermo_scale": -10.0, "palermo_label": "No Hazard"}

    E       = max(energy_mt, 1e-9)
    f_bg    = 0.01 * (E ** -0.8)          # impacts/year with energy ≥ E
    T       = max(years_until_impact, 1/365)
    ps      = math.log10(impact_probability / (f_bg * T))

    if ps < -2:
        label = "No Cause for Concern"
    elif ps < 0:
        label = "Merits Monitoring"
    else:
        label = "Above Background — Warrants Attention"

    return {"palermo_scale": round(ps, 3), "palermo_label": label}


def insight_score(
    torino: int,
    impact_probability: float,
    energy_mt: float,
    palermo: float,
) -> dict:
    """Compute ImpactIQ custom Insight Score (0–100).

    This is a UX convenience metric, **not** an official scientific scale.
    It blends Torino category weight, probability, energy, and Palermo value
    into a single number a general audience can read like an air-quality index.

    Parameters
    ----------
    torino : int
        Torino Scale integer (0–10).
    impact_probability : float
        Impact probability (0–1).
    energy_mt : float
        Energy in megatons TNT.
    palermo : float
        Palermo Scale value.

    Returns
    -------
    dict
        ``{"insight_score": int, "insight_label": str, "insight_note": str}``
    """
    # Torino contribution (0–40 pts, heaviest weight)
    torino_pts = (torino / 10.0) * 40.0

    # Probability contribution (0–30 pts, log-scaled so small diffs matter)
    if impact_probability <= 0:
        prob_pts = 0.0
    else:
        # Map [1e-8, 1] → [0, 30] via log scale
        log_p  = max(-8, math.log10(impact_probability))
        prob_pts = max(0.0, (log_p + 8) / 8 * 30.0)

    # Energy contribution (0–20 pts, log-scaled [1e-3, 1e6] MT)
    if energy_mt <= 0:
        energy_pts = 0.0
    else:
        log_e  = max(-3, min(6, math.log10(energy_mt)))
        energy_pts = (log_e + 3) / 9 * 20.0

    # Palermo contribution (0–10 pts)
    palermo_pts = max(0.0, min(10.0, (palermo + 5) / 5 * 10.0))

    raw   = torino_pts + prob_pts + energy_pts + palermo_pts
    score = int(min(100, max(0, round(raw))))

    if score < 5:
        label = "No Detected Risk"
    elif score < 20:
        label = "Negligible"
    elif score < 40:
        label = "Low"
    elif score < 60:
        label = "Moderate"
    elif score < 80:
        label = "Elevated"
    else:
        label = "High"

    return {
        "insight_score": score,
        "insight_label": label,
        "insight_note":  (
            "ImpactIQ Insight Score is a custom UX metric (0–100) that blends "
            "Torino category, impact probability, energy, and Palermo value. "
            "It is NOT an official scientific scale. "
            "For authoritative risk data see NASA/JPL CNEOS."
        ),
    }


def compute_risk_scores(
    impact_probability: float,
    energy_mt: float,
    years_until_impact: float,
) -> dict:
    """Compute Torino, Palermo, and Insight Score in one call.

    Parameters
    ----------
    impact_probability : float
    energy_mt : float
    years_until_impact : float

    Returns
    -------
    dict
        Combined risk scoring dict — see module docstring for full schema.
    """
    t  = torino_scale(impact_probability, energy_mt)
    pa = palermo_scale(impact_probability, energy_mt, years_until_impact)
    ins = insight_score(t["torino_scale"], impact_probability, energy_mt, pa["palermo_scale"])
    return {**t, **pa, **ins}
