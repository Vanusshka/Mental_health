import os, json, logging, re
from typing import List, Dict
logger = logging.getLogger(__name__)

_MODEL_CASCADE = ["gemini-2.5-flash-lite","gemini-2.5-flash","gemini-2.0-flash-lite","gemini-2.0-flash"]
_client = None

FALLBACK_QUESTIONS = {
    "sadness":     [
        "Little interest or pleasure in doing things you usually enjoy — how often has this happened?",
        "Trouble falling or staying asleep, or feeling tired — how many days this week?",
        "How difficult have these feelings made daily tasks like work or home life?",
    ],
    "nervousness": [
        "Feeling nervous, anxious, or on edge — how often over the past few days?",
        "Not being able to stop or control worrying — does this feel like several days or nearly every day?",
        "How much have these feelings affected your ability to focus or get things done?",
    ],
    "anger":       [
        "Becoming easily annoyed or irritable — how often has this been happening?",
        "How is this affecting your daily routine and relationships?",
        "What would help you feel more at ease right now?",
    ],
    "joy":         [
        "What was the highlight of your day that made you feel this way?",
        "How can you carry this positive energy into tomorrow?",
        "On a scale of 1 to 5, how much energy do you feel you have right now?",
    ],
    "neutral":     [
        "On a scale of 1 to 10, how would you rate your energy level today?",
        "How well did you connect with others today — not at all, a little, or well?",
        "What is one small step you could take tomorrow to feel even slightly better?",
    ],
    "default":     [
        "How many hours of sleep did you get last night, and how would you rate its quality?",
        "How would you describe your current stress level — very low, moderate, or very high?",
        "How difficult have your feelings made it to do your work or daily tasks this week?",
    ],
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
