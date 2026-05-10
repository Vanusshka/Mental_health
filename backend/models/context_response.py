"""
Pydantic models for the context-aware emotional response endpoint.
"""

from pydantic import BaseModel, Field
from typing import Literal


class ContextResponseRequest(BaseModel):
    """
    Input for POST /generate-response.
    Combines the user's mood selection with their personal context text.
    """
    mood: Literal["happy", "neutral"] = Field(
        ...,
        description="The user's selected mood — happy or neutral.",
    )
    context_text: str = Field(
        ...,
        min_length=3,
        example="I was blessed with a baby boy and also received a hike at work.",
        description="The user's free-form description of what is behind their mood.",
    )


class ContextResponseResult(BaseModel):
    """Response payload — a warm, contextual Gemini-generated message."""
    message: str = Field(
        ...,
        description="A personalised, context-aware emotional response.",
    )
    suggestions: list[str] = Field(
        default_factory=list,
        description="2–4 contextually relevant wellness suggestions.",
    )
