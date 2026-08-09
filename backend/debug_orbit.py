import asyncio
from astropy import units as u
from astropy.time import Time
import numpy as np

from services.nasa_api import get_sbdb_data
from services.physics import parse_sbdb_orbit
from hapsira.bodies import Earth, Sun
from hapsira.ephem import Ephem

async def debug():
    sbdb = await get_sbdb_data("99942")
    orbit = parse_sbdb_orbit(sbdb)
    
    # 2029 Apophis Close Approach
    target_time_iso = "2029-04-13T21:46:00.000"
    target_time = Time(target_time_iso, scale="tdb")
    
    propagated = orbit.propagate(target_time)
    ast_r = propagated.r
    
    print(f"Asteroid R (Sun-centric): {ast_r.to(u.au)}")
    
    earth_ephem = Ephem.from_body(Earth, target_time)
    earth_r = earth_ephem.rv()[0][0]
    print(f"Earth R (from Ephem): {earth_r.to(u.au)}")
    
    # Is earth_ephem barycentric or heliocentric?
    # In poliastro/hapsira, Ephem.from_body usually uses ICRS (Barycentric)
    # We should get Sun's position and subtract.
    sun_ephem = Ephem.from_body(Sun, target_time)
    sun_r = sun_ephem.rv()[0][0]
    print(f"Sun R (from Ephem): {sun_r.to(u.au)}")
    
    earth_helio_r = earth_r - sun_r
    print(f"Earth R (Heliocentric): {earth_helio_r.to(u.au)}")
    
    dist_raw = np.linalg.norm(ast_r - earth_r)
    dist_helio = np.linalg.norm(ast_r - earth_helio_r)
    
    print(f"Distance (Raw): {dist_raw.to(u.au)}")
    print(f"Distance (Helio): {dist_helio.to(u.au)}")

if __name__ == "__main__":
    asyncio.run(debug())
