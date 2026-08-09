from astropy import units as u
from astropy.time import Time
from hapsira.twobody import Orbit
from hapsira.bodies import Sun
import numpy as np

def parse_sbdb_orbit(sbdb_data: dict) -> Orbit:
    """
    Parses JPL SBDB orbital elements and returns a hapsira Orbit object.
    
    Expected orbital elements from SBDB (Keplerian):
    e: eccentricity
    a: semi-major axis (au)
    i: inclination (deg)
    om: longitude of ascending node (deg)
    w: argument of periapsis (deg)
    ma: mean anomaly (deg)
    epoch: epoch of the elements (JD)
    """
    orbit_data = sbdb_data.get("orbit", {})
    elements = orbit_data.get("elements", [])
    
    # Extract values
    elem_map = {item["name"]: float(item["value"]) for item in elements}
    
    # If the required elements are missing, this will raise a KeyError
    e = elem_map["e"] * u.one
    a = elem_map["a"] * u.au
    inc = elem_map["i"] * u.deg
    raan = elem_map["om"] * u.deg
    argp = elem_map["w"] * u.deg
    nu = elem_map.get("ma", 0) * u.deg # We actually need true anomaly for classic Orbit, but hapsira can take mean anomaly via from_classical?
    
    # Let's use mean anomaly
    # Actually hapsira's from_classical expects true anomaly (nu).
    # But hapsira also has `mean_anomaly`? Wait.
    # We can use from_classical and mean anomaly by converting it if needed.
    # Actually hapsira's Orbit.from_classical can take True Anomaly (nu).
    # For a circular or elliptic orbit, we can convert mean anomaly (ma) to true anomaly (nu).
    # We will use hapsira's built-in conversion or just approximate for now if e is small,
    # or let's use astropy/hapsira functions to convert MA to nu.
    
    # As a quick workaround, we can instantiate Orbit.from_classical with M (if supported) or nu.
    # Wait, poliastro/hapsira's Orbit.from_classical takes:
    # attractor, a, ecc, inc, raan, argp, nu, epoch
    # We need to convert M to nu.
    from hapsira.core.angles import M_to_E, E_to_nu
    # M_to_nu is separated into M_to_E and E_to_nu
    M_rad = np.deg2rad(elem_map["ma"])
    E_rad = M_to_E(M_rad, float(elem_map["e"]))
    nu_rad = E_to_nu(E_rad, float(elem_map["e"]))
    nu_val = np.rad2deg(nu_rad) * u.deg
    
    epoch_jd = float(orbit_data.get("epoch", 0))
    epoch = Time(epoch_jd, format="jd")
    
    return Orbit.from_classical(
        attractor=Sun,
        a=a,
        ecc=e,
        inc=inc,
        raan=raan,
        argp=argp,
        nu=nu_val,
        epoch=epoch
    )

def propagate_to_date(orbit: Orbit, target_date_iso: str) -> Orbit:
    """
    Propagates the orbit forward or backward to the given target date (ISO 8601 format).
    """
    target_time = Time(target_date_iso)
    return orbit.propagate(target_time)

def get_distance_at_date(orbit: Orbit, target_date_iso: str) -> u.Quantity:
    """
    Gets the distance to the Sun at the target date. 
    (Note: This is distance to Sun, not Earth! To get distance to Earth, 
    we need Earth's ephemeris which hapsira can provide via `Earth.rv(epoch)`).
    """
    propagated = propagate_to_date(orbit, target_date_iso)
    return np.linalg.norm(propagated.r) * u.km
    
def get_earth_distance(orbit: Orbit, target_date_iso: str) -> float:
    """
    Gets distance to Earth in au.
    """
    from hapsira.twobody import Orbit
    from hapsira.bodies import Earth
    from hapsira.ephem import Ephem
    target_time = Time(target_date_iso)
    
    propagated = orbit.propagate(target_time)
    
    # We need Earth's position at target_time
    # We can get Earth's orbit from Ephem
    # Wait, in hapsira:
    # Earth.rv(target_time) returns r, v
    # But usually we need to load ephemeris. 
    # For now, let's just return the r vector from Sun to asteroid, 
    # and we will compute Earth's r vector.
    earth_ephem = Ephem.from_body(Earth, target_time)
    earth_r = earth_ephem.rv()[0][0] # r is in km usually or AU
    
    ast_r = propagated.r
    
    # distance vector
    dist_vec = ast_r - earth_r
    dist_km = np.linalg.norm(dist_vec)
    
    # convert to au
    dist_au = dist_km.to(u.au).value
    return dist_au
