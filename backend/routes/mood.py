"""
Mood Analysis Route
-------------------
POST /analyze-mood
Accepts free-form text and returns the top detected emotions with
confidence scores using the pretrained RoBERTa model.
"""

from fastapi import APIRouter, HTTPException
from models.mood import MoodRequest, MoodResponse, EmotionScore
from services.emotion_service import analyze_emotions
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("", response_model=MoodResponse)
async def analyze_mood(payload: MoodRequest):
    """
    Analyse the emotional content of the provided text.

    - **text**: A sentence or paragraph describing the user's feelings.

    Returns the top 5 detected emotions sorted by confidence score.
    """
    try:
        results = analyze_emotions(payload.text)
        emotions = [EmotionScore(label=e["label"], score=e["score"]) for e in results]
        return MoodResponse(emotions=emotions)

    except Exception as exc:
        logger.exception("Emotion analysis failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Emotion analysis failed. Please try again later.",
        )
