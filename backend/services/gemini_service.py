import os, json, logging, re
from typing import List, Dict
logger = logging.getLogger(__name__)

_MODEL_CASCADE = ["gemini-2.5-flash-lite","gemini-2.5-flash","gemini-2.0-flash-lite","gemini-2.0-flash"]
_client = None

FALLBACK_QUESTIONS = {
    "sadness":     ["How long have you been feeling this way?","Is there someone you trust that you can talk to about this?","What is one small thing that usually brings you comfort?"],
    "nervousness": ["What feels most overwhelming to you right now?","Have you been able to get enough rest lately?","What would help you feel a little safer in this moment?"],
    "anger":       ["What triggered these feelings today?","How is this affecting your daily routine?","What would help you release some of this tension?"],
    "joy":         ["What made today feel so positive?","How can you carry this energy forward?","Who would you like to share this feeling with?"],
    "default":     ["How long have you been experiencing these feelings?","How is this affecting your sleep and daily energy?","What kind of support would feel most helpful right now?"],
}

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

async def generate_questions(user_text: str, emotions: List[Dict]) -> List[str]:
    client = _get_client()
    dominant = emotions[0]["label"] if emotions else "default"
    
    if client is None:
        logger.info("No Gemini key — using fallback questions")
        return FALLBACK_QUESTIONS.get(dominant, FALLBACK_QUESTIONS["default"])
    
    from google.genai import types
    from google.genai.errors import ClientError
    prompt = f"""Compassionate wellness guide. User said: "{user_text}". Top emotion: {dominant}.
Generate exactly 3 short empathetic follow-up questions (under 20 words each).
JSON only: {{"questions":["...","...","..."]}}"""
    
    for model in _MODEL_CASCADE:
        try:
            response = client.models.generate_content(model=model, contents=prompt,
                config=types.GenerateContentConfig(temperature=0.7, max_output_tokens=256, response_mime_type="application/json"))
            clean = re.sub(r"^```(?:json)?\s*|\s*```$","",response.text.strip(),flags=re.MULTILINE).strip()
            data = json.loads(clean)
            qs = data.get("questions",[])
            if qs and isinstance(qs, list):
                return [str(q) for q in qs[:3]]
        except Exception as exc:
            status = getattr(exc,"status_code",500)
            if status == 429:
                continue
            break
    return FALLBACK_QUESTIONS.get(dominant, FALLBACK_QUESTIONS["default"])
