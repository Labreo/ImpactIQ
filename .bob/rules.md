# ImpactIQ — Bob Rules

These rules apply to every Bob session on this project.
Bob should read this file at the start of every conversation before making any code changes.

---

## Project identity

**Name:** ImpactIQ — Asteroid Impact Risk Predictor
**Challenge:** IBM AI Builders Challenge — August 2026 (Space Exploration theme)
**Deadline:** August 31, 2026, 11:59 PM ET

---

## Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.12, FastAPI, uvicorn |
| Orbit mechanics | hapsira (poliastro fork), astropy, numpy, scipy |
| HTTP client | httpx (async) |
| Caching | SQLite via `backend/services/cache.py` |
| LLM | IBM Granite (`ibm/granite-8b-code-instruct`) via watsonx.ai (Sydney region) |
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS v4 |
| 3D visualization | Three.js / react-three-fiber (Week 3) |
| Charts | Recharts (Week 2+) |
| Testing | pytest + pytest-asyncio |
| Deployment | Vercel (frontend) + Render/Railway (backend) |

---

## Code style

- **Python:** follow PEP 8; max line length 100; use type hints on all public functions
- **Docstrings:** every public function must have a NumPy-style docstring with Parameters, Returns, and Units sections where applicable
- **Units:** always state units explicitly in docstrings (AU, km, degrees, Julian Date, etc.)
- **TypeScript:** strict mode; no `any`; prefer explicit return types on exported functions
- **No magic numbers:** define named constants for physical quantities (e.g., `KM_PER_AU`, `EARTH_RADIUS_KM`)

---

## Architecture rules

- Every backend module must expose a documented JSON contract — define it in the module docstring
- All CPU-bound physics functions are synchronous; call them from FastAPI via `run_in_executor`
- All NASA/JPL API calls must go through `services/cache.py → cached_get()` — never call `httpx` directly in endpoints
- CAD API only accepts numeric designations — always resolve name → `des` via SBDB first
- All distances in AU, all times in TDB Julian Date or ISO 8601 with explicit `scale="tdb"`
- Return dicts from physics functions must use plain Python types (`float`, `bool`, `str`, `list`) — no numpy scalars

---

## Testing rules

- Every new physics function needs at least one pytest test with a known numerical result
- API integration tests are marked `@pytest.mark.asyncio` and hit live NASA/JPL endpoints
- Tests that document known limitations (e.g. gravity-assist objects) are kept and clearly labelled
- Run `pytest tests/ -v` before reporting any feature complete

---

## Fidelity assumptions (state these openly)

- Orbit propagation: **two-body Keplerian** (Sun only) — no planetary perturbations
- This is scientifically defensible for near-term (< 6 month) predictions of most NEOs
- Objects that have undergone recent planetary close-encounters cannot be backwards-propagated reliably with two-body
- All consequence estimates are **order-of-magnitude / hypothetical** — label them as such in every UI surface

---

## AI layer (IBM Granite)

- Model: `ibm/granite-8b-code-instruct` (Sydney region `au-syd.ml.cloud.ibm.com`)
- Every prompt must include a system instruction that: (a) grounds output in provided numbers only, (b) forbids invented statistics, (c) enforces non-sensationalized language
- Request structured JSON output with keys: `title`, `bottom_line`, `if_it_happened`, `whats_next`
- Validate output structure before returning to frontend — fall back to a structured error dict, never propagate raw LLM errors to the UI

---

## Week-by-week scope

| Week | Scope |
|---|---|
| 1 ✅ | Foundations: data fetch, 2-body propagation, validation, caching |
| 2 | Monte Carlo engine, Torino/Palermo scoring, Granite brief, Insight Score |
| 3 | 3D orbit viz (Three.js), full dashboard UI, deployment |
| 4 | Final QA, demo video, submission |

Do not start Week N+1 work until Week N is fully tested and demo-safe.
