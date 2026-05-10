"""
Context-Aware Emotional Response Service
-----------------------------------------
Uses Gemini to generate a warm, personalised response based on:
  - The user's mood (happy / neutral)
  - The user's own description of what is behind that mood

Model cascade: tries models in order until one succeeds.
Handles 429 quota exhaustion gracefully.
"""

import os
import json
import logging
import re
from typing import Dict

from google import genai
from google.genai import types
from google.genai.errors import ClientError

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model cascade — ordered by preference, falls back on 429
# ---------------------------------------------------------------------------
_MODEL_CASCADE = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-2.0-flash-lite",
    "gemini-2.0-flash",
]

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key or api_key == "your_gemini_api_key_here":
            raise ValueError(
                "GEMINI_API_KEY is not set. Add your key to backend/.env and restart."
            )
        _client = genai.Client(api_key=api_key)
        logger.info("Gemini client initialised for context responses.")
    return _client


def _build_happy_prompt(context_text: str) -> str:
    return f"""You are a warm, emotionally intelligent wellness guide — not a chatbot.

A user has selected "Happy" and shared what is making them feel this way:
"{context_text}"

Your task: Write a single, deeply personalised emotional response that:
1. Acknowledges and celebrates the SPECIFIC things they mentioned (people, events, achievements, moments)
2. Reflects genuine warmth and human understanding — not generic positivity
3. Offers a heartfelt wish or blessing for their continued happiness
4. Feels like it was written specifically for them, not a template

Then provide 3 short, contextually relevant suggestions for sustaining and building on this happiness.
Each suggestion should relate directly to what they shared — not generic wellness tips.

Rules:
- Reference their actual words and situations specifically
- Sound warm, human, and celebratory — never clinical or robotic
- Keep the main message to 2–3 sentences maximum
- Keep each suggestion to 1 sentence
- Do NOT use phrases like "I understand" or "As an AI"
- Do NOT ask follow-up questions

Respond ONLY with valid JSON, no markdown:
{{
  "message": "Your personalised celebratory response here.",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}}"""


def _build_neutral_prompt(context_text: str) -> str:
    return f"""You are a warm, emotionally intelligent wellness guide — not a chatbot.

A user has selected "Neutral / Okay" and shared what their current emotional state is about:
"{context_text}"

Your task: Write a single, deeply personalised wellness response that:
1. Acknowledges the SPECIFIC patterns, situations, or feelings they described
2. Validates their experience with genuine care and understanding
3. Gently reframes their situation with a hopeful, supportive perspective
4. Feels like it was written specifically for them, not a template

Then provide 3 short, contextually relevant wellness suggestions that directly address
what they shared — not generic tips.

Rules:
- Reference their actual words and situations specifically
- Sound caring, supportive, and motivating — never clinical or alarming
- Keep the main message to 2–3 sentences maximum
- Keep each suggestion to 1 sentence, directly relevant to their context
- Do NOT use phrases like "I understand" or "As an AI"
- Do NOT ask follow-up questions

Respond ONLY with valid JSON, no markdown:
{{
  "message": "Your personalised supportive response here.",
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"]
}}"""


async def generate_context_response(mood: str, context_text: str) -> Dict:
    """
    Generate a context-aware emotional response for happy or neutral users.
    Tries models in cascade order to handle quota exhaustion.
    Returns a dict with 'message' and 'suggestions' keys.
    """
    client = _get_client()
    prompt = _build_happy_prompt(context_text) if mood == "happy" else _build_neutral_prompt(context_text)
    last_error: Exception | None = None

    for model in _MODEL_CASCADE:
        try:
            logger.info("Trying model %s for context response (mood=%s)", model, mood)
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.8,
                    max_output_tokens=2048,
                    response_mime_type="application/json",
                ),
            )
            raw_text = response.text.strip()
            clean = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text, flags=re.MULTILINE).strip()
            data = json.loads(clean)
            message = str(data.get("message", "")).strip()
            suggestions = [str(s).strip() for s in data.get("suggestions", [])[:4]]
            if not message:
                raise ValueError("'message' key missing or empty.")
            logger.info("Context response generated with model %s", model)
            return {"message": message, "suggestions": suggestions}

        except ClientError as exc:
            status = getattr(exc, "status_code", 500)
            if status == 429:
                logger.warning("Model %s quota exhausted, trying next…", model)
                last_error = exc
                continue
            raise

        except (json.JSONDecodeError, ValueError) as exc:
            logger.error("Parse error from model %s: %s", model, exc)
            raise RuntimeError(f"Gemini returned an unexpected format: {exc}") from exc

    raise ClientError(429, {"error": {"message": "All Gemini models are rate-limited. Please try again in a few minutes."}}, None) from last_error  # type: ignore[arg-type]
