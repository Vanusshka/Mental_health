"""
Pydantic models for the dynamic questionnaire endpoint.
"""

from pydantic import BaseModel, Field
from typing import List


class EmotionInput(BaseModel):
    """A single emotion label + confidence score from the RoBERTa analysis."""
    label: str = Field(..., example="sadness")
    score: float = Field(..., example=0.86)


class QuestionnaireRequest(BaseModel):
    """
    Input payload for POST /generate-questions.
    Combines the original user text with the detected emotions so Gemini
    can craft contextually relevant follow-up questions.
    """
    text: str = Field(
        ...,
        min_length=1,
        example="I feel lonely and emotionally exhausted",
        description="The user's original free-form emotional text.",
    )
    emotions: List[EmotionInput] = Field(
        ...,
        min_length=1,
        description="Top emotions detected by the RoBERTa model.",
    )


class QuestionnaireResponse(BaseModel):
    """Response payload — a list of empathetic follow-up questions."""
    questions: List[str] = Field(
        ...,
        description="Dynamically generated empathetic questions from Gemini.",
    )
