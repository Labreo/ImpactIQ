import pytest
from services.nasa_api import get_sbdb_data, get_cad_data, search_neows

@pytest.mark.asyncio
async def test_search_neows():
    res = await search_neows()
    assert "near_earth_objects" in res
    assert len(res["near_earth_objects"]) > 0

@pytest.mark.asyncio
async def test_get_sbdb_data():
    res = await get_sbdb_data("Apophis")
    assert "object" in res
    assert res["object"]["des"] == "99942"
    assert "orbit" in res

@pytest.mark.asyncio
async def test_get_cad_data():
    res = await get_cad_data("99942", date_min="2029-01-01", date_max="2029-12-31")
    assert "data" in res
    assert len(res["data"]) > 0
    # Apophis close approach in 2029 is known
    print(res["data"][0])
