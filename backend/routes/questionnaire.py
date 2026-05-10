"""
Dynamic Questionnaire Route
----------------------------
POST /generate-questions

Accepts the user's emotional text + detected emotions, calls Gemini to
generate 3 empathetic follow-up questions, and returns them.
"""

from fastapi import APIRouter, HTTPException
from models.questionnaire import QuestionnaireRequest, QuestionnaireResponse
from services.gemini_service import generate_questions
from google.genai.errors import ClientError
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=QuestionnaireResponse)
async def generate_questionnaire(payload: QuestionnaireRequest):
    """
    Generate empathetic follow-up questions using Gemini AI.

    - **text**: The user's original emotional message.
    - **emotions**: Top emotions detected by the RoBERTa model.

    Returns 3 contextually relevant, empathetic questions.
    """
    try:
        emotions_dicts = [
            {"label": e.label, "score": e.score}
            for e in payload.emotions
        ]
        questions = await generate_questions(payload.text, emotions_dicts)
        return QuestionnaireResponse(questions=questions)

    except ValueError as exc:
        # Missing or invalid API key
        logger.warning("Gemini configuration error: %s", exc)
        raise HTTPException(status_code=503, detail=str(exc))

    except ClientError as exc:
        # Handle Gemini API errors — including 429 rate limits
        status = getattr(exc, "status_code", 500)
        if status == 429:
            logger.warning("Gemini rate limit hit (all models): %s", exc)
            raise HTTPException(
                status_code=429,
                detail="Gemini API rate limit reached across all models. The free tier daily quota (20 requests) has been exhausted. Please wait until tomorrow or upgrade your Gemini plan.",
            )
        logger.error("Gemini API error (%s): %s", status, exc)
        raise HTTPException(
            status_code=502,
            detail="AI service returned an error. Please try again.",
        )

    except RuntimeError as exc:
        # Unparseable Gemini response
        logger.error("Gemini response parsing error: %s", exc)
        raise HTTPException(
            status_code=502,
            detail="AI service returned an unexpected response. Please try again.",
        )

    except Exception as exc:
        logger.exception("Unexpected error in /generate-questions: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Question generation failed. Please try again later.",
        )
