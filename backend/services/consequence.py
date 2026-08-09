"""
Impact consequence model — simplified Earth Impact Effects Program (EIEP).

Scientific basis
----------------
Collins, G.S., Melosh, H.J. & Marcus, R.A. (2005).
"Earth Impact Effects Program: A Web-based computer program for calculating the
regional environmental consequences of a meteoroid impact on Earth."
Meteoritics & Planetary Science, 40(6), 817–840.
https://impact.ese.ic.ac.uk/ImpactEffects/

All outputs are ORDER-OF-MAGNITUDE ESTIMATES for a HYPOTHETICAL SCENARIO.
They are NOT operational predictions.  Label them as such in every UI surface.

JSON contract (returned by ``estimate_consequences``)
----------------------------------------------------
{
  "diameter_m":          float,   # impactor diameter (m)
  "density_kgm3":        float,   # assumed bulk density (kg/m³)
  "mass_kg":             float,
  "impact_velocity_kms": float,   # km/s
  "impact_angle_deg":    float,   # degrees from horizontal (45° is most probable)
  "kinetic_energy_j":    float,   # Joules
  "energy_mt":           float,   # megatons TNT
  "energy_hiroshima":    float,   # multiples of Hiroshima bomb (~15 kt = 6.276e13 J)
  "crater_diameter_m":   float,   # transient crater diameter (m); 0 if airburst
  "airburst":            bool,    # True if object disrupts before ground impact
  "airburst_altitude_km":float,   # km; 0 if ground impact
  "damage_category":     str,     # "negligible"|"local"|"regional"|"continental"|"global"
  "damage_radius_km":    float,   # rough blast-damage radius (km)
  "disclaimer":          str,
}
"""

from __future__ import annotations

import math

# Physical constants
J_PER_MT_TNT   = 4.184e15       # Joules per megaton TNT
J_PER_KT_TNT   = 4.184e12       # Joules per kiloton TNT
J_HIROSHIMA    = 6.276e13       # Hiroshima bomb (~15 kt)
G_EARTH        = 9.81           # m/s²
RHO_TARGET_ROCK = 2700.0        # kg/m³ — typical rock target density

# Bulk density defaults by composition class (kg/m³)
DENSITY_BY_CLASS = {
    "C": 1_500,   # carbonaceous
    "S": 2_700,   # silicaceous (most common NEOs)
    "M": 5_000,   # metallic
    "default": 2_000,
}

# Airburst disruption: objects weaker than this specific energy threshold
# disrupt in the atmosphere.  Rough threshold from Chyba et al. (1993):
# stony objects < ~50 m disrupt at altitude; iron objects resist longer.
AIRBURST_DIAMETER_STONE_M = 50.0   # stony objects below this → airburst
AIRBURST_DIAMETER_IRON_M  = 15.0   # iron objects — much smaller threshold

_DISCLAIMER = (
    "Order-of-magnitude estimate for a hypothetical scenario using simplified "
    "EIEP-style physics (Collins, Melosh & Marcus 2005). "
    "NOT an operational prediction. For authoritative data see NASA/JPL CNEOS."
)


def _sphere_mass(diameter_m: float, density_kgm3: float) -> float:
    """Mass of a sphere in kg."""
    r = diameter_m / 2.0
    return (4.0 / 3.0) * math.pi * r**3 * density_kgm3


def _kinetic_energy(mass_kg: float, velocity_kms: float) -> float:
    """Kinetic energy in Joules.  velocity in km/s."""
    v_ms = velocity_kms * 1_000.0
    return 0.5 * mass_kg * v_ms**2


