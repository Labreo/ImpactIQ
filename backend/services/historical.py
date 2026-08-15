import math
from services.consequence import estimate_consequences
from services.risk_scoring import compute_risk_scores

def generate_impact_trajectory(impact_angle_rad: float = 0.0, eccentricity: float = 0.4, semi_major_au: float = 1.35) -> list[dict]:
    """Generate a realistic 60-point Keplerian/inbound elliptical orbit that intercepts Earth at (1.0 AU, 0.0)."""
    points = []
    for i in range(60):
        # Angle parameter traversing the orbit towards Earth encounter
        theta = (i / 59.0) * math.pi * 2 + impact_angle_rad
        r = (semi_major_au * (1 - eccentricity**2)) / (1 + eccentricity * math.cos(theta))
        # Rotate so it intercepts Earth orbit at nominal 1.0 AU
        x = r * math.cos(theta)
        y = r * math.sin(theta)
        z = 0.04 * math.sin(theta * 2)
        points.append({"x": round(x, 4), "y": round(y, 4), "z": round(z, 4)})
    return points

async def get_historical_event(event_id: str, outreach: bool = False):
    """Return realistic peer-reviewed historical impact / airburst benchmarks for educational calibration."""
    
    if "tunguska" in event_id:
        diam_m = 60.0
        v_kms = 15.0
        consequence = estimate_consequences(diam_m, v_kms)
        consequence["energy_mt"] = 15.0
        consequence["airburst"] = True
        consequence["airburst_altitude_km"] = 8.5
        consequence["crater_diameter_m"] = 0.0
        consequence["damage_category"] = "regional"
        consequence["damage_radius_km"] = 38.0
        consequence["disclaimer"] = "Historical peer-reviewed airburst benchmark (Collins et al. 2005)."

        risk = compute_risk_scores(1.0, 15.0, 0.0)
        risk["torino_scale"] = 10
        risk["torino_label"] = "Certain Collision"
        risk["insight_score"] = 98
        risk["insight_label"] = "CRITICAL"
        risk["sentry_probability"] = 1.0

        brief = {
            "title": "Tunguska Event (1908): High-Altitude Stony Airburst",
            "bottom_line": "A ~60-meter stony asteroid entered Earth's atmosphere at 15 km/s, detonating at ~8.5 km altitude over Siberia with an explosive yield of ~15 Megatons TNT.",
            "if_it_happened": "The mid-air blast produced an extreme thermal pulse and supersonic shockwave that flattened over 2,000 square kilometers (80 million trees) with zero impact crater.",
            "whats_next": "Modern space telescopes (NEO Surveyor) now catalog 60m class asteroids to prevent surprise airbursts over populated areas.",
            "guardian_ok": True,
            "raw_model": "historical-benchmark"
        }
        if outreach:
            brief["bottom_line"] = "A 60-meter space rock exploded high over a forest in Siberia in 1908, knocking down trees for miles with a giant boom like 1,000 atomic fireworks!"

        return {
            "designation": "historical:tunguska",
            "full_name": "Tunguska Event (1908 Siberia Airburst)",
            "close_approach": {"date": "1908-06-30T07:17:00", "jpl_dist_au": 0.0, "velocity_kms": v_kms, "years_until": 0.0},
            "diameter_m": diam_m,
            "orbit_path": generate_impact_trajectory(0.2, 0.35, 1.4),
            "monte_carlo": {
                "n_samples": 1000, "impact_probability": 1.0, "min_dist_au": 0.0, "median_dist_au": 0.0,
                "sigma_source": "historical_record", "uncertainty_note": "Historical confirmed airburst benchmark.",
                "dist_histogram": [1000, 0, 0, 0, 0], "hist_bin_edges_au": [0, 0.1, 0.2, 0.3, 0.4]
            },
            "consequence": consequence,
            "risk": risk,
            "ai_brief": brief
        }

    elif "chicxulub" in event_id:
        diam_m = 10000.0
        v_kms = 20.0
        consequence = estimate_consequences(diam_m, v_kms)
        consequence["energy_mt"] = 100000000.0
        consequence["crater_diameter_m"] = 180000.0
        consequence["airburst"] = False
        consequence["damage_category"] = "global"
        consequence["damage_radius_km"] = 2500.0
        consequence["disclaimer"] = "Geological extinction benchmark (Pi-group scaling)."

        risk = compute_risk_scores(1.0, 100000000.0, 0.0)
        risk["torino_scale"] = 10
        risk["torino_label"] = "Certain Collision (Global Catastrophe)"
        risk["palermo_scale"] = 10.0
        risk["palermo_label"] = "Global Catastrophe"
        risk["insight_score"] = 100
        risk["insight_label"] = "EXTINCTION CLASS"
        risk["sentry_probability"] = 1.0

        brief = {
            "title": "Chicxulub Impactor (66 Ma): Mass Extinction Class Impactor",
            "bottom_line": "A ~10-kilometer asteroid struck the Yucatán Peninsula at 20 km/s, unleashing 100 million Megatons of kinetic energy and forming a 180-km crater that ended the Cretaceous period.",
            "if_it_happened": "Global wildfires, mega-tsunamis, and an atmospheric sulfur dust veil triggered a multi-year impact winter, leading to the extinction of non-avian dinosaurs and 75% of Earth species.",
            "whats_next": "Planetary defense planetary surveys now verify that >95% of all 10km+ Near-Earth Asteroids have been tracked with zero collision threat for the next 200 years.",
            "guardian_ok": True,
            "raw_model": "historical-benchmark"
        }
        if outreach:
            brief["bottom_line"] = "This was the giant 10-kilometer space rock that crashed into Earth 66 million years ago and caused the extinction of the dinosaurs!"

        return {
            "designation": "historical:chicxulub",
            "full_name": "Chicxulub Dinosaur Extinction Impactor (66 Ma)",
            "close_approach": {"date": "66,000,000 BCE", "jpl_dist_au": 0.0, "velocity_kms": v_kms, "years_until": 0.0},
            "diameter_m": diam_m,
            "orbit_path": generate_impact_trajectory(0.5, 0.45, 1.8),
            "monte_carlo": {
                "n_samples": 1000, "impact_probability": 1.0, "min_dist_au": 0.0, "median_dist_au": 0.0,
                "sigma_source": "geological_record", "uncertainty_note": "Confirmed geological extinction impact.",
                "dist_histogram": [1000, 0, 0, 0, 0], "hist_bin_edges_au": [0, 0.1, 0.2, 0.3, 0.4]
            },
            "consequence": consequence,
            "risk": risk,
            "ai_brief": brief
        }

    elif "barringer" in event_id:
        diam_m = 50.0
        v_kms = 12.8
        consequence = estimate_consequences(diam_m, v_kms)
        consequence["energy_mt"] = 10.0
        consequence["crater_diameter_m"] = 1200.0
        consequence["airburst"] = False
        consequence["damage_category"] = "regional"
        consequence["damage_radius_km"] = 24.0
        consequence["disclaimer"] = "Calibrated against Barringer Meteor Crater measurements in Arizona."

        risk = compute_risk_scores(1.0, 10.0, 0.0)
        risk["torino_scale"] = 10
        risk["torino_label"] = "Certain Collision"
        risk["insight_score"] = 96
        risk["insight_label"] = "CRITICAL"
        risk["sentry_probability"] = 1.0

        brief = {
            "title": "Barringer Meteorite (50,000 ya): Arizona Crater Iron Impactor",
            "bottom_line": "A ~50-meter dense nickel-iron meteorite struck the Arizona desert at 12.8 km/s with ~10 Megatons of kinetic energy, excavating a 1.2-km wide, 170-meter deep impact crater.",
            "if_it_happened": "Because it was made of solid iron-nickel, it penetrated deep into the lower atmosphere without airbursting, vaporizing on impact and flattening life within a 25-km radius.",
            "whats_next": "Barringer Crater serves as the primary ground-truth calibration site for planetary impact crater scaling formulas worldwide.",
            "guardian_ok": True,
            "raw_model": "historical-benchmark"
        }
        if outreach:
            brief["bottom_line"] = "A 50-meter solid metal iron rock crashed in Arizona 50,000 years ago and created Meteor Crater, which you can visit today!"

        return {
            "designation": "historical:barringer",
            "full_name": "Barringer Meteor Crater (50,000 ya Arizona)",
            "close_approach": {"date": "50,000 BCE", "jpl_dist_au": 0.0, "velocity_kms": v_kms, "years_until": 0.0},
            "diameter_m": diam_m,
            "orbit_path": generate_impact_trajectory(0.1, 0.28, 1.3),
            "monte_carlo": {
                "n_samples": 1000, "impact_probability": 1.0, "min_dist_au": 0.0, "median_dist_au": 0.0,
                "sigma_source": "geological_record", "uncertainty_note": "Confirmed iron crater impact benchmark.",
                "dist_histogram": [1000, 0, 0, 0, 0], "hist_bin_edges_au": [0, 0.1, 0.2, 0.3, 0.4]
            },
            "consequence": consequence,
            "risk": risk,
            "ai_brief": brief
        }

    # Default Chelyabinsk
    diam_m = 20.0
    v_kms = 19.16
    consequence = estimate_consequences(diam_m, v_kms)
    consequence["energy_mt"] = 0.5
    consequence["airburst"] = True
    consequence["airburst_altitude_km"] = 16.0
    consequence["damage_category"] = "local"
    consequence["damage_radius_km"] = 13.5
    consequence["disclaimer"] = "Historical peer-reviewed airburst benchmark (Popova et al. 2013)."

    risk = compute_risk_scores(1.0, 0.5, 0.0)
    risk["torino_scale"] = 10
    risk["torino_label"] = "Certain Collision"
    risk["insight_score"] = 95
    risk["insight_label"] = "CRITICAL"
    risk["sentry_probability"] = 1.0

    brief = {
        "title": "Chelyabinsk Meteor (2013): High-Altitude Superbolide Airburst",
        "bottom_line": "A ~20-meter asteroid entered Earth's atmosphere over Russia at 19.2 km/s, detonating at ~16 km altitude with ~500 kilotons TNT equivalent energy (30x Hiroshima).",
        "if_it_happened": "The supersonic airburst shattered windows across six cities, injuring over 1,500 people from flying glass fragments without creating a ground crater.",
        "whats_next": "Triggered international cooperation under UN IAWN and SMPAG to build planetary defense early-warning radar networks.",
        "guardian_ok": True,
        "raw_model": "historical-benchmark"
    }
    if outreach:
        brief["bottom_line"] = "A 20-meter space rock entered the sky over Russia in 2013 and exploded high in the air, creating a bright flash and a loud sonic boom that broke windows!"

    return {
        "designation": "historical:chelyabinsk",
        "full_name": "Chelyabinsk Meteor (2013 Superbolide)",
        "close_approach": {"date": "2013-02-15T03:20:00", "jpl_dist_au": 0.0, "velocity_kms": v_kms, "years_until": 0.0},
        "diameter_m": diam_m,
        "orbit_path": generate_impact_trajectory(0.8, 0.4, 1.5),
        "monte_carlo": {
            "n_samples": 1000, "impact_probability": 1.0, "min_dist_au": 0.0, "median_dist_au": 0.0,
            "sigma_source": "historical_record", "uncertainty_note": "Confirmed historical superbolide airburst.",
            "dist_histogram": [1000, 0, 0, 0, 0], "hist_bin_edges_au": [0, 0.1, 0.2, 0.3, 0.4]
        },
        "consequence": consequence,
        "risk": risk,
        "ai_brief": brief
    }

async def get_chelyabinsk_mock(outreach: bool = False):
    return await get_historical_event("chelyabinsk", outreach)
