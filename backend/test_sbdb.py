import asyncio
import httpx
import json

async def main():
    url = "https://ssd-api.jpl.nasa.gov/sbdb.api"
    params = {"sstr": "Apophis", "phys-par": "1"}
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, params=params)
        data = resp.json()
        print(json.dumps(data.get('orbit', {}), indent=2))

if __name__ == "__main__":
    asyncio.run(main())
