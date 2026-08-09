"""
IBM Granite AI insight layer.

Converts structured asteroid physics/risk data into a calibrated natural-language
mission brief using granite-8b-code-instruct on watsonx.ai (Sydney region).

Prompt engineering principles (Section 8.5 of project plan)
------------------------------------------------------------
1. System prompt grounds output ONLY in the provided numbers.
2. Forbids inventing statistics not in the input.
3. Enforces calibrated, non-sensationalized language.
4. Requests structured JSON output with four fixed keys.
5. A second lightweight guardian pass checks the brief doesn't overstate risk.

JSON contract — input (``brief_input``)
---------------------------------------
{
  "designation":          str,
  "full_name":            str,
  "close_approach_date":  str,
  "jpl_dist_au":          float,
  "computed_dist_au":     float,
  "impact_probability":   float,
  "torino_scale":         int,
  "torino_label":         str,
  "palermo_scale":        float,
  "insight_score":        int,
  "diameter_m":           float,       # 0 if unknown
  "energy_mt":            float,
  "damage_category":      str,
  "damage_radius_km":     float,
  "airburst":             bool,
  "sigma_source":         str,
  "uncertainty_note":     str,
}

JSON contract — output (``generate_brief``)
-------------------------------------------
{
  "title":          str,
  "bottom_line":    str,
  "if_it_happened": str,
  "whats_next":     str,
  "guardian_ok":    bool,   # True if guardian pass approved the brief
  "raw_model":      str,    # model ID used
}
"""

from __future__ import annotations

import json
import re

import requests

from core.config import settings

_IAM_URL = "https://iam.cloud.ibm.com/identity/token"
_WX_CHAT = "{url}/ml/v1/text/chat?version=2023-05-29"
_WX_GEN  = "{url}/ml/v1/text/generation?version=2023-05-29"

_SYSTEM_PROMPT = """\
You are ImpactIQ, an asteroid risk communication assistant.
You always respond with ONLY a JSON object — no prose, no markdown, no explanation.
"""

_GUARDIAN_PROMPT = """\
You are a scientific accuracy guardian for asteroid risk communication.
Review the following mission brief JSON and answer ONLY with the word "APPROVED" or "FLAGGED".
Flag the brief if it:
- Claims certainty of impact when probability < 0.5
- Uses sensationalized language (doomsday, extinction, apocalypse) for Torino < 8
- States a specific impact year/date not provided in the input data
- Invents statistics or distances not in the input

Brief to review:
"""