def _crater_diameter(energy_j: float, angle_deg: float) -> float:
    """Simplified transient crater diameter (m) for a ground impact.

    Uses Pi-scaling relation (Holsapple 1993) in the gravity regime,
    simplified to: D_t ≈ 1.16 * (E/rho_t*g)^(1/3) * sin(angle)^(1/3)
    where E is kinetic energy (J), rho_t is target density, g is gravity.

    Parameters
    ----------
    energy_j : float
        Kinetic energy at impact in Joules.
    angle_deg : float
        Impact angle from horizontal (degrees).

    Returns
    -------
    float
        Transient crater diameter in metres.
    """
    angle_rad = math.radians(max(1.0, angle_deg))
    # Pi-scaling gravity regime (simplified)
    D_t = 1.16 * (energy_j / (RHO_TARGET_ROCK * G_EARTH)) ** (1.0 / 3.0) * math.sin(angle_rad) ** (1.0 / 3.0)
    return float(D_t)


def _damage_radius(energy_mt: float) -> float:
    """Rough blast-overpressure damage radius at 1 psi overpressure (km).

    Rule of thumb from nuclear weapons literature (also used by
    NASA's asteroid impact hazard assessments):
    R_km ≈ 17 * E_mt^(1/3)   (1 psi = window breakage radius)
    """
    return 17.0 * (max(energy_mt, 1e-9) ** (1.0 / 3.0))


def estimate_consequences(
    diameter_m: float,
    impact_velocity_kms: float,
    composition_class: str = "S",
    impact_angle_deg: float = 45.0,
) -> dict:
    """Estimate impact consequences for a given impactor.

    Parameters
    ----------
    diameter_m : float
        Impactor diameter in metres.
    impact_velocity_kms : float
        Impact velocity in km/s (use relative velocity from CAD / propagator).
    composition_class : str
        One of "C" (carbonaceous), "S" (stony), "M" (metallic).
        Defaults to "S" (most common NEO type).
    impact_angle_deg : float
        Impact angle from horizontal in degrees.
        45° is statistically most probable; use 90° for maximum energy.

    Returns
    -------
    dict
        Full consequence dict — see module docstring for schema.
    """
    density  = DENSITY_BY_CLASS.get(composition_class.upper(),
                                     DENSITY_BY_CLASS["default"])
    mass_kg  = _sphere_mass(diameter_m, density)
    ke_j     = _kinetic_energy(mass_kg, impact_velocity_kms)
    energy_mt = ke_j / J_PER_MT_TNT
    energy_hiroshima = ke_j / J_HIROSHIMA

    # Airburst check — stony objects < ~50 m disrupt before reaching ground
    is_iron    = composition_class.upper() == "M"
    airburst_threshold = AIRBURST_DIAMETER_IRON_M if is_iron else AIRBURST_DIAMETER_STONE_M
    airburst   = diameter_m < airburst_threshold

    if airburst:
        # Airburst altitude roughly scales with diameter (Chelyabinsk-style)
        # Very rough: H_burst ≈ 0.8 * D_m  (km) for stony objects
        airburst_alt_km = max(5.0, 0.8 * diameter_m)
        crater_m        = 0.0
    else:
        airburst_alt_km = 0.0
        crater_m        = _crater_diameter(ke_j, impact_angle_deg)

    damage_r_km = _damage_radius(energy_mt)

    # Damage category
    if energy_mt < 0.1:
        damage_cat = "negligible"
    elif energy_mt < 100:
        damage_cat = "local"
    elif energy_mt < 100_000:
        damage_cat = "regional"
    elif energy_mt < 1_000_000:
        damage_cat = "continental"
    else:
        damage_cat = "global"

    return {
        "diameter_m":           float(diameter_m),
        "density_kgm3":         float(density),
        "mass_kg":              float(mass_kg),
        "impact_velocity_kms":  float(impact_velocity_kms),
        "impact_angle_deg":     float(impact_angle_deg),
        "kinetic_energy_j":     float(ke_j),
        "energy_mt":            float(energy_mt),
        "energy_hiroshima":     float(energy_hiroshima),
        "crater_diameter_m":    float(crater_m),
        "airburst":             bool(airburst),
        "airburst_altitude_km": float(airburst_alt_km),
        "damage_category":      damage_cat,
        "damage_radius_km":     float(damage_r_km),
        "disclaimer":           _DISCLAIMER,
    }
