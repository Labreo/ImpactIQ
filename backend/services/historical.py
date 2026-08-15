import json

async def get_historical_event(event_id: str, outreach: bool = False):
    """Return realistic historical impact / airburst scenarios for educational benchmarking."""
    
    if "tunguska" in event_id:
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
            "close_approach": {"date": "1908-06-30T07:17:00", "jpl_dist_au": 0.0, "velocity_kms": 15.0, "years_until": 0.0},
            "diameter_m": 60.0,
            "orbit_path": [{"x": 1.0, "y": 0.0, "z": 0.0}, {"x": 0.85, "y": 0.15, "z": 0.02}],
            "monte_carlo": {
                "n_samples": 1000, "impact_probability": 1.0, "min_dist_au": 0.0, "median_dist_au": 0.0,
                "sigma_source": "historical_record", "uncertainty_note": "Historical confirmed airburst.",
                "dist_histogram": [1000, 0, 0, 0, 0], "hist_bin_edges_au": [0, 0.1, 0.2, 0.3, 0.4]
            },
            "consequence": {
                "diameter_m": 60.0, "density_kgm3": 2600.0, "mass_kg": 294000000.0, "impact_velocity_kms": 15.0,
                "impact_angle_deg": 45.0, "kinetic_energy_j": 6.27e16, "energy_mt": 15.0, "energy_hiroshima": 1000.0,
                "crater_diameter_m": 0.0, "airburst": True, "airburst_altitude_km": 8.5,
                "damage_category": "regional", "damage_radius_km": 38.0,
                "disclaimer": "Historical event benchmark (Collins et al. 2005)."
            },
            "risk": {
                "torino_scale": 10, "torino_label": "Certain Collision", "torino_color": "red",
                "palermo_scale": 5.2, "palermo_label": "High Hazard", "insight_score": 98,
                "insight_label": "CRITICAL", "sentry_probability": 1.0
            },
            "ai_brief": brief
        }

    elif "chicxulub" in event_id:
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
            "close_approach": {"date": "66,000,000 BCE", "jpl_dist_au": 0.0, "velocity_kms": 20.0, "years_until": 0.0},
            "diameter_m": 10000.0,
            "orbit_path": [{"x": 1.0, "y": 0.0, "z": 0.0}, {"x": 0.7, "y": 0.3, "z": 0.05}],
            "monte_carlo": {
                "n_samples": 1000, "impact_probability": 1.0, "min_dist_au": 0.0, "median_dist_au": 0.0,
                "sigma_source": "geological_record", "uncertainty_note": "Confirmed geological impact event.",
                "dist_histogram": [1000, 0, 0, 0, 0], "hist_bin_edges_au": [0, 0.1, 0.2, 0.3, 0.4]
            },
            "consequence": {
                "diameter_m": 10000.0, "density_kgm3": 3000.0, "mass_kg": 1.57e15, "impact_velocity_kms": 20.0,
                "impact_angle_deg": 60.0, "kinetic_energy_j": 3.14e23, "energy_mt": 100000000.0, "energy_hiroshima": 6666666666.0,
                "crater_diameter_m": 180000.0, "airburst": False, "airburst_altitude_km": 0.0,
                "damage_category": "global", "damage_radius_km": 2500.0,
                "disclaimer": "Geological extinction benchmark (Pi-group scaling)."
            },
            "risk": {
                "torino_scale": 10, "torino_label": "Certain Collision (Global Catastrophe)", "torino_color": "red",
                "palermo_scale": 10.0, "palermo_label": "Global Catastrophe", "insight_score": 100,
                "insight_label": "EXTINCTION CLASS", "sentry_probability": 1.0
            },
            "ai_brief": brief
        }

    elif "barringer" in event_id:
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
            "close_approach": {"date": "50,000 BCE", "jpl_dist_au": 0.0, "velocity_kms": 12.8, "years_until": 0.0},
            "diameter_m": 50.0,
            "orbit_path": [{"x": 1.0, "y": 0.0, "z": 0.0}, {"x": 0.92, "y": 0.08, "z": 0.01}],
            "monte_carlo": {
                "n_samples": 1000, "impact_probability": 1.0, "min_dist_au": 0.0, "median_dist_au": 0.0,
                "sigma_source": "geological_record", "uncertainty_note": "Confirmed iron crater impact.",
                "dist_histogram": [1000, 0, 0, 0, 0], "hist_bin_edges_au": [0, 0.1, 0.2, 0.3, 0.4]
            },
            "consequence": {
                "diameter_m": 50.0, "density_kgm3": 7800.0, "mass_kg": 510000000.0, "impact_velocity_kms": 12.8,
                "impact_angle_deg": 45.0, "kinetic_energy_j": 4.18e16, "energy_mt": 10.0, "energy_hiroshima": 666.0,
                "crater_diameter_m": 1200.0, "airburst": False, "airburst_altitude_km": 0.0,
                "damage_category": "regional", "damage_radius_km": 24.0,
                "disclaimer": "Calibrated against Barringer Meteor Crater measurements."
            },
            "risk": {
                "torino_scale": 10, "torino_label": "Certain Collision", "torino_color": "red",
                "palermo_scale": 4.8, "palermo_label": "High Hazard", "insight_score": 96,
                "insight_label": "CRITICAL", "sentry_probability": 1.0
            },
            "ai_brief": brief
        }

    # Default Chelyabinsk
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

async def get_chelyabinsk_mock(outreach: bool = False):
    return await get_historical_event("chelyabinsk", outreach)
