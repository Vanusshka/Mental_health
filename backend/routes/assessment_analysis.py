"""
AI-Driven Assessment Analysis Route
POST /analyze-assessment

Takes mood + emotions + questionnaire answers → Gemini generates
a nuanced, personalized emotional wellness analysis.

This replaces the hardcoded "sad = elevated distress" logic.
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
import os, json, re, logging

logger = logging.getLogger(__name__)
router = APIRouter()

_MODEL_CASCADE = ["gemini-2.5-flash-lite","gemini-2.5-flash","gemini-2.0-flash-lite","gemini-2.0-flash"]
_client = None

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

class EmotionScore(BaseModel):
    label: str
    score: float

class QAItem(BaseModel):
    question: str
    answer: str

class AssessmentAnalysisRequest(BaseModel):
    mood: str  # happy / neutral / sad
    emotions: List[EmotionScore]
    answers: List[QAItem]
    reflection: Optional[str] = ""

class AssessmentAnalysisResponse(BaseModel):
    level: str          # elevated / moderate / mild / positive / reflective / recovering
    headline: str
    body: str
    indicators: List[str]
    wellness_score: int  # 0-100
    stress_score: int    # 0-100
    emotional_category: str  # e.g. "Mildly Stressed", "Emotionally Fatigued", etc.
    strengths: List[str]
    recommendations: List[str]
    ai_generated: bool

# ── Nuanced fallback analysis (no Gemini) ─────────────────────────────────

NUANCED_FALLBACKS = {
    "sad": {
        "mild": {
            "level": "mild",
            "headline": "Mild Emotional Heaviness Detected",
            "body": "Your responses suggest you're experiencing some emotional weight, but your overall patterns indicate resilience and self-awareness. This is a natural part of the emotional spectrum.",
            "indicators": ["Temporary low mood", "Emotional sensitivity", "Reflective state", "Underlying resilience present"],
            "wellness_score": 58, "stress_score": 45,
            "emotional_category": "Mildly Low",
            "strengths": ["Self-awareness", "Willingness to reflect", "Emotional honesty"],
            "recommendations": ["Gentle self-care today", "Connect with someone you trust", "Short mindfulness practice"],
        },
        "moderate": {
            "level": "moderate",
            "headline": "Moderate Emotional Strain Identified",
            "body": "Your responses indicate some emotional strain and fatigue. While not severe, these patterns suggest your emotional wellbeing would benefit from intentional care and support.",
            "indicators": ["Moderate stress indicators", "Some emotional depletion", "Need for recovery time", "Opportunity to strengthen coping"],
            "wellness_score": 45, "stress_score": 62,
            "emotional_category": "Emotionally Strained",
            "strengths": ["Seeking support", "Emotional awareness"],
            "recommendations": ["Rest and recovery", "Talk to someone trusted", "Reduce stressors where possible"],
        },
        "elevated": {
            "level": "elevated",
            "headline": "Elevated Emotional Distress Patterns",
            "body": "Your responses suggest significant emotional distress that would benefit from additional support. These patterns are common and manageable with the right guidance.",
            "indicators": ["Elevated distress signals", "Emotional exhaustion", "Possible isolation patterns", "Reduced resilience"],
            "wellness_score": 32, "stress_score": 78,
            "emotional_category": "Emotionally Overwhelmed",
            "strengths": ["Courage to seek help", "Self-awareness"],
            "recommendations": ["Consider speaking with a wellness professional", "Prioritize rest", "Reach out to support network"],
        },
    },
    "neutral": {
        "balanced": {
            "level": "positive",
            "headline": "Balanced Emotional State",
            "body": "Your responses reflect a steady, balanced emotional state. You're maintaining equilibrium and have good emotional awareness.",
            "indicators": ["Stable mood patterns", "Healthy emotional regulation", "Good self-awareness", "Balanced energy"],
            "wellness_score": 68, "stress_score": 38,
            "emotional_category": "Emotionally Balanced",
            "strengths": ["Emotional stability", "Self-regulation", "Mindfulness"],
            "recommendations": ["Maintain current wellness habits", "Continue self-reflection", "Build on positive patterns"],
        },
    },
    "happy": {
        "positive": {
            "level": "positive",
            "headline": "Positive Emotional Wellbeing",
            "body": "Your responses reflect a positive and energised emotional state. Your wellbeing indicators are strong and your resilience is evident.",
            "indicators": ["Positive emotional regulation", "Strong resilience", "Healthy energy levels", "Good social connection"],
            "wellness_score": 82, "stress_score": 22,
            "emotional_category": "Emotionally Thriving",
            "strengths": ["Positive outlook", "Emotional resilience", "Social connection", "Energy and motivation"],
            "recommendations": ["Channel energy into meaningful goals", "Share positivity with others", "Build resilience reserves"],
        },
    },
}

def _smart_fallback(mood: str, emotions: List[EmotionScore], answers: List[QAItem]) -> dict:
    """
    Nuanced fallback that analyzes answer content to determine severity.
    Does NOT default to elevated for sad mood.
    """
    # Analyze answer content for severity signals
    all_answers = " ".join(a.answer.lower() for a in answers)
    
    severe_signals = ["can't sleep", "cannot sleep", "hopeless", "worthless", "no point", "give up",
                      "can't function", "weeks", "months", "every day", "always", "never gets better",
                      "suicidal", "harm", "no one cares", "completely alone"]
    moderate_signals = ["tired", "exhausted", "stressed", "overwhelmed", "anxious", "worried",
                        "hard to focus", "not eating", "isolating", "few days", "this week"]
    mild_signals = ["little", "bit", "sometimes", "today", "lately", "not great", "okay-ish",
                    "manageable", "getting through", "fine mostly"]
    
    severe_count  = sum(1 for s in severe_signals  if s in all_answers)
    moderate_count = sum(1 for s in moderate_signals if s in all_answers)
    mild_count    = sum(1 for s in mild_signals    if s in all_answers)
    
    # Dominant emotion intensity
    dominant_score = emotions[0].score if emotions else 0.5
    
    if mood == "sad":
        if severe_count >= 2 or (dominant_score > 0.85 and severe_count >= 1):
            return NUANCED_FALLBACKS["sad"]["elevated"]
        elif moderate_count >= 2 or dominant_score > 0.7:
            return NUANCED_FALLBACKS["sad"]["moderate"]
        else:
            return NUANCED_FALLBACKS["sad"]["mild"]
    elif mood == "neutral":
        return NUANCED_FALLBACKS["neutral"]["balanced"]
    else:
        return NUANCED_FALLBACKS["happy"]["positive"]

def _build_analysis_prompt(mood: str, emotions: List[EmotionScore], answers: List[QAItem], reflection: str) -> str:
    emotion_lines = "\n".join(f"  - {e.label}: {round(e.score*100)}%" for e in emotions[:5])
    qa_lines = "\n".join(f"  Q: {a.question}\n  A: {a.answer}" for a in answers) if answers else "  No questionnaire responses."
    
    return f"""You are a compassionate, clinically-informed emotional wellness AI. Analyze this person's emotional assessment and provide a nuanced, personalized wellness summary.

