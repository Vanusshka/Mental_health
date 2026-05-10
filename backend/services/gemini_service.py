"""
Gemini Questionnaire Service
-----------------------------
Uses Google Gemini to generate empathetic, contextually aware follow-up
questions based on the user's text and detected emotions.

Model cascade: tries models in order until one succeeds.
Handles 429 quota exhaustion gracefully.
"""

import os
import json
import logging
import re
from typing import List, Dict

from google import genai
from google.genai import types
from google.genai.errors import ClientError

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model cascade — ordered by preference, falls back on 429
# ---------------------------------------------------------------------------
_MODEL_CASCADE = [
    "gemini-2.5-flash-lite",   # lightest quota usage — try first
    "gemini-2.5-flash",        # standard
    "gemini-2.0-flash-lite",   # older lite
    "gemini-2.0-flash",        # older standard
]

_client: genai.Client | None = None


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY", "")
        if not api_key or api_key == "your_gemini_api_key_here":
            raise ValueError(
                "GEMINI_API_KEY is not set. "
                "Add your key to backend/.env and restart the server."
            )
        _client = genai.Client(api_key=api_key)
        logger.info("Gemini client initialised.")
    return _client


def _build_prompt(user_text: str, emotions: List[Dict]) -> str:
    top_emotions = emotions[:3]
    emotion_lines = "\n".join(
        f"  - {e['label']} ({round(e['score'] * 100)}% confidence)"
        for e in top_emotions
    )
    dominant = top_emotions[0]["label"] if top_emotions else "unknown"
    intensity = top_emotions[0]["score"] if top_emotions else 0.5
    intensity_word = (
        "very strongly" if intensity > 0.75
        else "moderately" if intensity > 0.45
        else "mildly"
    )

    return f"""You are a compassionate mental wellness guide. A user has shared how they are feeling.

User's message: "{user_text}"

Detected emotions:
{emotion_lines}

The dominant emotion is "{dominant}", felt {intensity_word}.

Generate exactly 3 short, warm, empathetic follow-up questions to help the user reflect on their feelings.

Rules:
- Sound human and caring, never clinical
- Be specific to the user's words and emotions
- Do NOT diagnose or suggest medication
- One question per feeling: duration, support, daily impact
- Keep each question under 20 words

Respond ONLY with valid JSON, no markdown:
{{"questions": ["question 1", "question 2", "question 3"]}}"""


async def generate_questions(user_text: str, emotions: List[Dict]) -> List[str]:
    """
    Generate empathetic follow-up questions using Gemini.
    Tries models in cascade order to handle quota exhaustion.
    """
    client = _get_client()
    prompt = _build_prompt(user_text, emotions)
    last_error: Exception | None = None

    for model in _MODEL_CASCADE:
        try:
            logger.info("Trying model %s for questions", model)
            response = client.models.generate_content(
                model=model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    temperature=0.7,
                    max_output_tokens=1024,
                    response_mime_type="application/json",
                ),
            )
            raw_text = response.text.strip()
            clean = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw_text, flags=re.MULTILINE).strip()
            data = json.loads(clean)
            questions: List[str] = data.get("questions", [])
            if not questions or not isinstance(questions, list):
                raise ValueError("'questions' key missing or not a list.")
            logger.info("Questions generated successfully with model %s", model)
            return [str(q).strip() for q in questions[:3]]

        except ClientError as exc:
            status = getattr(exc, "status_code", 500)
            if status == 429:
                logger.warning("Model %s quota exhausted, trying next…", model)
                last_error = exc
                continue  # try next model
            raise  # non-quota error — propagate immediately

        except (json.JSONDecodeError, ValueError) as exc:
            logger.error("Parse error from model %s: %s", model, exc)
            raise RuntimeError(f"Gemini returned an unexpected format: {exc}") from exc

    # All models exhausted
    raise ClientError(429, {"error": {"message": "All Gemini models are rate-limited. Please try again in a few minutes."}}, None) from last_error  # type: ignore[arg-type]
