import os, json, logging, re
from typing import List, Dict
logger = logging.getLogger(__name__)

_MODEL_CASCADE = ["gemini-2.5-flash-lite","gemini-2.5-flash","gemini-2.0-flash-lite","gemini-2.0-flash"]
_client = None

FALLBACK_QUESTIONS = {
    "sadness":     ["How long have you been feeling this way?","Is there someone you trust you can talk to?","What usually helps you feel a little better?"],
    "nervousness": ["What feels most overwhelming right now?","Have you been getting enough rest lately?","What would help you feel safer in this moment?"],
    "anger":       ["What triggered these feelings today?","How is this affecting your daily routine?","What would help you release some of this tension?"],
    "joy":         ["What made today feel so positive?","How can you carry this energy forward?","Who would you like to share this feeling with?"],
    "neutral":     ["What's been on your mind most today?","How has your energy been lately?","Is there anything you'd like to feel differently about?"],
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

async def generate_questions(user_text: str, emotions: List[Dict], previous_answers: List[Dict] = None) -> List[str]:
    client = _get_client()
    dominant = emotions[0]["label"] if emotions else "default"

    if client is None:
        logger.info("No Gemini key — using fallback questions")
        return FALLBACK_QUESTIONS.get(dominant, FALLBACK_QUESTIONS["default"])

    from google.genai import types
    from google.genai.errors import ClientError

    # Build context from previous answers to make questions adaptive
    prev_context = ""
    if previous_answers:
        prev_context = "\nPrevious responses:\n" + "\n".join(
            f"  Q: {a.get('question','')} → A: {a.get('answer','')}"
            for a in previous_answers[:3]
        )

    prompt = f"""You are a compassionate emotional wellness guide. Generate 3 adaptive follow-up questions.

User's message: "{user_text}"
Dominant emotion: {dominant} ({round(emotions[0].get('score',0)*100)}% confidence)
{prev_context}

Rules:
- Questions must feel human, warm, and conversational
- Adapt based on what the user already shared (avoid repeating themes)
- Do NOT assume severe distress — be curious, not clinical
- Keep each question under 20 words
- Cover different dimensions: duration, support, daily impact
- For sad/low mood: be gentle and exploratory, not alarming
- For happy/neutral: be encouraging and reflective

JSON only: {{"questions":["...","...","..."]}}"""

    for model in _MODEL_CASCADE:
        try:
            response = client.models.generate_content(model=model, contents=prompt,
                config=types.GenerateContentConfig(temperature=0.75, max_output_tokens=300, response_mime_type="application/json"))
            clean = re.sub(r"^```(?:json)?\s*|\s*```$","",response.text.strip(),flags=re.MULTILINE).strip()
            data = json.loads(clean)
            qs = data.get("questions",[])
            if qs and isinstance(qs, list) and len(qs) >= 3:
                return [str(q) for q in qs[:3]]
        except Exception as exc:
            status = getattr(exc,"status_code",500)
            if status == 429:
                continue
            break
    return FALLBACK_QUESTIONS.get(dominant, FALLBACK_QUESTIONS["default"])
