"""
Pydantic models for mood analysis request and response payloads.
"""

from pydantic import BaseModel, Field
from typing import List


class MoodRequest(BaseModel):
    """Input payload for the /analyze-mood endpoint."""
    text: str = Field(
        ...,
        min_length=1,
        example="I feel lonely and exhausted lately",
        description="The user's text describing their current emotional state.",
    )


class EmotionScore(BaseModel):
    """A single detected emotion with its confidence score."""
    label: str = Field(..., example="sadness")
    score: float = Field(..., example=0.91)


class MoodResponse(BaseModel):
    """Response payload returned by the /analyze-mood endpoint."""
    emotions: List[EmotionScore]