ASSESSMENT DATA:
Selected Mood: {mood}
Detected Emotions:
{emotion_lines}

Questionnaire Responses:
{qa_lines}

Reflection: {reflection or "Not provided"}

CRITICAL INSTRUCTIONS:
1. Do NOT automatically classify "sad" as "elevated distress"
2. Analyze the ACTUAL content of their answers, not just the mood selection
3. Consider: duration, severity, functional impact, coping ability, support systems
4. Be nuanced — most people selecting "sad" are experiencing temporary or mild emotional states
5. Only classify as "elevated" if answers genuinely indicate severe, prolonged, or functionally impairing distress
6. Use warm, supportive, non-clinical language
7. Never diagnose clinical conditions

POSSIBLE LEVELS (choose the most accurate):
- "positive": stable, thriving, good emotional health
- "reflective": thoughtful, introspective, emotionally aware
- "mild": temporary low mood, manageable stress, normal life challenges  
- "recovering": bouncing back, showing resilience, improving
- "moderate": noticeable strain, needs attention but not crisis
- "elevated": significant distress, strongly indicated by answers (NOT just mood selection)

EMOTIONAL CATEGORIES (examples, choose most fitting):
Mildly Stressed, Emotionally Fatigued, Temporarily Low, Reflective & Sensitive,
Socially Drained, Mentally Tired, Recovering Emotionally, Emotionally Balanced,
Optimistic but Anxious, Emotionally Resilient, Overwhelmed, Burnout Patterns

Respond ONLY with valid JSON:
{{
  "level": "mild|moderate|elevated|positive|reflective|recovering",
  "headline": "Short personalized headline (max 8 words)",
  "body": "2-3 sentence warm personalized summary based on their actual answers",
  "indicators": ["4 specific patterns identified from their responses"],
  "wellness_score": 0-100,
  "stress_score": 0-100,
  "emotional_category": "Single descriptive category",
  "strengths": ["2-3 emotional strengths shown in their responses"],
  "recommendations": ["3 specific, actionable, warm recommendations"]
}}"""

@router.post("", response_model=AssessmentAnalysisResponse)
async def analyze_assessment(payload: AssessmentAnalysisRequest):
    client = _get_client()
    
    if client is None:
        logger.info("No Gemini key — using smart nuanced fallback")
        result = _smart_fallback(payload.mood, payload.emotions, payload.answers)
        return AssessmentAnalysisResponse(**result, ai_generated=False)
    
    prompt = _build_analysis_prompt(payload.mood, payload.emotions, payload.answers, payload.reflection or "")
    
    from google.genai import types
    from google.genai.errors import ClientError
    
    for model in _MODEL_CASCADE:
        try:
            response = client.models.generate_content(
                model=model, contents=prompt,
                config=types.GenerateContentConfig(temperature=0.6, max_output_tokens=1024, response_mime_type="application/json")
            )
            clean = re.sub(r"^```(?:json)?\s*|\s*```$","",response.text.strip(),flags=re.MULTILINE).strip()
            data = json.loads(clean)
            
            # Validate required fields
            required = ["level","headline","body","indicators","wellness_score","stress_score","emotional_category","strengths","recommendations"]
            if not all(k in data for k in required):
                raise ValueError("Missing required fields")
            
            logger.info(f"AI analysis generated with model {model}: level={data['level']}, category={data['emotional_category']}")
            return AssessmentAnalysisResponse(**data, ai_generated=True)
            
        except ClientError as exc:
            if getattr(exc,"status_code",500) == 429:
                continue
            break
        except Exception as exc:
            logger.error(f"Analysis error with {model}: {exc}")
            break
    
    # Fallback
    result = _smart_fallback(payload.mood, payload.emotions, payload.answers)
    return AssessmentAnalysisResponse(**result, ai_generated=False)
