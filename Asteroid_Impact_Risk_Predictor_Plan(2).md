# Asteroid Impact Risk Predictor
### "Meteor Rizzlers" — Comprehensive Project Plan
**AI Builders Challenge with IBM Bob — August Challenge: Advance Space Exploration with AI**

---

## Table of Contents

- [Asteroid Impact Risk Predictor](#asteroid-impact-risk-predictor)
    - ["Meteor Rizzlers" — Comprehensive Project Plan](#meteor-rizzlers--comprehensive-project-plan)
  - [Table of Contents](#table-of-contents)
  - [1. Executive Summary](#1-executive-summary)
  - [2. Challenge Recap — What You're Actually Being Judged On](#2-challenge-recap--what-youre-actually-being-judged-on)
  - [3. Problem Statement](#3-problem-statement)
  - [4. Solution Overview](#4-solution-overview)
  - [5. Why This Idea Wins](#5-why-this-idea-wins)
  - [6. System Architecture](#6-system-architecture)
  - [7. Data Sources \& APIs](#7-data-sources--apis)
  - [8. Core Technical Methodology](#8-core-technical-methodology)
    - [8.1 Orbit representation \& propagation](#81-orbit-representation--propagation)
    - [8.2 Monte Carlo uncertainty sampling](#82-monte-carlo-uncertainty-sampling)
    - [8.3 Risk scoring \& classification](#83-risk-scoring--classification)
    - [8.4 Impact consequence modeling](#84-impact-consequence-modeling)
    - [8.5 AI insight layer (IBM Granite)](#85-ai-insight-layer-ibm-granite)
  - [9. Tech Stack](#9-tech-stack)
  - [10. IBM Bob Usage Plan](#10-ibm-bob-usage-plan)
    - [10.1 What Bob Actually Is (start here)](#101-what-bob-actually-is-start-here)
    - [10.2 First-Time Setup (do this before touching the real project)](#102-first-time-setup-do-this-before-touching-the-real-project)
    - [10.3 Learn Bob in a Day — Practice Exercise](#103-learn-bob-in-a-day--practice-exercise)
    - [10.4 Phase-by-Phase Usage Plan for This Project](#104-phase-by-phase-usage-plan-for-this-project)
    - [10.5 Tips for a First-Time Team](#105-tips-for-a-first-time-team)
  - [11. Feature Roadmap — MVP vs. Stretch](#11-feature-roadmap--mvp-vs-stretch)
    - [MVP (must ship by Aug 31)](#mvp-must-ship-by-aug-31)
    - [Stretch goals (only after MVP is fully working)](#stretch-goals-only-after-mvp-is-fully-working)
  - [12. UI/UX \& Screen Plan](#12-uiux--screen-plan)
  - [13. Team Roles \& Responsibilities](#13-team-roles--responsibilities)
  - [14. Timeline \& Sprint Plan](#14-timeline--sprint-plan)
    - [Week 1 (Aug 8 – Aug 14): Foundations](#week-1-aug-8--aug-14-foundations)
    - [Week 2 (Aug 15 – Aug 21): Core Engine](#week-2-aug-15--aug-21-core-engine)
    - [Week 3 (Aug 22 – Aug 28): Integration, UI Polish, Deployment](#week-3-aug-22--aug-28-integration-ui-polish-deployment)
    - [Week 4 (Aug 29 – Aug 31): Finalize \& Submit](#week-4-aug-29--aug-31-finalize--submit)
  - [15. Required Learning Activities](#15-required-learning-activities)
  - [16. Submission Requirements Checklist](#16-submission-requirements-checklist)
  - [17. README Template](#17-readme-template)
  - [18. Demo Video Plan (3-Minute Storyboard)](#18-demo-video-plan-3-minute-storyboard)
  - [19. Judging Criteria Alignment](#19-judging-criteria-alignment)
  - [20. Risks \& Mitigations](#20-risks--mitigations)
  - [21. Real-World Impact \& Future Extensions](#21-real-world-impact--future-extensions)
  - [22. Quick-Start Checklist (TL;DR)](#22-quick-start-checklist-tldr)
  - [23. 3D Models \& Assets to Source](#23-3d-models--assets-to-source)
    - [Celestial bodies (core scene)](#celestial-bodies-core-scene)
    - [Real, named asteroids (use actual shape models, not generic rocks)](#real-named-asteroids-use-actual-shape-models-not-generic-rocks)
    - [Generic asteroids (for the thousands of NEOs with no published shape model)](#generic-asteroids-for-the-thousands-of-neos-with-no-published-shape-model)
    - [Not models — build these procedurally instead](#not-models--build-these-procedurally-instead)
    - [Stretch: spacecraft (optional, for context or a "historical mode" stretch goal)](#stretch-spacecraft-optional-for-context-or-a-historical-mode-stretch-goal)
    - [Licensing notes](#licensing-notes)
  - [24. Design Language \& UI/UX References](#24-design-language--uiux-references)
    - [References worth studying (and what to take from each — not copy)](#references-worth-studying-and-what-to-take-from-each--not-copy)
    - [Recommended distinct direction for this project](#recommended-distinct-direction-for-this-project)
  - [25. Appendix: Resources \& Links](#25-appendix-resources--links)

---

## 1. Executive Summary

**Project name:** Asteroid Impact Risk Predictor (working title — see naming options in Section 12)

**One-line pitch:** A web app that pulls real NASA/JPL near-Earth object data, propagates each asteroid's orbit forward with Monte Carlo uncertainty sampling, converts the resulting statistics into an intuitive risk score and physical impact-consequence estimate, and then uses an IBM Granite model to translate all of that math into a plain-English "mission brief" — turning a spreadsheet of orbital elements into something a non-specialist can understand and act on in seconds.

**Why it fits the theme:** The August challenge brief asks teams to move space exploration "from data-heavy to insight-driven systems." Near-Earth object (NEO) tracking is one of the best real-world examples of that exact problem — NASA and JPL already publish enormous amounts of precise orbital data, but almost none of it is usable by a non-astrodynamicist without translation. This project *is* the translation layer.

**Core differentiators:**
- Real orbital mechanics (not a toy random-number risk generator) — Keplerian propagation plus Monte Carlo trajectory sampling.
- A genuine LLM value-add: Granite doesn't just summarize a table, it turns a probability distribution into a decision-relevant narrative.
- A visual, animated 3D orbit view with a live risk readout — built for a 3-minute demo video that needs a "wow" moment in the first 20 seconds.
- Grounded in real planetary-defense science (Torino Scale, Palermo Scale, and the Earth Impact Effects Program) rather than invented metrics, which gives judges something credible to evaluate.

**Scope discipline:** This plan deliberately separates a **shippable MVP** (achievable solo or with a small team in the time remaining before August 31) from **stretch goals**, so the project is never at risk of being unfinished on submission day. Build the MVP first, always keep it in a demo-able state, then layer on stretch features only if time allows.

---

## 2. Challenge Recap — What You're Actually Being Judged On

Pulling directly from the official challenge page so nothing here is guessed:

| Item | Detail |
|---|---|
| Theme | Space Exploration — "Advance Space Exploration with AI" |
| Required primary tool | **IBM Bob** must be used as the primary development tool, and AI must be a core functional component |
| Encouraged technologies | IBM Granite, watsonx, LangChain/LangFlow, space-related APIs, vector databases, Python/Node.js/React/Next.js |
| Submission deadline | **Monday, August 31, 2026, 11:59 PM ET** |
| Required deliverables | (1) working prototype/POC built with IBM Bob, (2) completed IBM SkillsBuild learning activity, (3) public GitHub repo with a specific README structure, (4) a published project page with a public demo video (max 3 minutes) |
| Team size | Individuals or teams of **up to 5** |
| Prize pool | $15,000 total across both monthly challenges, with a $5,000 Grand Prize across the July + August challenges combined; individual August winners receive prizes in the $750–$2,250 range |
| Judging criteria | Technical Execution, Innovation, Challenge Fit, Feasibility, Real-World Impact (each scored by a panel) |
| Key dates already on the calendar | Aug 1 – challenge + GitHub Learning Lab open · Aug 3 10am ET – Kickoff Webinar · Aug 5 10am ET – Team Formation Webinar · IBM Technical Workshop – date TBA · **Aug 31 11:59pm ET – submission deadline** · Sept 1–11 – judging · Sept 16 – IBM Bob Virtual Conference & winner announcement |

**Practical implication:** because eligibility, GitHub repo, IBM Bob usage, and the SkillsBuild activity are all graded as pass/fail *requirements* before the project is even scored on the five judged criteria, this plan treats them as non-negotiable checklist items (Section 16), not optional polish.

---

## 3. Problem Statement

Planetary defense agencies (NASA's Planetary Defense Coordination Office, ESA's Planetary Defence Office) already track tens of thousands of near-Earth objects and continuously recompute their orbits and impact probabilities. That data — positions, velocities, orbital elements, close-approach dates, impact probabilities — is public and free. But it is published in forms built for astrodynamicists: JSON blobs of orbital elements, logarithmic hazard scales, and tables of Keplerian parameters.

The result is a real insight gap:
- A member of the public (or even a science journalist, policymaker, or student) cannot easily answer "should I actually be worried about this asteroid?"
- Even the two scales built for this purpose — Torino and Palermo — are widely misunderstood or misreported (Torino because it compresses two variables into one integer that resets to zero as soon as an object is ruled out; Palermo because it's logarithmic and comparative, not absolute).
- Raw impact probability numbers (often expressed as `1 in 15,000` or `2.3e-4`) are read by most people as far more or far less alarming than they actually are.
- There's no tool that connects "this is the probability of impact" to "and here is what would actually happen if it did," in language a non-expert can use to calibrate concern.

**The gap this project closes:** turn a live feed of NASA/JPL orbital and hazard data into (1) a scientifically defensible risk score, (2) a physical description of consequences if impact occurred, and (3) a natural-language brief that explains both — closing the loop from raw telemetry to human understanding, which is exactly the "data-heavy to insight-driven" transformation the challenge is asking for.

---

## 4. Solution Overview

The Asteroid Impact Risk Predictor is a single-page web application with four functional layers:

1. **Data layer** — pulls live/near-live data from NASA's NeoWs feed, JPL's Small-Body Database (SBDB), JPL's Close-Approach Data (CAD) API, and JPL's Sentry impact-monitoring system.
2. **Physics layer** — for a selected asteroid, propagates its orbit forward in time, runs a Monte Carlo ensemble of trajectories sampled from the orbit's known uncertainty, and derives an empirical close-approach/impact-probability distribution, a Torino/Palermo-style hazard classification, and — if the object is a real Sentry virtual impactor — cross-validates against JPL's own published probability.
3. **Consequence layer** — for the same asteroid, runs simplified Earth Impact Effects Program-style physics (kinetic energy, TNT-equivalent yield, crater diameter, and a basic damage-radius/seismic-magnitude estimate) so the risk score has a physical meaning attached to it, not just a probability.
4. **Insight layer** — feeds the structured outputs of layers 2 and 3 into an IBM Granite model (via watsonx.ai) with a carefully engineered prompt that produces a short, decision-oriented "mission brief": what the object is, how confident we are in the trajectory, what would happen in the (extremely unlikely) worst case, and what would need to happen next (e.g., "needs 3 more months of observation to rule out impact" style framing, mirroring how JPL actually talks about these objects).

All four layers surface in a single dashboard: search/select an asteroid → see its orbit animate toward Earth in 3D → see a live risk readout update as the Monte Carlo simulation runs → read the AI-generated brief → optionally compare multiple asteroids side by side.

---

## 5. Why This Idea Wins

| Judging criterion | How this project delivers |
|---|---|
| **Technical Execution** | Real orbital propagation and Monte Carlo statistics, not a mocked-up UI over static numbers. Live API integration with three separate NASA/JPL data sources. A genuine multi-step AI pipeline (structured data → engineered prompt → Granite → validated output), not a single chatbot wrapper. |
| **Innovation** | Very few hackathon space projects touch orbital mechanics directly — most stop at "here's a dashboard of NASA's API data." Layering Monte Carlo uncertainty and a natural-language insight generator on top is a genuine step up in sophistication, while still being buildable in three weeks. |
| **Challenge Fit** | This is close to a direct, word-for-word match to the brief: "transform space exploration from data-heavy to insight-driven systems," predictive monitoring, satellite/telemetry interpretation, decision-support. |
| **Feasibility** | Every data source is free, public, and well documented. The physics is simplified but scientifically grounded (published, peer-reviewed formulas, not invented ones). No specialized hardware, no proprietary datasets, no paid APIs required beyond a free NASA API key. |
| **Real-World Impact** | This is a real problem planetary-defense communicators actually have — translating Sentry/CNEOS data for the public and for policymakers is a recognized challenge, echoed by NASA's own "Eyes on Asteroids" and ESA's public-facing NEO tools. A polished version of this is genuinely useful outside the hackathon. |

**Demo-ability bonus:** a 3D orbit animating toward Earth with a risk readout updating live is inherently visual. Judges watching dozens of 3-minute videos will remember "the one with the asteroid flying at Earth" far more than "the one with the line chart."

---

## 6. System Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React/Next.js)                    │
│  ┌────────────┐  ┌───────────────┐  ┌────────────────┐  ┌──────────┐ │
│  │ Search /   │  │ 3D Orbit View  │  │ Risk Dashboard  │  │ AI Brief │ │
│  │ NEO Browser│  │ (Three.js)     │  │ (Recharts)      │  │ Panel    │ │
│  └─────┬──────┘  └───────┬────────┘  └────────┬────────┘  └────┬─────┘ │
└────────┼─────────────────┼────────────────────┼───────────────┼───────┘
         │                 │                    │                │
         ▼                 ▼                    ▼                ▼
┌──────────────────────────────────────────────────────────────────────┐
│                         BACKEND API (Python / FastAPI)                │
│                                                                        │
│  ┌───────────────┐   ┌────────────────────┐   ┌────────────────────┐ │
│  │ Data Fetch &   │──▶│ Orbit Propagation & │──▶│ Impact Consequence │ │
│  │ Normalization  │   │ Monte Carlo Engine  │   │ Model (EIEP-style) │ │
│  │ Layer          │   │ (hapsira / skyfield │   │                    │ │
│  │                │   │  + NumPy)           │   │                    │ │
│  └───────┬────────┘   └──────────┬──────────┘   └──────────┬─────────┘ │
│          │                       │                          │         │
│          │                       ▼                          ▼         │
│          │            ┌────────────────────────────────────────────┐ │
│          │            │        Risk Score & Classification Engine   │ │
│          │            │  (Torino/Palermo-style + custom 0–100 score)│ │
│          │            └───────────────────┬────────────────────────┘ │
│          │                                ▼                          │
│          │            ┌────────────────────────────────────────────┐ │
│          └───────────▶│   IBM Granite (via watsonx.ai) Insight Layer│ │
│                       │   Prompt = structured JSON → mission brief   │ │
│                       └────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
         ▲                                                    │
         │                                                    ▼
┌────────┴────────┐                              ┌────────────────────┐
│  NASA / JPL APIs │                              │  Cache / DB layer  │
│  NeoWs, SBDB,    │                              │  (SQLite/Postgres  │
│  CAD, Sentry     │                              │  for rate-limit    │
└──────────────────┘                              │  protection)       │
                                                   └────────────────────┘
```

**Design principle:** every layer produces a well-defined JSON contract that the next layer consumes. This matters for two reasons: (1) it lets you build and test each layer independently — critical when working against a hard deadline — and (2) it's exactly the kind of structured, modular scaffolding IBM Bob is good at generating and testing, so you can point Bob at one contract at a time instead of asking it to build "the whole app" in one shot.

---

## 7. Data Sources & APIs

All of the following are free. Register for a NASA API key at **https://api.nasa.gov** (instant, email-based signup) — do this on day one, since the shared `DEMO_KEY` is rate-limited to 30 requests/hour/IP and 50/day, which will not survive a team building and testing in parallel.

| Source | Purpose | Base endpoint | Notes |
|---|---|---|---|
| **NeoWs (Near Earth Object Web Service)** | Browse/search asteroids, get close-approach feeds, basic orbital data, estimated diameter | `https://api.nasa.gov/neo/rest/v1/feed` · `.../neo/{id}` · `.../neo/browse` | Feed endpoint is capped at 7-day windows; good for "what's approaching this week" views. |
| **JPL Small-Body Database (SBDB)** | Full orbital elements (semi-major axis, eccentricity, inclination, etc.) plus physical parameters (diameter, albedo, absolute magnitude H) for a specific object | `https://ssd-api.jpl.nasa.gov/sbdb.api?sstr={designation}` | This is your primary source of the Keplerian elements needed for orbit propagation. Supports a `discovery` and `phys-par` flag for extra fields. |
| **JPL Close-Approach Data (CAD) API** | Table of close-approach events (date, distance, relative velocity) for one or many objects over a date range | `https://ssd-api.jpl.nasa.gov/cad.api` | Useful for validating your own propagated close-approach date/distance against JPL's published value. |
| **JPL Sentry API** | The actual list of objects JPL's automated system flags as potential future Earth impactors, with impact probability, Palermo Scale, Torino Scale, and energy estimates already computed | `https://ssd-api.jpl.nasa.gov/sentry.api` (also proxied at `https://api.nasa.gov/SSD-CNEOS/Sentry`) | **This is your ground-truth validation set.** Build a "Compare my model to JPL Sentry" feature — for any object currently on the Sentry risk list, show your Monte Carlo-derived probability next to JPL's own published number. This is a very strong technical-execution signal for judges. |
| **JPL Horizons** (optional/stretch) | High-precision ephemerides for any solar-system body at any epoch | `https://ssd.jpl.nasa.gov/horizons/` (also via `astroquery.jplhorizons` in Python) | Use only if you want higher-fidelity propagation than a simple two-body Keplerian model; not required for MVP. |

**Recommended data flow:** use SBDB to get orbital elements for a chosen object → propagate locally with your own physics engine → use CAD to sanity-check your propagated close approach against JPL's → for objects that are actual Sentry virtual impactors, pull Sentry's numbers directly and display your model next to theirs.

---

## 8. Core Technical Methodology

This is the section to lean on heavily in your README's "AI approach and architecture" field and in your demo video's technical beat — it's what separates this project from a NASA-API-wrapper dashboard.

### 8.1 Orbit representation & propagation

Every asteroid in the SBDB is described by a set of **Keplerian orbital elements**: semi-major axis (a), eccentricity (e), inclination (i), longitude of ascending node (Ω), argument of periapsis (ω), and mean anomaly at a reference epoch (M₀). From these six numbers plus the two-body gravitational parameter of the Sun, you can compute the asteroid's full 3D position and velocity at any point in time by solving Kepler's equation.

- **Recommended library:** `hapsira` — the actively maintained fork of the well-known `poliastro` astrodynamics library (poliastro itself was archived in October 2023 and is no longer maintained, so hapsira is the current correct choice; API is nearly identical). It handles orbital element → state vector conversion, two-body propagation, and provides ready-made 3D orbit plotting.
- **Lightweight alternative:** `skyfield` + a hand-rolled Kepler solver using `numpy`/`astropy` for units and time handling, if you want fewer dependencies or run into `hapsira`/`numba` install issues in a constrained environment (a real risk on some CI/sandboxed setups — have this as your fallback, see Section 20).
- **Fidelity choice for the hackathon:** a pure two-body Keplerian propagation (ignoring planetary perturbations) is scientifically reasonable and defensible for near-term (weeks-to-few-years) close-approach predictions of most NEOs, and is dramatically simpler to implement and explain than an N-body perturbed model. State this fidelity assumption explicitly in your README — being upfront about a simplification is a feasibility/credibility strength, not a weakness.
- **Stretch option:** add J2/third-body perturbations or swap in `hapsira`'s Cowell propagator for objects with known close planetary encounters, if time allows.

### 8.2 Monte Carlo uncertainty sampling

JPL's orbital solutions come with a **covariance matrix** (or, more simply, a data-quality/uncertainty proxy you can approximate from the number and time-span of observations, available via SBDB's `discovery`/`orbit` fields such as `data_arc` and `n_obs_used`). Rather than propagating a single "best guess" trajectory, the technically-credible approach is:

1. Treat the six orbital elements as a multivariate distribution centered on the published best-fit values, with spread derived from the published 1-sigma uncertainties (SBDB provides these) or, for a simplified fallback, a spread scaled inversely to `n_obs_used` and `data_arc` (fewer/shorter observations → wider uncertainty — this mirrors how real newly-discovered objects behave).
2. Draw N samples (e.g., 1,000–10,000) from that distribution.
3. Propagate **every sampled orbit** forward to the target date using the propagator from 8.1.
4. Record each sample's minimum Earth-distance (or whether it falls within Earth's cross-section, accounting for gravitational focusing).
5. The **fraction of samples that result in impact** is your empirical impact probability — this is the same conceptual approach JPL's own Sentry-II system uses (line-of-variation sampling of the uncertainty region), simplified for a hackathon timeframe.

This step is the technical heart of the project and the one that most clearly demonstrates "AI/computation turning raw data into insight" rather than just displaying numbers NASA already computed.

### 8.3 Risk scoring & classification

Once you have an empirical impact probability and an estimated impact energy (see 8.4), compute:

- **Palermo-style scale:** compares your computed impact probability, weighted by time-to-potential-impact, against the known background rate of impacts of similar-energy objects. Values below −2 indicate no cause for concern; between −2 and 0 merit monitoring; above 0 indicates above-background risk. This is a logarithmic, comparative scale intended for technical communication.
- **Torino-style scale:** an integer 0–10 combining probability and kinetic energy into a single color-coded category (white = no hazard, green = normal, yellow/orange = merits attention, red = certain collision with significant regional-to-global consequences). This is the scale designed for public communication, and it's the one your dashboard should show most prominently.
- **Custom composite "Insight Score" (0–100):** this is your own product decision, not a scientific scale — a single, friendly number that blends the Torino category, probability, and estimated consequence severity into something a general audience reads instantly (think "air quality index," not "pH scale"). Building this shows product thinking on top of the science, which judges evaluating "real-world impact" respond well to. Be explicit in your README that this is your own derived UX metric, clearly distinguished from the official Torino/Palermo scales.

### 8.4 Impact consequence modeling

For objects with non-negligible impact probability (or for any object a user wants to explore hypothetically), estimate physical consequences using the same general approach as the peer-reviewed **Earth Impact Effects Program** (Collins, Melosh & Marcus, 2005), simplified to what's implementable in three weeks:

- **Kinetic energy:** `E = ½ · m · v²`, where mass is derived from estimated diameter (from SBDB/NeoWs) and an assumed bulk density (typically 1,500–3,000 kg/m³ depending on composition class), and `v` is the impact velocity from your propagated trajectory.
- **TNT equivalent:** convert Joules to megatons of TNT (1 megaton ≈ 4.184 × 10¹⁵ J) for a unit people intuitively understand.
- **Crater diameter estimate:** apply a simplified crater-scaling relationship (energy- and gravity-scaling laws from the published literature) to estimate transient crater diameter for a given impact angle and target material (rock vs. ocean).
- **Basic damage-radius categories:** using published rule-of-thumb relationships (e.g., airburst altitude for smaller/weaker objects vs. ground impact for larger/denser ones, following the same general Chelyabinsk-style airburst logic NASA itself uses in public materials) — present broad categories ("local damage," "regional devastation," "global effects") rather than false-precision numbers, which is both more honest and easier to build correctly under time pressure.

Cite the Collins/Melosh/Marcus methodology by name in your README as your scientific basis, and clearly label all outputs as *order-of-magnitude estimates for a hypothetical scenario*, not operational predictions — this is both scientifically responsible and protects you from over-claiming precision you don't have.

### 8.5 AI insight layer (IBM Granite)

The LLM layer is not there to "make the app sound smart" — it has a specific, well-defined job: convert a structured JSON object (probability, Torino/Palermo values, energy, crater estimate, observation quality/uncertainty) into a short narrative brief with a consistent structure, e.g.:

1. **What it is** — object designation, size class, discovery context.
2. **Bottom line** — plain-language risk statement calibrated to the actual number (avoid both false alarm and false reassurance language).
3. **If it happened** — one or two sentences translating the physical consequence model into human terms.
4. **What happens next** — observational context (e.g., "additional tracking over the coming months would be expected to further refine this estimate," mirroring how JPL/CNEOS actually talks about newly flagged objects).

Prompt engineering approach:
- Use a **strict system prompt** that (a) always grounds the narrative only in the numbers provided, (b) forbids inventing extra statistics not in the input JSON, and (c) enforces calibrated, non-sensationalized language (banning phrases like "doomsday" unless the actual Torino category is genuinely high).
- Request **structured JSON output** from Granite (title, summary, confidence caveat, consequence paragraph) so the frontend can render it into consistent UI components rather than parsing free text.
- Add a **guardrail pass** (Granite Guardian, available in the watsonx model catalog, or a second lightweight prompt) that checks the generated brief doesn't overstate certainty — a nice, demo-able "responsible AI" touch that's easy to build and genuinely relevant to a domain where miscommunication has real consequences.

---

## 9. Tech Stack

| Layer | Recommended | Why |
|---|---|---|
| Frontend framework | **React + Next.js** | Explicitly listed as an encouraged technology; strong ecosystem for data dashboards. |
| 3D orbit visualization | **Three.js** (or `react-three-fiber`) | Renders the animated orbit-toward-Earth view that anchors your demo video. |
| Charts / dashboard | **Recharts** or **Plotly.js** | Probability distributions, Monte Carlo histograms, risk-over-time views. |
| Backend API | **Python + FastAPI** | Clean fit with the scientific Python stack (NumPy, hapsira/skyfield); async-friendly for calling multiple NASA APIs concurrently. |
| Orbit propagation | **hapsira** (poliastro's maintained fork) or **skyfield** + custom Kepler solver | See Section 8.1 for the tradeoffs. |
| Numerical/statistics | **NumPy / SciPy** | Monte Carlo sampling, distribution fitting. |
| LLM layer | **IBM Granite** via **watsonx.ai** (e.g., a Granite Instruct model such as `ibm/granite-3-8b-instruct`) | Required/encouraged technology; free-tier watsonx.ai project + API key is sufficient for a hackathon's request volume. |
| Orchestration (optional) | **LangChain** | Only if you want structured prompt templates/output parsing out of the box — a hand-written prompt + `ibm-watsonx-ai` SDK call is equally valid and simpler to debug under time pressure. |
| Caching/storage | **SQLite** (or Postgres if the team is comfortable with it) | Cache NASA API responses to protect against rate limits during demos and judging. |
| Deployment | **Vercel** (frontend) + **Render/Railway/Fly.io** (FastAPI backend) or a single containerized deploy | Needs to be *publicly accessible* per submission requirements — plan this early, not on Aug 30. |

**Primary development tool requirement:** all of the above should be scaffolded, generated, tested, and iterated on using **IBM Bob** — see Section 10 for exactly how to do this in a way that's easy to document for judges.

---

## 10. IBM Bob Usage Plan

The challenge requires Bob to be your **primary development tool**, and your README must explicitly describe how it was used. Since nobody on the team has used it before, this section starts with orientation, not the task table — get comfortable with Bob on a throwaway exercise before relying on it for the real build.

### 10.1 What Bob Actually Is (start here)

Bob is IBM's AI software-development-lifecycle (SDLC) assistant — less a single autocomplete tool, more an AI teammate living in your editor that can plan, code, test, debug, and document with you across a whole build, not just one function at a time. The pieces you'll actually touch:

- **Specialized Modes** — Bob behaves differently depending on mode: a planning/architecture mode will resist writing code and instead help you think through design; a coding mode will actually make file edits; there are also debugging- and documentation-oriented modes. Switching modes changes behavior, not just tone.
- **Guardrails / approval flow** — Bob proposes changes and waits for you to approve, edit, or reject each one before anything touches your real files. You stay in control unless you deliberately choose a more autonomous setting.
- **Tools beyond text generation** — Bob can read files, run commands, and analyze your whole codebase's structure, not just answer questions about pasted snippets.
- **Bob Rules** — a project-level config file where you state your coding style, documentation conventions, and decision-making preferences once, instead of repeating them every conversation. Set this up on day one (Section 10.2).
- **Agent Skills** — reusable instruction sets you teach Bob once and reuse — genuinely useful here since several backend modules in this project (Section 6) follow the same structural pattern.
- **MCP (Model Context Protocol)** — lets you connect Bob directly to external tools/data sources. Optional for the MVP; flagged as a stretch option in 10.4.
- **Bob Shell** — a terminal/CLI version of Bob, usable interactively (review each step) or non-interactively (for scripting/automation, e.g., an unattended batch validation run).
- **@references** — inside a conversation, point Bob directly at specific files instead of describing your codebase in prose — meaningfully more accurate once you have real files to reference.

### 10.2 First-Time Setup (do this before touching the real project)

1. **Get access.** Use the challenge platform's IBM Bob free-trial link to activate your account and Bobcoins allowance. If a team member has already used a trial or run out of Bobcoins, the challenge FAQ guide has steps for starting a new trial — resolve this in the first session, don't let it block Week 1.
2. **Install where you'll actually work.** Bob is used primarily as an IDE extension (VS Code is the most commonly documented path) — install it there first. Optionally add **Bob Shell** for terminal-based access if you expect to script batch tasks later.
3. **Take a five-minute orientation tour.** Open Bob's panel, look at the mode selector and settings before starting any real work — don't discover the modes for the first time mid-task.
4. **Set up Bob Rules for this project immediately.** State the tech stack (Python/FastAPI backend, Next.js/React frontend), your style preferences, that every physics function needs a docstring with units, that every backend module must expose a documented JSON contract, and that generated code should include tests where practical. This one step noticeably improves every later interaction, because you stop re-explaining context each time.

### 10.3 Learn Bob in a Day — Practice Exercise

Don't let your first real experience with Bob be on a deadline-critical feature. Spend a focused 60–90 minutes on a low-stakes practice run before Week 1's real work begins:

1. Complete the required IBM SkillsBuild activity **"Troubleshoot Your Code Using IBM Bob"** first — it's a guided, hands-on lab on structured prompting and AI-assisted debugging, and it's required anyway, so do it early enough to actually learn from it rather than just checking a box.
2. Optionally work through the **August GitHub Learning Lab** ("AI in Space: Build a Space Weather Data Dashboard with IBM Bob") — a real NASA-data-plus-Bob-plus-Python exercise close enough to this project's domain that the practice transfers directly.
3. Then run one tiny throwaway exercise on *this* project: in **planning mode**, ask Bob to sketch just the data-fetch layer (Section 6) from a one-paragraph description you write yourself. Watch how it asks clarifying questions, review its proposed plan, then switch to **coding mode** and have it implement only that one small piece. The goal isn't the code — it's getting comfortable with the plan → review → code → review rhythm before you're relying on it for the whole app.

### 10.4 Phase-by-Phase Usage Plan for This Project

Plan concrete Bob usage at each phase and **keep evidence as you go** (chat exports, screenshots, or commit messages referencing Bob-assisted changes) so writing the README section is trivial in week three instead of a scramble.

| Phase | How to use Bob | Evidence to capture |
|---|---|---|
| **Planning** | Start in **planning mode**. Paste Section 6 (architecture) and Section 7 (data sources) of this plan and have Bob turn them into a repo structure, per-module JSON contracts, and a task backlog. Let it ask clarifying questions before generating anything. | Screenshot/export of the planning conversation; save the output into `/docs/plan.md`. |
| **Scaffolding** | Switch to **coding mode**. Have Bob generate the initial FastAPI project skeleton, the Next.js frontend skeleton, and the shared types/schema between them, based on the planning artifact. | Initial commit referencing the Bob-generated scaffold. |
| **Core feature coding** | Implement each backend module (data fetch → propagation engine → risk scoring → Granite integration) one at a time, using **@references** to point Bob at the relevant files rather than re-describing the codebase in prose. Do the same for each frontend panel against its API endpoint. | Bob session logs per feature branch; PR descriptions noting "implemented with IBM Bob." |
| **Reusable patterns** | Once the first backend module is built, capture that pattern as an **Agent Skill** ("build a FastAPI module with a documented JSON contract and a matching pytest file") so the remaining modules go faster and stay consistent. | The skill definition file, committed to the repo. |
| **Testing** | Ask Bob to generate unit tests for the physics functions (e.g., "given these orbital elements, propagated position should match this JPL Horizons reference value within tolerance X") and for the API endpoints. For repetitive validation runs, consider **Bob Shell**'s non-interactive mode. | Test files in `/tests`; a short note on which tests were Bob-authored vs. hand-written. |
| **Debugging** | Apply the structured-prompting technique from the required SkillsBuild lab to real bugs (a mismatched epoch bug in the propagation code, a CORS issue between frontend and backend) — switch into a debugging-oriented mode rather than treating every bug as a fresh coding request. | A short before/after note in the README's "How IBM Bob was used" section. |
| **Documentation** | Have Bob draft docstrings, the API reference doc, and a first pass of the README, which you then edit for accuracy and voice. | Keep the Bob-drafted version as a diff/commit, to show iteration. |
| **MCP (stretch, optional)** | If time allows, connect Bob to the NASA/JPL APIs via MCP so it can query live data directly while coding against it, instead of you pasting sample responses manually. Not required for a strong submission. | Note in README if used. |

### 10.5 Tips for a First-Time Team

- **Be specific, not vague.** "Build the orbit propagation module" gets a worse result than "Build a function that takes SBDB orbital elements as input, returns a state vector at a given epoch using two-body Keplerian propagation, and matches this schema: [paste schema]."
- **Break big asks into small steps and actually review each one** — the approval flow only protects you if you read what's being proposed instead of clicking through it.
- **Use @references constantly** once real files exist — describing your codebase in prose gets worse as the project grows; pointing Bob at actual files doesn't.
- **Don't skip planning mode.** Jumping straight to "write me the whole app" tends to produce a pile of code nobody fully understands by week three. Planning first, in writing, with Bob, tends to leave you with a codebase you can actually explain in the README and demo confidently.

**Why this matters beyond compliance:** "Effective use of IBM Bob" is literally named in the official judging rubric as part of the Technical Execution criterion. A README that says "we used Bob to write the whole thing" is weak evidence; a README that shows Bob used deliberately across planning, coding, testing, and debugging — by a team that visibly climbed the learning curve rather than just clicking "generate" — is strong evidence.

---

## 11. Feature Roadmap — MVP vs. Stretch

Build top-to-bottom. Do not start stretch items until every MVP item works end-to-end and is demo-safe.

### MVP (must ship by Aug 31)
- [ ] NASA API key provisioned; data-fetch layer for NeoWs + SBDB + CAD working and cached.
- [ ] Search/select interface for at least the current Sentry risk-list objects, plus general NeoWs browse.
- [ ] Two-body Keplerian orbit propagation for a selected object, validated against at least one JPL CAD close-approach record.
- [ ] Monte Carlo sampling producing an empirical close-approach distribution and impact probability.
- [ ] Torino-style classification + custom 0–100 Insight Score computed and displayed.
- [ ] Basic impact consequence estimate (energy, TNT-equivalent, order-of-magnitude crater size).
- [ ] Granite/watsonx integration producing a structured natural-language brief from the above outputs.
- [ ] 3D orbit visualization (even a simplified static-camera Three.js scene showing the propagated path relative to Earth is sufficient — animation quality is a stretch item, existence of a 3D view is MVP).
- [ ] Dashboard UI tying all of the above together for a single selected object.
- [ ] Deployed publicly (frontend + backend reachable via public URL).
- [ ] GitHub repo public with README meeting all required sections (Section 17).
- [ ] IBM SkillsBuild learning activity completed by every team member.
- [ ] Demo video recorded, ≤3 minutes, publicly accessible.
- [ ] Project page published on the BeMyApp challenge platform.

### Stretch goals (only after MVP is fully working)
- [ ] Live comparison mode: your Monte Carlo probability vs. JPL Sentry's published probability, side by side, for real virtual-impactor objects.
- [ ] Animated (not static) orbit view with a time-scrubber.
- [ ] Multi-object comparison dashboard (rank several NEOs by Insight Score).
- [ ] Perturbed (not pure two-body) propagation for higher fidelity on select objects.
- [ ] Granite Guardian pass for output calibration/safety checking, surfaced in the UI as a visible "responsible AI check."
- [ ] "Ask a follow-up question" chat interface layered on top of the generated brief (RAG over the underlying structured data, not free-floating chat).
- [ ] Historical mode: replay how a real past event (e.g., Chelyabinsk, or a well-documented past Sentry removal) would have looked in this tool at the time.
- [ ] Public-outreach mode: a simplified, kid-friendly explanation toggle for the generated brief (nice tie-in to the challenge's "space education and public engagement" example solution area).

---

## 12. UI/UX & Screen Plan

**Suggested screens/panels (single-page app, tabbed or scroll-based):**

1. **Landing / Search** — headline, short explainer, search bar + a curated "currently on JPL's watch list" quick-select list (pulls from Sentry API) so judges don't have to type anything during the demo.
2. **Orbit View** — 3D scene: Sun, Earth's orbit, the selected asteroid's propagated path, and (if Monte Carlo has run) a faint "cloud" of sampled trajectories illustrating uncertainty. This is your visual anchor.
3. **Risk Dashboard** — Torino-scale badge (color-coded), custom Insight Score gauge, Palermo value, impact probability with an intuitive framing (e.g., "less likely than X" comparisons, handled carefully — see Section 20 risk register on over-editorializing probability).
4. **Consequence Panel** — estimated energy (megatons TNT), estimated crater size, and a plain-language severity category, clearly labeled as a hypothetical scenario.
5. **AI Mission Brief** — the Granite-generated narrative, formatted consistently (title, bottom line, "if it happened," "what's next").
6. **(Stretch) Compare Panel** — your model vs. JPL Sentry's published numbers for real objects.

**Naming options** (pick one and stay consistent across README, project page, and video — this is a small but real polish signal to judges):
- Meteor Rizzlers (Impact) Console
- ImpactIQ
- Sentry Sidekick
- OrbitBrief
- NEO Insight

**Visual tone:** dark space theme, high-contrast risk color coding (white/green/yellow/orange/red mirroring Torino, so the color language is instantly familiar to anyone who's seen NASA's own materials), minimal text on screen — let the AI brief panel carry the explanatory language rather than cluttering the dashboard.

*For the full 3D asset sourcing list, see Section 23. For deeper design-language references and how to make this visually distinct from NASA's own tools, see Section 24.*

---

## 13. Team Roles & Responsibilities

Teams may be 1–5 people. Suggested role split for a team of 4–5 (collapse roles as needed for smaller teams — a solo builder should follow the phase order in Section 14 rather than parallelizing):

| Role | Responsibilities |
|---|---|
| **Data/Backend Lead** | NASA/JPL API integration, caching layer, FastAPI endpoints, deployment of backend. |
| **Physics/Science Lead** | Orbit propagation, Monte Carlo engine, risk scoring, impact consequence model, validation against JPL CAD/Sentry data, writing the "AI approach and architecture" README section. |
| **AI/Prompt Lead** | watsonx.ai/Granite integration, prompt engineering and structured output design, Granite Guardian pass if pursued. |
| **Frontend/UX Lead** | React/Next.js app, 3D orbit visualization, dashboard components, deployment of frontend. |
| **PM/Storyteller** | Timeline tracking, README assembly, demo video script/editing, project page publishing, submission checklist ownership, IBM Bob usage documentation. |

Even in a larger team, designate **one person as the final owner of the submission checklist** (Section 16) — the most common way strong technical projects lose points is a missed or malformed submission requirement, not weak code.

---

## 14. Timeline & Sprint Plan

Calibrated to today's date (**August 8, 2026**) against the official **August 31, 11:59 PM ET** deadline — roughly 3.5 weeks remaining. If your team hasn't yet joined the Discord, watched the kickoff/team-formation webinar recordings, or registered a project page, do that first, in parallel with Week 1 below — don't let it delay the build.

### Week 1 (Aug 8 – Aug 14): Foundations
- Register NASA API key; confirm access to watsonx.ai / Granite (set up a watsonx project, generate an API key and project ID).
- Finalize team roles and repo structure; scaffold both frontend and backend with IBM Bob (Section 10).
- Build and validate the data-fetch layer (NeoWs + SBDB + CAD) against a couple of known objects.
- Implement two-body orbit propagation; validate against a real JPL CAD close-approach record for at least one object (this validation step is your single best piece of technical-credibility evidence — do it early, not last).
- Attend/catch up on the IBM Technical Workshop once its date is announced.
- **Milestone:** you can fetch a real asteroid's orbital elements and reproduce a known close-approach distance/date within a reasonable tolerance.

### Week 2 (Aug 15 – Aug 21): Core Engine
- Implement Monte Carlo sampling and empirical probability calculation.
- Implement Torino/Palermo-style classification and the custom Insight Score.
- Implement the impact consequence model (energy, TNT-equivalent, crater estimate).
- Stand up the watsonx.ai/Granite integration with a first-draft prompt; iterate on structured JSON output.
- Start the 3D orbit visualization (static scene first, animation later).
- **Milestone:** end-to-end pipeline works for at least one real object — API data in, AI-generated brief out — even if the UI is still rough.

### Week 3 (Aug 22 – Aug 28): Integration, UI Polish, Deployment
- Wire the full dashboard UI together; connect all panels to live backend data.
- Add the "currently on JPL's watch list" quick-select using the Sentry API.
- Deploy frontend + backend publicly; test the deployed version end-to-end, not just localhost.
- Write and finalize the GitHub README (Section 17).
- Begin stretch goals only if MVP is fully complete and stable.
- Draft the demo video script (Section 18); start recording/screen-capturing B-roll of the orbit visualization early, since good visual capture often takes more takes than expected.
- **Milestone:** a stranger could open your deployed link and use the tool without your help.

### Week 4 (Aug 29 – Aug 31): Finalize & Submit
- Record and edit the final demo video (≤3 minutes); upload publicly (YouTube unlisted/public, or the platform's native option).
- Final QA pass on the deployed app — test on a fresh browser/incognito session, and ideally a different network, to catch anything environment-specific.
- Publish the project page on the BeMyApp platform with all required fields, team members, GitHub link, and video link.
- Confirm the GitHub repo is genuinely public (not just "unlisted") and the video link works without any login.
- Submit well before 11:59 PM ET on Aug 31 — do not submit in the final hour; platform load and last-minute bugs are a real risk at deadline time.
- **Milestone:** submission published and independently verified by a teammate clicking through it fresh.

---

## 15. Required Learning Activities

Per the challenge requirements, completion of the **IBM SkillsBuild learning activity** is a mandatory submission item (not optional). Two relevant activities are highlighted on the challenge resources page:

1. **"Troubleshoot Your Code Using IBM Bob"** — hands-on lab on structured prompting and AI-assisted debugging in VS Code. Directly useful for this project's inevitable propagation-math and API-integration bugs — do this one first, early enough to actually apply the technique while building.
2. **"How IBM Bob and AI Tools Are Changing the Way Solutions Are Built"** — shorter overview activity on AI's role across the SDLC; useful context for how to talk about your Bob usage in the README.

Also review (optional but recommended, not required like SkillsBuild):

3. **August GitHub Learning Lab — "AI in Space: Build a Space Weather Data Dashboard with IBM Bob"** (60–90 min) — a Jupyter-notebook lab using Bob to build a classification model on real NASA space-weather data. It won't directly build your app, but it's good early practice with Bob on a similar (space + real NASA data + ML) problem before you start the real build, and its data-cleaning/feature-engineering patterns transfer directly to working with SBDB/NeoWs data.

Every team member should individually complete the required SkillsBuild activity — confirm this explicitly rather than assuming, since it's an individual completion requirement in some past IBM SkillsBuild challenge structures.

---

## 16. Submission Requirements Checklist

Copy this directly into a tracked doc/issue and check off as completed. Nothing here is optional.

**Prototype**
- [ ] Working prototype or proof of concept, built using IBM Bob as primary development tool
- [ ] AI (Granite/watsonx) is a core functional component, not decorative

**Learning**
- [ ] Required IBM SkillsBuild learning activity completed by all team members

**GitHub Repository (public)**
- [ ] Clear README including:
  - [ ] Problem statement
  - [ ] Solution description
  - [ ] AI approach and architecture
  - [ ] Selected challenge theme (Space Exploration — August Challenge)
  - [ ] How IBM Bob was used
- [ ] Repository is genuinely public (verify in an incognito/logged-out browser)

**Project Submission Page (on BeMyApp platform)**
- [ ] Project and team member details filled in
- [ ] Link to GitHub repository
- [ ] Publicly accessible demo/presentation video, **maximum 3 minutes**
- [ ] Both the GitHub repo and the video link verified as accessible without login, by someone other than the person who created them

---

## 17. README Template

```markdown
# [Project Name]

## Challenge
IBM AI Builders Challenge with IBM Bob — August Challenge: Space Exploration

## Problem Statement
[2-4 sentences — see Section 3 of the plan for source material]

## Solution Description
[What the app does, for whom, in plain language — see Section 4]

## AI Approach and Architecture
- Orbit propagation & Monte Carlo uncertainty engine: [brief description]
- Risk scoring (Torino/Palermo-style + custom Insight Score): [brief description]
- Impact consequence model: [brief description]
- IBM Granite (watsonx.ai) insight layer: [prompt design summary, structured output approach]
- Architecture diagram: [link to image or paste ASCII diagram from Section 6]

## How IBM Bob Was Used
[Concrete, phase-by-phase account — pull from Section 10 of the plan and your actual session evidence. Be specific: "Bob generated the initial FastAPI scaffold and 12 of our 18 backend unit tests; we used its debugging mode to resolve a J2000 epoch mismatch bug in the propagation code," not "we used Bob a lot."]

## Data Sources
- NASA NeoWs API
- JPL Small-Body Database (SBDB) API
- JPL Close-Approach Data (CAD) API
- JPL Sentry API

## Tech Stack
[List from Section 9]

## Setup / Run Locally
[Standard install & run instructions]

## Live Demo
[Deployed URL]

## Demo Video
[Link]

## Team
[Names + roles]

## Disclaimer
This tool produces educational, order-of-magnitude estimates using simplified physics models for hackathon purposes. It is not an operational planetary-defense tool. For authoritative, real-time asteroid risk assessments, refer to NASA/JPL's Center for Near-Earth Object Studies (CNEOS) at https://cneos.jpl.nasa.gov.
```

---

## 18. Demo Video Plan (3-Minute Storyboard)

**The video is a product demo, not a technical presentation.** Judges get your technical credibility (orbit validation, Monte Carlo methodology, IBM Bob usage across the SDLC) from the README — that's where it's actually scored in detail and where it belongs, in writing, where they can review it carefully. The video's only job is to make them *want* to open the link: show the thing working, show it being genuinely useful, and get out. Don't spend precious seconds narrating architecture or showing IBM Bob screenshots on screen — that reads as padding, not substance, in a 3-minute format.

| Time | Beat | What's on screen |
|---|---|---|
| 0:00–0:15 | **Hook** | Cold open on the 3D orbit view already animating an asteroid's trajectory toward Earth with the risk readout ticking. No logo slide first — lead with the visual. |
| 0:15–0:30 | **Problem, fast** | One sentence: NASA/JPL track thousands of these objects and the data is public, but unreadable to anyone who isn't an astrodynamicist. Move on immediately — don't dwell here. |
| 0:30–2:30 | **Solution walkthrough (the bulk of the video)** | This is where almost all your time goes. Search/select a real object live from the Sentry watch list. Watch the orbit propagate and the Monte Carlo cloud render. Watch the Torino badge and Insight Score populate. Watch the AI mission brief generate and read a line or two of it aloud. If you built the compare-to-JPL-Sentry feature or the multi-object comparison view, show it here too — as product, not as proof. The goal is a smooth, confident click-through that makes the tool look easy and satisfying to use, the way a good product demo (not a conference talk) does. |
| 2:30–2:50 | **Who it's for / why it matters** | One sentence tying it back to real usefulness — science communicators, students, anyone who's seen an asteroid headline and wondered how worried to actually be. |
| 2:50–3:00 | **Close** | Project name, team name, one-line tagline, GitHub link on screen. |

**What to deliberately leave out of the video** (put these in the README instead, where they're actually judged):
- IBM Bob screenshots or a "planning/coding/testing with Bob" montage — document this in the README's "How IBM Bob was used" section instead.
- The JPL validation/comparison explained in technical terms — if you show the compare feature at all, show it as a cool product moment ("see how close we get to JPL's own number"), not as a methodology defense.
- Architecture or pipeline explanation — no diagrams, no "here's how the Monte Carlo engine works."

**Production notes:**
- Record screen capture in short, clean segments rather than one continuous take — much easier to edit and re-take a 10-second segment than a 3-minute one.
- Use real, currently-listed Sentry objects for the live demo portion so what's on screen is genuinely current NASA/JPL data, not a mocked example — authenticity judges will notice without you having to say it.
- Keep the walkthrough moving — cut to the next feature the moment the previous one has landed, the same way you'd storyboard a product launch video, not a project defense.
- Keep a visible timer/rehearsal pass before the final recording — teams very commonly go over 3 minutes on the first attempt, and with this much screen time dedicated to walkthrough, pacing discipline matters more, not less.

---

## 19. Judging Criteria Alignment

Use this table as a self-audit before submission — for each criterion, make sure there's something specific in your README/video a judge can point to.

| Criterion | Evidence in this project |
|---|---|
| **Technical Execution** | Real orbit propagation validated against JPL data; Monte Carlo statistical engine; multi-source live API integration; structured, testable AI pipeline; documented IBM Bob usage across the SDLC. |
| **Innovation** | Uncertainty-aware (not point-estimate) risk modeling; a genuinely functional LLM translation layer grounded in computed physics rather than a generic chatbot; a self-validating feature comparing your model to JPL's own published numbers. |
| **Challenge Fit** | Directly addresses "predictive monitoring," "data interpretation tools," and "decision-support platforms" from the challenge's example solution areas; explicitly answers the brief's "data-heavy to insight-driven" framing. |
| **Feasibility** | Built entirely on free, public, well-documented data sources; no proprietary or paid dependencies; realistic three-week scope with an explicit MVP/stretch split. |
| **Real-World Impact** | Addresses a genuine, recognized science-communication gap around planetary defense data; extensible toward public outreach, education, and journalism use cases; explicit disclaimer shows responsible-AI awareness of the difference between an educational tool and an operational one. |

---

## 20. Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| `hapsira`/`numba` install issues in a constrained or sandboxed dev environment | Medium | Have the `skyfield` + hand-rolled Kepler-solver fallback ready from day one (Section 8.1); don't discover this blocker in week 3. |
| NASA `DEMO_KEY` rate limits interrupting development or a live demo | Medium–High | Register a real API key on day one; build a caching layer early (Section 9) so the live demo doesn't depend on a fresh API call at the moment of recording. |
| watsonx.ai/Granite access setup friction (project/API key provisioning) | Medium | Provision this in Week 1, not when you're ready to integrate it — account/project setup can have its own onboarding delay. |
| Scope creep into full N-body/perturbed orbital mechanics | Medium | Explicitly cap MVP physics fidelity at two-body Keplerian (Section 8.1); perturbations are stretch-only. |
| Over-claiming precision on impact consequence numbers | Low–Medium (but reputationally important) | Always label consequence outputs as order-of-magnitude/hypothetical; this is stated explicitly in the README disclaimer (Section 17) and in the AI brief's own system prompt (Section 8.5). |
| Video runs over 3 minutes | High if not planned for | Storyboard with explicit timestamps (Section 18); do a rehearsal read-through with a timer before final recording. |
| Deployed app breaks under judge/public traffic or link rot before judging (Sept 1–11) | Medium | Use a stable, free-tier host with reasonable uptime (Vercel/Render/Railway); test the *deployed* link, not just localhost, in the final week; keep the deployment live through at least September 11. |
| Team member doesn't complete the required SkillsBuild activity | Low if tracked | Add it as a tracked, individually-owned checklist item in Week 2, not an assumption. |
| Misreporting/misreading Torino or Palermo values in your own UI copy | Medium | Have the Science Lead review all in-UI hazard-scale language against the actual published scale definitions (Section 8.3) before final submission — these scales are widely misreported even by professional media, so get this specifically right as a credibility signal. |

---

## 21. Real-World Impact & Future Extensions

Beyond the hackathon, this concept maps cleanly onto real, ongoing needs:

- **Public science communication:** NASA/ESA planetary defense offices, science journalists, and educators consistently need better tools for translating Sentry/CNEOS data for non-specialist audiences — this is a recognized gap, not a hypothetical one.
- **Education:** the "kid-friendly explanation toggle" stretch goal (Section 11) turns this into a genuinely usable STEM education tool, directly echoing the challenge's own "space education and public engagement" example solution area.
- **Policy/decision support:** a calibrated, uncertainty-aware risk communication layer is exactly the kind of tool that helps non-technical decision-makers avoid both panic and complacency — a real, named problem in planetary defense communication.
- **Extensibility:** the same architecture (orbit propagation → uncertainty modeling → consequence modeling → LLM narrative layer) generalizes beyond asteroids to other space-domain-awareness problems (satellite conjunction/collision risk, re-entry debris tracking), which is a natural "where we'd take this next" answer if judges ask about future direction.

---

## 22. Quick-Start Checklist (TL;DR)

If you only read one section, read this one — then go back for detail as needed.

1. Register a NASA API key at api.nasa.gov; set up a watsonx.ai project + Granite API access.
2. Finalize team roles (or solo-sequence the phases) and scaffold the repo with IBM Bob.
3. Build and validate the data layer (NeoWs, SBDB, CAD) against a real known close-approach.
4. Build two-body orbit propagation (hapsira or skyfield) — validate against JPL data.
5. Add Monte Carlo uncertainty sampling → empirical impact probability.
6. Add Torino/Palermo-style scoring + your own Insight Score.
7. Add the impact consequence model (energy, TNT-equivalent, crater estimate).
8. Wire structured outputs into a Granite prompt → natural-language mission brief.
9. Build the dashboard UI + 3D orbit view; connect everything end-to-end.
10. Deploy publicly; test the deployed link, not just localhost.
11. Complete IBM SkillsBuild learning activity (all team members).
12. Write the README to the required structure; document Bob usage concretely.
13. Script, record, and edit a ≤3-minute demo video.
14. Publish the project page with all required fields and links.
15. Submit before Aug 31, 11:59 PM ET — don't wait for the last hour.

---

## 23. 3D Models & Assets to Source

Everything below is free, and mapped to what it's actually for. Prefer **glTF/.glb** where available — it's the standard for web 3D and loads efficiently via Three.js's `GLTFLoader`; OBJ is fine and often the only format NASA/mission sources provide, but plan to convert to glTF (Blender's free glTF export is a one-click step) before shipping it in the app.

### Celestial bodies (core scene)

| Asset | Source | Notes |
|---|---|---|
| Sun texture (emissive map) | Solar System Scope textures (solarsystemscope.com/textures) — CC BY 4.0 | Use as an emissive material on a plain sphere; layer a custom glow/corona shader on top for visual pop rather than relying on the texture alone. NASA's own interactive Sun 3D model (science.nasa.gov's Sun 3D Model page) is a good visual reference. |
| Earth day map, night-lights map, specular/cloud mask, normal map | Solar System Scope textures — CC BY 4.0 | This is the same texture set used by the widely-referenced Three.js Journey "Earth shaders" tutorial — a good implementation reference for day/night blending and cloud layering on a sphere. |
| Earth alternative/supplement imagery | NASA Blue Marble / Visible Earth, via NASA's Earth 3D Model page (science.nasa.gov) | Public domain; useful if you want higher-resolution or more scientifically literal Earth imagery than the stylized Solar System Scope version. |
| Starfield / Milky Way skybox | Solar System Scope 8K starfield and Milky Way panorama textures | Use as an equirectangular background sphere or `scene.background` in Three.js — this single texture does a lot of work for scene atmosphere. |
| Moon (optional, for scene context) | Solar System Scope Moon texture; NASA 3D Resources | Only needed if your 3D scene shows lunar distance as a reference scale. |

### Real, named asteroids (use actual shape models, not generic rocks)

For any object you feature that's a real, well-studied asteroid — anything currently on JPL's Sentry list that happens to have mission or radar data, or any object you use in a "featured examples" list — use its **actual mission-derived shape**, not a generic rock. This is a genuine, low-effort differentiator: a visibly lumpy, irregular, real shape (Bennu's spinning-top silhouette, Eros's elongated form) reads immediately as "real data," in a way a generic procedural rock doesn't.

| Object | Source | Format |
|---|---|---|
| Bennu | NASA OSIRIS-REx shape model files (asteroidmission.org — "Bennu Shape Model Files") — three resolutions available | OBJ / STL |
| Bennu (alternate, web-friendlier) | NASA Scientific Visualization Studio (svs.gsfc.nasa.gov) Bennu 3D models | OBJ **and glTF/glb** — prefer this one for direct Three.js use |
| Eros, Itokawa, Vesta | NASA 3D Resources hub (science.nasa.gov/3d-resources, mirrored at github.com/nasa/NASA-3D-Resources) | OBJ, various |
| Eros, Itokawa, Vesta, 67P/Churyumov-Gerasimenko, and others | **3D Asteroid Catalogue** (3d-asteroids.space) — shape models built from actual mission imagery (NEAR-Shoemaker, Hayabusa, Rosetta) and radar observations | OBJ / PLY |

### Generic asteroids (for the thousands of NEOs with no published shape model)

Most near-Earth objects have never been imaged up close and have no real shape model — for these, don't spend time hunting individual free models one by one:

- **Procedurally generate** irregular rock meshes in Three.js (a displaced icosahedron using simplex/Perlin noise is the standard technique) — this also lets you vary shape by the object's actual estimated diameter and rotation period from NeoWs/SBDB data, which is more honest than implying a specific shape you don't actually know.
- Supplement with **3–5 free generic asteroid/rock models** for surface texture and normal-map variety, sourced from Sketchfab (filter results to "downloadable" and a permissive CC license) or CGTrader's free section — use these as texture/detail references for your procedural generator rather than as literal 1:1 stand-ins for real objects.

### Not models — build these procedurally instead

Orbit paths, the Monte Carlo trajectory "cloud," and risk-gauge 3D chrome should be **drawn programmatically** from your own propagation output (Three.js `Line`, `Points`, or instanced geometry), not imported as static assets. This is both easier than sourcing yet more models and more visually convincing, since it's literally rendering your live simulation data rather than decoration.

### Stretch: spacecraft (optional, for context or a "historical mode" stretch goal)

NASA's 3D Resources hub includes several real spacecraft models (OSIRIS-REx, DART, Juno, and others) — useful only if you build the "historical mode" stretch goal from Section 11, e.g., visualizing the DART mission's impact on Dimorphos for context.

### Licensing notes

- NASA content (imagery, 3D models) is public domain / free to use per NASA's media usage guidelines — safe to use without attribution, though crediting NASA/JPL in your README and app footer is good practice regardless.
- Solar System Scope textures are **CC BY 4.0** — attribution is technically required; add a line crediting them in your app footer and README credits section.
- Third-party Sketchfab/CGTrader uploads vary in license — check each individual model's license before use, even in the "free" sections.

---

## 24. Design Language & UI/UX References

**Important framing first:** NASA's own **Eyes on Asteroids** (eyes.nasa.gov/apps/asteroids) is, functionally, extremely close to what you're building — a real-time 3D visualization of every known NEO's orbit, built by JPL for exactly this problem space. It's genuinely worth studying, but copying its look would work against you for two reasons: (1) judges evaluating "Innovation" may well know it exists, since it's the field's own reference implementation, and a visual near-clone reads as derivative rather than original; and (2) it's built as a general-purpose orbit explorer, not a risk-communication tool — its interaction design isn't actually optimized for the "should I be worried about this" decision your product is built to answer. Study it for what it gets right about making orbital motion legible in 3D, then deliberately diverge in visual identity and information hierarchy.

### References worth studying (and what to take from each — not copy)

| Reference | What to study |
|---|---|
| **NASA Eyes on Asteroids / Eyes on the Solar System** (eyes.nasa.gov) | How they make orbital motion legible in 3D — camera framing, time-scrubbing controls, click-to-focus interaction. Don't reuse their color palette or layout directly. |
| **Linear** (linear.app) | Restraint as a design principle — near-black surfaces, muted borders, one disciplined accent color doing all the work. If your dashboard ever starts feeling cluttered, this is the reference for cutting it back. |
| **Supabase** (supabase.com) | Dark surfaces plus strong typographic hierarchy plus one disciplined accent color (their green) — a clean model for a data-heavy dark UI that still feels calm rather than noisy. |
| **PostHog** (posthog.com) | Data density done right — real analytics packed into a dark UI while every chart stays legible. Good specific reference for your risk dashboard panel. |
| **Stripe** (stripe.com) | Best-in-class use of subtle gradients, precise typography, and restrained motion to make a technical product feel premium rather than "hackathon demo." |
| **Flightradar24-style live tracking UIs** | Not for visual style, but for interaction pattern — dense, live, real-time tracking interfaces that non-experts still navigate confidently. Useful for your "quick-select watch list" and live readouts. |
| **Awwwards Data Visualization collection** (awwwards.com/websites/data-visualization) | Browse for 15–20 minutes for typography and motion ideas — treat as a mood board, not a template to lift from. |

### Recommended distinct direction for this project

So the final product reads as neither "NASA Eyes reskin" nor "generic dark SaaS dashboard template":

- **Concept:** "mission control meets data journalism" — closer in spirit to a well-produced interactive news explainer than to a NASA engineering tool or a generic admin panel. The AI Mission Brief panel should feel like the centerpiece of the product, not a chatbot bolted onto a chart dashboard.
- **Color:** a genuinely dark, near-black background — not the navy-blue-black that's the default "space app" cliché. Reserve the Torino-scale color language (white/green/yellow/orange/red) **exclusively** for risk-state indicators, so those colors stay meaningful and are never diluted by decorative reuse elsewhere. Pick one distinct accent color for everything else (links, buttons, the Insight Score gauge) that isn't the expected "sci-fi cyan" — a warm amber or a muted violet will visually separate this from most other space-themed hackathon submissions in the room.
- **Typography:** pair a technical/monospace font for numbers and data labels (reinforcing scientific credibility) with a warm, readable serif or humanist sans for the AI-generated narrative brief text. That contrast visually signals "this is the translated, human part" vs. "this is the raw data part" — reinforcing your core product idea through typography itself, not just through copy.
- **Motion:** reserve animation for things that are genuinely live/data-driven (the orbit propagating, the Monte Carlo cloud resolving, the risk gauge ticking into place) rather than decorative page transitions — this keeps the "wow" concentrated on the moments that matter for the demo video instead of spread thin everywhere.
- **The 3D view is a supporting character, not the whole screen.** A common failure mode in space-themed hackathon UIs is a full-bleed 3D scene with a small floating panel on top — visually striking for five seconds, hard to actually use. Give the risk dashboard and AI brief real, stable screen real estate alongside the 3D view, rather than layering everything over it.

---

## 25. Appendix: Resources & Links

**Challenge & platform**
- Challenge platform: BeMyApp AI Builders Challenge with IBM Bob
- Discord community: linked from the challenge platform's "Join the Discord Community" step
- IBM SkillsBuild learning activities: linked from the challenge Resources section

**NASA / JPL data**
- NASA API portal (get your key): https://api.nasa.gov
- NeoWs documentation: https://api.nasa.gov (Asteroids - NeoWs section)
- JPL Small-Body Database API: https://ssd-api.jpl.nasa.gov/doc/sbdb.html
- JPL Close-Approach Data API: https://ssd-api.jpl.nasa.gov/doc/cad.html
- JPL Sentry API: https://ssd-api.jpl.nasa.gov/doc/sentry.html
- CNEOS Sentry risk table (human-readable): https://cneos.jpl.nasa.gov/sentry/
- JPL Horizons (optional, high-precision ephemerides): https://ssd.jpl.nasa.gov/horizons/

**IBM tools**
- IBM Bob: https://www.ibm.com/products/ai-coding-agent
- IBM watsonx.ai developer hub: https://www.ibm.com/watsonx/developer/
- IBM Granite community (recipes, notebooks): https://github.com/ibm-granite-community

**Orbital mechanics libraries**
- hapsira (maintained poliastro fork): https://github.com/pleiszenburg/hapsira
- skyfield: https://rhodesmill.org/skyfield/

**3D models & textures**
- Solar System Scope free textures (Sun, planets, starfield): https://www.solarsystemscope.com/textures/
- NASA 3D Resources hub: https://science.nasa.gov/3d-resources/ (mirrored at https://github.com/nasa/NASA-3D-Resources)
- 3D Asteroid Catalogue (real mission/radar-derived asteroid shapes): https://3d-asteroids.space/
- NASA OSIRIS-REx Bennu shape models: https://www.asteroidmission.org/updated-bennu-shape-model-3d-files/
- NASA SVS Bennu 3D models (OBJ/glTF): https://svs.gsfc.nasa.gov/5069

**Design references**
- NASA Eyes on Asteroids: https://eyes.nasa.gov/apps/asteroids/
- Awwwards Data Visualization collection: https://www.awwwards.com/websites/data-visualization/

**Scientific background**
- Torino Scale: general public-facing hazard classification for NEOs
- Palermo Technical Impact Hazard Scale: technical/comparative hazard classification for NEOs
- Earth Impact Effects Program methodology — Collins, G.S., Melosh, H.J., and Marcus, R.A. (2005), *"Earth Impact Effects Program: A Web-based computer program for calculating the regional environmental consequences of a meteoroid impact on Earth,"* Meteoritics & Planetary Science, 40: 817–840.

---

*This plan is designed to be a living document — check off sections as you complete them, and revisit Section 20 (Risks) weekly to catch blockers early. Good luck.*
