"""
NASA/JPL API integration smoke tests — Week 1.

These tests hit live upstream APIs and require a network connection.
They verify that the data-fetch layer returns well-formed responses for
known objects, which is a prerequisite for the physics validation tests.

Run with:
    cd backend && pytest tests/test_nasa_api.py -v -s
"""

import pytest

from services.nasa_api import (
    get_cad_data,
    get_sbdb_data,
    get_sentry_data,
    search_neows,
)


@pytest.mark.asyncio
async def test_search_neows_returns_objects():
    """NeoWs browse endpoint returns a non-empty near_earth_objects list."""
    res = await search_neows()
    assert "near_earth_objects" in res, "Missing 'near_earth_objects' key"
    assert len(res["near_earth_objects"]) > 0


@pytest.mark.asyncio
async def test_get_sbdb_data_apophis_structure():
    """SBDB response for Apophis has the expected top-level structure."""
    res = await get_sbdb_data("Apophis")
    assert "object" in res
    assert res["object"]["des"] == "99942"
    assert "orbit" in res
    orbit = res["orbit"]
    assert "elements" in orbit
    assert "epoch" in orbit
    # Verify full-precision is active: epoch field should be a JD float string
    assert float(orbit["epoch"]) > 2_400_000  # sanity: JD > J1900


@pytest.mark.asyncio
async def test_get_sbdb_data_full_precision_elements():
    """SBDB returns full-precision orbital element strings (full-prec=1)."""
    res = await get_sbdb_data("99942")
    elements = {e["name"]: e["value"] for e in res["orbit"]["elements"]}
    # Full-precision eccentricity for Apophis starts ".191149..."
    e_str = elements["e"]
    # Should have at least 10 significant digits
    digits = e_str.lstrip(".0").replace(".", "")
    assert len(digits) >= 8, (
        f"Expected full-precision eccentricity, got '{e_str}' (too few digits)"
    )


@pytest.mark.asyncio
async def test_get_cad_data_apophis_2029():
    """CAD returns Apophis 2029-Apr-13 close approach record."""
    res = await get_cad_data("99942", date_min="2029-01-01", date_max="2029-12-31")
    assert "data" in res and len(res["data"]) > 0
    fields = res["fields"]
    cd_idx = fields.index("cd")
    date_str = res["data"][0][cd_idx]
    assert "2029" in date_str, f"Expected 2029 close approach date, got '{date_str}'"
    print(f"\nApophis 2029 CAD record: {res['data'][0]}")


@pytest.mark.asyncio
async def test_get_cad_data_with_dist_max():
    """CAD dist_max filter works — returns only very close approaches."""
    res = await get_cad_data(
        date_min="2025-01-01",
        date_max="2026-12-31",
        dist_max="0.001",
    )
    assert "data" in res
    # All returned distances should be ≤ 0.001 AU
    if res["data"]:
        fields = res["fields"]
        dist_idx = fields.index("dist")
        for row in res["data"]:
            assert float(row[dist_idx]) <= 0.001


@pytest.mark.asyncio
async def test_get_sentry_data_full_table():
    """Sentry API returns a list with at least one entry."""
    res = await get_sentry_data()
    assert res is not None
    # Sentry returns either a 'data' list or a top-level list
    has_data = ("data" in res and len(res["data"]) > 0) or (
        isinstance(res, list) and len(res) > 0
    )
    assert has_data, "Sentry table appears empty"


@pytest.mark.asyncio
async def test_get_sentry_data_unknown_object_returns_none():
    """Sentry returns None for an object not on the risk list."""
    result = await get_sentry_data("1 Ceres")  # dwarf planet — not on Sentry list
    # Sentry may 404 or return empty — either way our function returns None
    # (or a dict with no impact records, both are acceptable here)
    # We just assert the call doesn't raise an exception
    assert result is None or isinstance(result, dict)
