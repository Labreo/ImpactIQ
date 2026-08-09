"""
Week 2 unit tests — Monte Carlo, risk scoring, consequence model, Granite brief.

Run with:
    cd backend && python -m pytest tests/test_week2.py -v -s
"""

import pytest
import math

from services.risk_scoring import torino_scale, palermo_scale, insight_score, compute_risk_scores
from services.consequence import estimate_consequences


# ---------------------------------------------------------------------------
# Risk scoring — pure unit tests (no network)
# ---------------------------------------------------------------------------

class TestTorinoScale:
    def test_zero_probability(self):
        r = torino_scale(0.0, 100.0)
        assert r["torino_scale"] == 0
        assert r["torino_color"] == "white"

    def test_tiny_probability_small_energy(self):
        r = torino_scale(1e-6, 0.5)
        assert r["torino_scale"] == 0

    def test_moderate_probability_regional(self):
        r = torino_scale(0.05, 500.0)
        assert r["torino_scale"] >= 2
        assert r["torino_color"] in ("yellow", "orange", "red")

    def test_high_probability_global(self):
        r = torino_scale(0.9, 1e6)
        assert r["torino_scale"] >= 8
        assert r["torino_color"] == "red"

    def test_certain_collision_global(self):
        r = torino_scale(1.0, 2e5)
        assert r["torino_scale"] >= 9


class TestPalermoScale:
    def test_zero_probability_returns_no_hazard(self):
        r = palermo_scale(0.0, 100.0, 10.0)
        assert r["palermo_scale"] == -10.0
        assert "No" in r["palermo_label"]

    def test_typical_neo_below_minus_two(self):
        # Typical well-tracked NEO: P=1e-6, E=1 MT, T=10 yr → PS << -2
        r = palermo_scale(1e-6, 1.0, 10.0)
        assert r["palermo_scale"] < -2

    def test_above_background(self):
        # Certain impact with high energy → PS > 0
        r = palermo_scale(1.0, 1e4, 5.0)
        assert r["palermo_scale"] > 0
        assert "Warrants" in r["palermo_label"]

    def test_formula_sanity(self):
        # Manual check: P=1e-4, E=1 MT, T=100 yr
        # f_bg = 0.01 * 1^-0.8 = 0.01  → expected = log10(1e-4 / (0.01 * 100)) = log10(1e-4) = -4
        r = palermo_scale(1e-4, 1.0, 100.0)
        assert abs(r["palermo_scale"] - (-4.0)) < 0.1


class TestInsightScore:
    def test_no_risk_gives_low_score(self):
        r = insight_score(0, 1e-8, 0.001, -8.0)
        assert r["insight_score"] < 10

    def test_high_risk_gives_high_score(self):
        r = insight_score(8, 0.5, 1e5, 1.0)
        assert r["insight_score"] > 70

    def test_score_in_range(self):
        for p in [1e-8, 1e-4, 0.01, 0.5, 1.0]:
            for e in [0.001, 1, 1000, 1e6]:
                r = insight_score(5, p, e, -1.0)
                assert 0 <= r["insight_score"] <= 100

    def test_disclaimer_present(self):
        r = insight_score(0, 0.0, 0.0, -10.0)
        assert "NOT an official" in r["insight_note"]


class TestComputeRiskScores:
    def test_combined_output_has_all_keys(self):
        r = compute_risk_scores(1e-6, 5.0, 10.0)
        for key in ("torino_scale","torino_label","torino_color",
                    "palermo_scale","palermo_label",
                    "insight_score","insight_label","insight_note"):
            assert key in r, f"Missing key: {key}"


# ---------------------------------------------------------------------------
# Consequence model — unit tests
# ---------------------------------------------------------------------------

class TestConsequenceModel:
    def test_chelyabinsk_sized_is_airburst(self):
        # Chelyabinsk: ~20 m diameter, stony
        r = estimate_consequences(20.0, 19.0, "S")
        assert r["airburst"] is True
        assert r["crater_diameter_m"] == 0.0
        assert r["airburst_altitude_km"] > 0

    def test_large_impactor_ground_impact(self):
        # 1 km impactor — well above airburst threshold
        r = estimate_consequences(1000.0, 20.0, "S")
        assert r["airburst"] is False
        assert r["crater_diameter_m"] > 0
        # 1 km at 20 km/s ≈ 10,000 MT → regional/continental
        assert r["damage_category"] in ("regional", "continental", "global")

    def test_tunguska_sized_energy(self):
        # Tunguska: ~50 m, ~10–15 MT
        r = estimate_consequences(50.0, 15.0, "S")
        assert 1.0 < r["energy_mt"] < 500.0
        assert r["damage_category"] in ("local", "regional")

    def test_energy_increases_with_velocity(self):
        slow = estimate_consequences(100.0, 10.0)
        fast = estimate_consequences(100.0, 30.0)
        assert fast["energy_mt"] > slow["energy_mt"]

    def test_energy_increases_with_size(self):
        small = estimate_consequences(10.0, 20.0)
        large = estimate_consequences(100.0, 20.0)
        assert large["energy_mt"] > small["energy_mt"] * 100  # ~1000x for 10x diameter

    def test_all_keys_present(self):
        r = estimate_consequences(100.0, 20.0)
        for key in ("diameter_m","density_kgm3","mass_kg","impact_velocity_kms",
                    "kinetic_energy_j","energy_mt","energy_hiroshima",
                    "crater_diameter_m","airburst","damage_category",
                    "damage_radius_km","disclaimer"):
            assert key in r, f"Missing key: {key}"

    def test_disclaimer_present(self):
        r = estimate_consequences(50.0, 15.0)
        assert "Collins" in r["disclaimer"]

    def test_iron_smaller_airburst_threshold(self):
        # 20 m iron should reach ground (iron threshold = 15 m)
        r_iron  = estimate_consequences(20.0, 20.0, "M")
        r_stone = estimate_consequences(20.0, 20.0, "S")
        # Iron 20 m > 15 m threshold → ground impact; stone 20 m < 50 m → airburst
        assert r_iron["airburst"] is False
        assert r_stone["airburst"] is True


# ---------------------------------------------------------------------------
# Monte Carlo — integration test (network required)
# ---------------------------------------------------------------------------

@pytest.mark.asyncio
async def test_monte_carlo_2010_fx9():
    """Monte Carlo runs for 2010 FX9 and returns a plausible result."""
    from services.nasa_api import get_sbdb_data, get_cad_data
    from services.monte_carlo import run_monte_carlo
    from astropy.time import Time

    sbdb = await get_sbdb_data("2010 FX9")
    cad  = await get_cad_data("2010 FX9", date_min="2026-09-01", date_max="2026-09-30")
    fields = cad["fields"]
    first  = cad["data"][0]
    jpl_jd = float(first[fields.index("jd")])
    target = Time(jpl_jd, format="jd", scale="tdb").isot

    result = run_monte_carlo(sbdb, target, n_samples=200, seed=42)

    print(f"\n2010 FX9 MC: impact_prob={result['impact_probability']:.2e}  "
          f"median={result['median_dist_au']:.4f} AU  "
          f"sigma_source={result['sigma_source']}")

    assert result["n_samples"] == 200
    assert 0.0 <= result["impact_probability"] <= 1.0
    assert result["median_dist_au"] > 0
    assert len(result["dist_histogram"]) == 20
    assert len(result["hist_bin_edges_au"]) == 21
    # 2010 FX9 has a well-known orbit — impact prob should be 0 or near-0
    assert result["impact_probability"] < 0.01
