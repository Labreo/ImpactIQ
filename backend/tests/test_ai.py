"""
AI insight layer & Trust auditing unit tests.

Tests:
- Granite brief generation contracts
- Extraction & code-fence parsing
- Guardian falsification & trust auditing probe
- Chat follow-up grounding
- Uncertainty cloud generation
"""

import pytest
import asyncio
from services.granite import (
    _extract_json,
    _fallback_brief,
    generate_brief,
    chat_with_brief,
    probe_guardian_audit,
)
from services.physics import get_uncertainty_cloud_points


class TestGraniteExtraction:
    def test_clean_json_extraction(self):
        text = '{"title": "Test Asteroid", "bottom_line": "No risk.", "if_it_happened": "None", "whats_next": "Continue tracking."}'
        extracted = _extract_json(text)
        assert extracted["title"] == "Test Asteroid"
        assert extracted["bottom_line"] == "No risk."

    def test_fenced_json_extraction(self):
        text = '```json\n{"title": "Fenced Title", "bottom_line": "Safe", "if_it_happened": "Airburst", "whats_next": "Track"}\n```'
        extracted = _extract_json(text)
        assert extracted["title"] == "Fenced Title"

    def test_json_with_surrounding_prose(self):
        text = 'Here is the requested brief:\n{"title": "Surrounded Title", "bottom_line": "Safe", "if_it_happened": "Airburst", "whats_next": "Track"}\nHope this helps!'
        extracted = _extract_json(text)
        assert extracted["title"] == "Surrounded Title"

    def test_invalid_json_raises(self):
        with pytest.raises(ValueError):
            _extract_json("Just a regular sentence without json.")


class TestGraniteFallback:
    def test_fallback_brief_keys(self):
        brief_input = {
            "designation": "99942",
            "full_name": "Apophis (99942)",
            "close_approach_date": "2029-04-13",
            "jpl_dist_au": 0.00025,
            "computed_dist_au": 0.00025,
            "impact_probability": 0.0,
            "torino_scale": 0,
            "torino_label": "No Hazard",
            "palermo_scale": -10.0,
            "insight_score": 0,
            "diameter_m": 370.0,
            "energy_mt": 1200.0,
            "damage_category": "regional",
            "damage_radius_km": 180.0,
            "airburst": False,
            "sigma_source": "sbdb_sigmas",
            "uncertainty_note": "Accurate.",
        }
        res = _fallback_brief(brief_input, outreach=False)
        for key in ("title", "bottom_line", "if_it_happened", "whats_next", "guardian_ok", "raw_model"):
            assert key in res
        assert "Apophis" in res["title"]
        assert "0" in res["bottom_line"] or "No Hazard" in res["bottom_line"]

    def test_fallback_brief_outreach_mode(self):
        brief_input = {
            "designation": "Bennu",
            "full_name": "101955 Bennu",
            "impact_probability": 0.0003,
            "torino_scale": 0,
            "jpl_dist_au": 0.005,
            "close_approach_date": "2182-09-24",
            "airburst": False,
            "damage_category": "regional",
        }
        res = _fallback_brief(brief_input, outreach=True)
        assert "Bennu" in res["title"]
        assert "Scientists" in res["bottom_line"] or "zero danger" in res["bottom_line"]


class TestGraniteGuardianProbe:
    def test_falsification_fabrication_intercepted(self):
        probe = probe_guardian_audit("fabrication", {"full_name": "2010 FX9", "jpl_dist_au": 0.024})
        assert probe["probe_type"] == "fabrication"
        assert probe["passed_audit"] is False
        assert "FLAGGED" in probe["guardian_response"].upper() or "Ungrounded" in probe["explanation"]

    def test_falsification_ground_truth_approved(self):
        probe = probe_guardian_audit("ground_truth", {"full_name": "2010 FX9", "jpl_dist_au": 0.024})
        assert probe["probe_type"] == "ground_truth"
        assert probe["passed_audit"] is True
        assert "APPROVED" in probe["guardian_response"].upper()


@pytest.mark.asyncio
async def test_chat_with_brief_grounding():
    context = {
        "designation": "99942",
        "full_name": "Apophis (99942)",
        "close_approach_date": "2029-04-13",
        "jpl_dist_au": 0.00025,
        "impact_probability": 0.0,
        "torino_scale": 0,
        "damage_category": "regional",
        "damage_radius_km": 150.0,
        "energy_mt": 1200.0,
    }
    # Test damage question
    ans1 = await chat_with_brief("What is the damage radius?", context)
    assert "150" in ans1 or "regional" in ans1 or "Collins" in ans1 or "blast" in ans1

    # Test confirmation question
    ans2 = await chat_with_brief("When will radar confirm the orbit?", context)
    assert "astrometry" in ans2 or "radar" in ans2 or "2029-04-13" in ans2


@pytest.mark.asyncio
async def test_uncertainty_cloud_generation():
    from services.nasa_api import get_sbdb_data
    sbdb = await get_sbdb_data("2010 FX9")
    cloud = get_uncertainty_cloud_points(sbdb, n_sample_paths=8, n_points_per_path=20)
    assert isinstance(cloud, list)
    assert len(cloud) > 0
    # Each path should have 20 points with x, y, z
    assert len(cloud[0]) == 20
    assert "x" in cloud[0][0] and "y" in cloud[0][0] and "z" in cloud[0][0]
