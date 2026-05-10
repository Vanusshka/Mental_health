import logging
logger = logging.getLogger(__name__)
_use_fallback = True
_emotion_pipeline = None

FALLBACK_EMOTIONS = {
    "happy":   [{"label":"joy","score":0.82},{"label":"optimism","score":0.10},{"label":"excitement","score":0.05},{"label":"gratitude","score":0.02},{"label":"love","score":0.01}],
    "sad":     [{"label":"sadness","score":0.78},{"label":"disappointment","score":0.12},{"label":"grief","score":0.06},{"label":"remorse","score":0.03},{"label":"fear","score":0.01}],
    "neutral": [{"label":"neutral","score":0.65},{"label":"approval","score":0.15},{"label":"realization","score":0.10},{"label":"curiosity","score":0.07},{"label":"caring","score":0.03}],
    "stress":  [{"label":"nervousness","score":0.70},{"label":"fear","score":0.15},{"label":"sadness","score":0.10},{"label":"anger","score":0.03},{"label":"annoyance","score":0.02}],
}

def load_model():
    logger.info("Using fast rule-based emotion fallback.")

def analyze_emotions(text: str, top_n: int = 5):
    t = text.lower()
    if any(w in t for w in ["happy","great","good","joy","excited","wonderful","amazing","love","grateful"]):
        return FALLBACK_EMOTIONS["happy"][:top_n]
    elif any(w in t for w in ["sad","depressed","unhappy","cry","grief","lonely","hopeless","down","low"]):
        return FALLBACK_EMOTIONS["sad"][:top_n]
    elif any(w in t for w in ["stress","anxious","worried","nervous","overwhelm","burnout","tired","exhaust"]):
        return FALLBACK_EMOTIONS["stress"][:top_n]
    return FALLBACK_EMOTIONS["neutral"][:top_n]
