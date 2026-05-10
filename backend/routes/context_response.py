"""
Context-Aware Emotional Response Route
----------------------------------------
POST /generate-response

Accepts the user's mood + their personal context text.
Returns a Gemini-generated, context-specific emotional response.
Used for happy and neutral users who share what is behind their mood.
"""

from fastapi import APIRouter, HTTPException
from models.context_response import ContextResponseRequest, ContextResponseResult
from services.context_response_service import generate_context_response
from google.genai.errors import ClientError
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=ContextResponseResult)
async def generate_emotional_response(payload: ContextResponseRequest):
    """
    Generate a warm, context-aware emotional response using Gemini.

    - **mood**: "happy" or "neutral"
    - **context_text**: The user's description of what is behind their mood.

    Returns a personalised message and contextual wellness suggestions.
    """
    try:
        result = await generate_context_response(payload.mood, payload.context_text)
        return ContextResponseResult(
            message=result["message"],
            suggestions=result["suggestions"],
        )

    except ValueError as exc:
        logger.warning("Gemini config error: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))

    except ClientError as exc:
        status = getattr(exc, "status_code", 500)
        if status == 429:
            raise HTTPException(
                status_code=429,
                detail="Gemini API rate limit reached across all models. The free tier daily quota has been exhausted. Please try again tomorrow.",
            )
        raise HTTPException(status_code=502, detail="AI service returned an error.")

    except RuntimeError as exc:
        raise HTTPException(status_code=502, detail="AI service returned an unexpected response.")

    except Exception as exc:
        logger.exception("Unexpected error in /generate-response: %s", exc)
        raise HTTPException(status_code=500, detail="Response generation failed.")
