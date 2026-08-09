from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from services.nasa_api import search_neows, get_sbdb_data, get_cad_data
# from services.physics import ... # we will add this later

app = FastAPI(title="Asteroid Impact Risk Predictor API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Asteroid Impact Risk Predictor API is running."}

@app.get("/api/neo/browse")
async def browse_neos():
    try:
        return await search_neows()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/asteroid/{designation}")
async def get_asteroid_info(designation: str):
    try:
        # Fetch SBDB data
        sbdb = await get_sbdb_data(designation)
        
        # Fetch CAD data (Close approaches)
        cad = await get_cad_data(designation=designation)
        
        return {
            "sbdb": sbdb,
            "cad": cad
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
