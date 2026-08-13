import json

async def get_chelyabinsk_mock(outreach: bool = False):
    """Return a hardcoded mock representing the Chelyabinsk meteor just before impact."""
    # Data is roughly representative of Chelyabinsk
    
    brief = {
        "title": "Chelyabinsk Meteor: Imminent Atmospheric Entry",
        "bottom_line": "A ~20-meter asteroid is on a direct collision course with Earth and will enter the atmosphere over Russia within hours. It will explode mid-air with significant energy, causing widespread glass damage but no crater.",
        "if_it_happened": "The mid-air explosion will release roughly 500 kilotons of TNT equivalent energy (30x Hiroshima). The shockwave will shatter windows across the region and cause structural damage, injuring thousands primarily from flying glass.",
        "whats_next": "Authorities should issue immediate 'duck and cover' warnings to stay away from windows.",
        "guardian_ok": True,
        "raw_model": "hardcoded-mock"
    }

    if outreach:
        brief["bottom_line"] = "A small space rock, about the size of a six-story building, is heading toward Earth! Don't worry too much—it will mostly burn up and explode high in the sky like a giant firework."
        brief["if_it_happened"] = "Because it explodes so high up, it won't leave a crater on the ground. However, the 'boom' will be very loud and could break windows, just like a sonic boom from a fast jet."

    return {
        "designation": "historical:chelyabinsk",
        "full_name": "Chelyabinsk Meteor (2013)",
        "close_approach": {
            "date": "2013-02-15T03:20:00",
            "jpl_dist_au": 0.0,
            "velocity_kms": 19.16,
            "years_until": 0.0
        },
        "diameter_m": 20.0,
        "orbit_path": [
            {"x": 1.0, "y": 0.0, "z": 0.0},
            {"x": 0.9, "y": 0.1, "z": 0.05}
        ],
        "monte_carlo": {
            "n_samples": 1000,
            "impact_probability": 1.0,
            "min_dist_au": 0.0,
            "median_dist_au": 0.0,
            "p5_dist_au": 0.0,
            "p95_dist_au": 0.0,
            "sigma_source": "historical_certainty",
            "uncertainty_note": "Impact is certain (historical event).",
            "grav_focus_radius_au": 0.0001,
            "dist_histogram": [1000, 0, 0, 0, 0],
            "hist_bin_edges_au": [0, 0.1, 0.2, 0.3, 0.4]
        },
        "consequence": {
            "diameter_m": 20.0,
            "density_kgm3": 2700.0,
            "mass_kg": 11309733.0,
            "impact_velocity_kms": 19.16,
            "impact_angle_deg": 45.0,
            "kinetic_energy_j": 2075933260893011.5,
            "energy_mt": 0.5,
            "energy_hiroshima": 33.3,
            "crater_diameter_m": 0.0,
            "airburst": True,
            "airburst_altitude_km": 16.0,
            "damage_category": "local",
            "damage_radius_km": 13.5,
            "disclaimer": "Order-of-magnitude estimate for a hypothetical scenario."
        },
        "risk": {
            "torino_scale": 10,
            "torino_label": "Certain Collision",
            "torino_color": "red",
            "palermo_scale": 4.5,
            "palermo_label": "High Hazard",
            "insight_score": 95,
            "insight_label": "CRITICAL",
            "sentry_probability": 1.0
        },
        "ai_brief": brief
    }
