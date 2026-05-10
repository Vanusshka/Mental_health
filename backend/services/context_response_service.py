import os, json, logging, re
from typing import Dict
logger = logging.getLogger(__name__)

_MODEL_CASCADE = ["gemini-2.5-flash-lite","gemini-2.5-flash","gemini-2.0-flash-lite","gemini-2.0-flash"]
_client = None

HAPPY_FALLBACKS = [
    "That sounds genuinely wonderful! The joy you are feeling right now is real and well-deserved. Hold onto this feeling and let it fuel everything you do today.",
    "What a beautiful thing to be feeling! Your happiness is contagious and the world is brighter because of it. Keep nurturing what brings you this light.",
    "This is exactly the kind of energy that creates momentum in life. You are in a great space right now — use it to connect, create, and celebrate.",
]
NEUTRAL_FALLBACKS = [
    "A balanced, steady state is actually a powerful place to be. You have clarity and calm on your side right now — that is a real strength.",
    "Feeling okay is perfectly valid. Sometimes the most important thing is simply showing up, and you are doing exactly that.",
    "Steadiness is underrated. You are grounded right now, and that gives you the foundation to move forward with intention.",
]
HAPPY_SUGGESTIONS = [
    ["Share your positive energy with someone who needs it today", "Channel this momentum into a goal you have been putting off", "Write down what made today feel good — it will help you recreate it"],
    ["Celebrate this moment fully — you deserve it", "Use this energy to reach out to someone you care about", "Start something creative while your mind is in this bright space"],
]
NEUTRAL_SUGGESTIONS = [
    ["Take 5 minutes for a mindful walk to refresh your perspective", "Write down one thing you are looking forward to this week", "Do one small thing today that is just for you"],
    ["Try a short breathing exercise to deepen your sense of calm", "Reach out to a friend — connection can shift your energy positively", "Set one clear intention for the rest of your day"],
]

def _get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GEMINI_API_KEY","")
        if not api_key or api_key in ("your_gemini_api_key_here","demo_key",""):
            return None
        try:
            from google import genai
            _client = genai.Client(api_key=api_key)
        except Exception:
            return None
    return _client

def _fallback(mood: str, context_text: str) -> Dict:
    import random
    if mood == "happy":
        msg = random.choice(HAPPY_FALLBACKS)
        sug = random.choice(HAPPY_SUGGESTIONS)
    else:
        msg = random.choice(NEUTRAL_FALLBACKS)
        sug = random.choice(NEUTRAL_SUGGESTIONS)
    # Personalise slightly with their words
    words = [w for w in context_text.split() if len(w) > 4][:3]
    if words:
        msg = msg + f" What you shared about {', '.join(words[:2])} really resonates."
    return {"message": msg, "suggestions": sug}

async def generate_context_response(mood: str, context_text: str) -> Dict:
    client = _get_client()
    if client is None:
        logger.info("No Gemini key — using fallback response")
        return _fallback(mood, context_text)
    
    from google.genai import types
    from google.genai.errors import ClientError
    prompt = f"""You are a warm wellness guide. User mood: {mood}. They said: "{context_text}"
Write a 2-sentence personalised response and 3 short suggestions.
JSON only: {{"message":"...","suggestions":["...","...","..."]}}"""
    
    for model in _MODEL_CASCADE:
        try:
            response = client.models.generate_content(model=model, contents=prompt,
                config=types.GenerateContentConfig(temperature=0.8, max_output_tokens=512, response_mime_type="application/json"))
            clean = re.sub(r"^```(?:json)?\s*|\s*```$","",response.text.strip(),flags=re.MULTILINE).strip()
            data = json.loads(clean)
            if data.get("message"):
                return {"message": str(data["message"]), "suggestions": [str(s) for s in data.get("suggestions",[])[:3]]}
        except Exception as exc:
            status = getattr(exc,"status_code",500)
            if status == 429:
                continue
            break
    return _fallback(mood, context_text)