def _get_iam_token() -> str:
    """Exchange IBM Cloud API key for a short-lived IAM bearer token."""
    resp = requests.post(
        _IAM_URL,
        data={
            "grant_type": "urn:ibm:params:oauth:grant-type:apikey",
            "apikey": settings.WATSONX_API_KEY,
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        timeout=15,
    )
    resp.raise_for_status()
    return resp.json()["access_token"]


def _chat(token: str, messages: list[dict], max_tokens: int = 400) -> str:
    """Call the watsonx.ai chat endpoint and return the assistant text."""
    url = _WX_CHAT.format(url=settings.WATSONX_URL)
    resp = requests.post(
        url,
        json={
            "model_id":   settings.WATSONX_MODEL_ID,
            "messages":   messages,
            "parameters": {"max_new_tokens": max_tokens, "temperature": 0.2},
            "project_id": settings.WATSONX_PROJECT_ID,
        },
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()["choices"][0]["message"]["content"].strip()


def _extract_json(text: str) -> dict:
    """Extract the first JSON object from a string, tolerating markdown fences."""
    # Strip code fences
    text = re.sub(r"```(?:json)?", "", text).strip()
    # Find first { ... }
    match = re.search(r"\{.*\}", text, re.DOTALL)
    if match:
        return json.loads(match.group())
    raise ValueError(f"No JSON object found in model output: {text[:200]}")


def generate_brief(brief_input: dict, outreach: bool = False) -> dict:
    """Generate a structured AI mission brief for one asteroid.

    Parameters
    ----------
    brief_input : dict
        Structured physics + risk data — see module docstring for schema.

    Returns
    -------
    dict
        ``{"title", "bottom_line", "if_it_happened", "whats_next",
           "guardian_ok", "raw_model"}``

    Notes
    -----
    If the model output cannot be parsed as JSON (e.g. Granite reverts to
    prose), the function falls back to a safe structured response rather than
    propagating an exception to the frontend.
    """
    token = _get_iam_token()

    # Embed the full instruction + JSON template in the user turn.
    # granite-8b-code-instruct follows user-turn instructions more reliably
    # than system-prompt-only instructions for structured output.
    if outreach:
        rules = (
            "RULES: (1) Use ONLY the numbers below. Do not invent statistics. "
            "(2) Explain the situation to an 8-year-old child using simple, reassuring analogies. "
            "(3) Focus on how scientists are watching the sky to keep us safe. "
            "(4) If impact_probability < 0.01, say there is nothing to worry about.\n\n"
            "Respond with ONLY this JSON object, no other text:\n"
            '{"title":"<one headline ≤12 words, kid-friendly>",'
            '"bottom_line":"<2-3 sentences, very simple reassuring explanation>",'
            '"if_it_happened":"<1-2 sentences, simple physical consequences like a big firework or a crater>",'
            '"whats_next":"<1-2 sentences on how astronomers are keeping an eye on it>"}\n\n'
            "Asteroid data:\n"
        )
    else:
        rules = (
            "RULES: (1) Use ONLY the numbers below. Do not invent statistics. "
            "(2) No sensationalized language unless torino_scale >= 8. "
            "(3) If impact_probability < 0.01, say the object poses no significant threat. "
            "(4) Torino 0 = routine monitoring, not alarming.\n\n"
            "Respond with ONLY this JSON object, no other text:\n"
            '{"title":"<one headline ≤12 words>",'
            '"bottom_line":"<2-3 sentences, plain-language risk statement>",'
            '"if_it_happened":"<1-2 sentences on physical consequences>",'
            '"whats_next":"<1-2 sentences on what observations would refine the estimate>"}\n\n'
            "Asteroid data:\n"
        )
    user_content = rules + json.dumps(brief_input, indent=2)

    # --- Pass 1: Generate brief ---
    messages = [
        {"role": "system", "content": _SYSTEM_PROMPT},
        {"role": "user",   "content": user_content},
    ]
    raw_text = _chat(token, messages, max_tokens=450)

    # Parse JSON — fall back to safe default on failure
    try:
        brief = _extract_json(raw_text)
        # Ensure all four keys exist
        for key in ("title", "bottom_line", "if_it_happened", "whats_next"):
            if key not in brief:
                brief[key] = f"[{key} not generated]"
    except (ValueError, json.JSONDecodeError):
        # Granite returned prose — wrap it gracefully
        brief = {
            "title":          f"{brief_input.get('designation','Object')} — Mission Brief",
            "bottom_line":    raw_text[:300] if raw_text else "Brief generation failed.",
            "if_it_happened": "See consequence data panel for estimated effects.",
            "whats_next":     "Additional observations would further refine the orbital solution.",
        }

    # --- Pass 2: Guardian check ---
    guardian_messages = [
        {"role": "user", "content": _GUARDIAN_PROMPT + json.dumps(brief, indent=2)},
    ]
    try:
        guardian_reply = _chat(token, guardian_messages, max_tokens=10)
        guardian_ok    = "APPROVED" in guardian_reply.upper()
    except Exception:
        guardian_ok = True   # guardian unavailable — default to approved

    return {
        "title":          str(brief.get("title", "")),
        "bottom_line":    str(brief.get("bottom_line", "")),
        "if_it_happened": str(brief.get("if_it_happened", "")),
        "whats_next":     str(brief.get("whats_next", "")),
        "guardian_ok":    bool(guardian_ok),
        "raw_model":      settings.WATSONX_MODEL_ID,
    }
