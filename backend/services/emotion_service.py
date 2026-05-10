"""
Emotion Analysis Service
------------------------
Loads the pretrained RoBERTa model (SamLowe/roberta-base-go_emotions) ONCE
at startup and exposes a single function to run inference.

Model: https://huggingface.co/SamLowe/roberta-base-go_emotions
Task : Text classification → 28 emotion labels
"""

from transformers import pipeline
from typing import List, Dict
import logging

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Model is loaded once when this module is first imported.
# Using a module-level variable avoids reloading on every request.
# ---------------------------------------------------------------------------
_emotion_pipeline = None


def load_model() -> None:
    """
    Initialise the HuggingFace pipeline.
    Called explicitly from the FastAPI lifespan / startup event so the
    heavy download happens before the first request arrives.
    """
    global _emotion_pipeline
    if _emotion_pipeline is None:
        logger.info("Loading emotion model: SamLowe/roberta-base-go_emotions …")
        _emotion_pipeline = pipeline(
            task="text-classification",
            model="SamLowe/roberta-base-go_emotions",
            top_k=None,          # return scores for ALL labels
            truncation=True,     # silently truncate inputs > 512 tokens
        )
        logger.info("Emotion model loaded successfully.")


def analyze_emotions(text: str, top_n: int = 5) -> List[Dict[str, float]]:
    """
    Run emotion inference on the provided text.

    Args:
        text:  The user's free-form input string.
        top_n: How many top emotions to return (default 5).

    Returns:
        A list of dicts sorted by score descending, e.g.:
        [{"label": "sadness", "score": 0.91}, ...]
    """
    if _emotion_pipeline is None:
        # Lazy-load as a fallback (e.g. during unit tests)
        load_model()

    # The pipeline returns a list-of-lists when top_k=None
    raw: List[List[Dict]] = _emotion_pipeline(text)
    all_emotions: List[Dict] = raw[0]  # first (and only) input

    # Sort by score descending and take the top N
    sorted_emotions = sorted(all_emotions, key=lambda x: x["score"], reverse=True)
    return [{"label": e["label"], "score": round(e["score"], 4)} for e in sorted_emotions[:top_n]]
