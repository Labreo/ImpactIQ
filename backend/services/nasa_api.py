import httpx
from core.config import settings

NASA_BASE_URL = "https://api.nasa.gov"
JPL_SSD_BASE_URL = "https://ssd-api.jpl.nasa.gov"

async def search_neows(query: str = None):
    """Search for Near Earth Objects using NeoWs."""
    # Simplified version, in reality we might want a specific endpoint
    url = f"{NASA_BASE_URL}/neo/rest/v1/neo/browse"
    params = {"api_key": settings.NASA_API_KEY}
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()

async def get_sbdb_data(designation: str):
    """Get orbital elements and physical parameters from JPL SBDB."""
    url = f"{JPL_SSD_BASE_URL}/sbdb.api"
    params = {
        "sstr": designation,
        "phys-par": "1",
        "cov": "mat" # Covariance matrix for Monte Carlo (optional)
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()

async def get_cad_data(designation: str = None, date_min: str = None, date_max: str = None):
    """Get Close-Approach Data from JPL CAD API."""
    url = f"{JPL_SSD_BASE_URL}/cad.api"
    params = {}
    if designation:
        params["des"] = designation
    if date_min:
        params["date-min"] = date_min
    if date_max:
        params["date-max"] = date_max
        
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params)
        response.raise_for_status()
        return response.json()
