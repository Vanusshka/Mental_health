/**
 * AI Assessment Analysis API
 * Calls POST /analyze-assessment on the backend.
 * Returns nuanced, Gemini-powered emotional analysis.
 */

import type { EmotionScore } from "./emotionApi";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export interface AssessmentAnalysisResult {
  level: "elevated" | "moderate" | "mild" | "positive" | "reflective" | "recovering";
  headline: string;
  body: string;
  indicators: string[];
  wellness_score: number;
  stress_score: number;
  emotional_category: string;
  strengths: string[];
  recommendations: string[];
  ai_generated: boolean;
}

export async function analyzeAssessment(
  mood: string,
  emotions: EmotionScore[],
  answers: { question: string; answer: string }[],
  reflection?: string
): Promise<AssessmentAnalysisResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${BACKEND_URL}/analyze-assessment`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mood, emotions, answers, reflection: reflection ?? "" }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch {
    console.warn("[MANAS] Assessment analysis backend unreachable, using smart fallback");
    return smartFallback(mood, emotions, answers);
  }
}

// ── Smart client-side fallback (no backend needed) ────────────────────────
function smartFallback(
  mood: string,
  emotions: EmotionScore[],
  answers: { question: string; answer: string }[]
): AssessmentAnalysisResult {
  const allText = answers.map(a => a.answer.toLowerCase()).join(" ");

  const severeSignals = ["hopeless","worthless","can't function","weeks","months","every day","always","no point","give up","suicidal","harm","completely alone","never gets better"];
  const moderateSignals = ["exhausted","overwhelmed","anxious","stressed","hard to focus","not eating","isolating","few days","this week","can't sleep"];
  const mildSignals = ["little","bit","sometimes","today","lately","manageable","getting through","okay mostly","not great"];

  const severeCount  = severeSignals.filter(s => allText.includes(s)).length;
  const moderateCount = moderateSignals.filter(s => allText.includes(s)).length;
  const mildCount    = mildSignals.filter(s => allText.includes(s)).length;
  const dominantScore = emotions[0]?.score ?? 0.5;

  if (mood === "happy") {
    return { level:"positive", headline:"Positive Emotional Wellbeing", body:"Your responses reflect a positive and energised emotional state. Your wellbeing indicators are strong.", indicators:["Positive emotional regulation","Strong resilience","Healthy energy levels","Good social connection"], wellness_score:82, stress_score:22, emotional_category:"Emotionally Thriving", strengths:["Positive outlook","Emotional resilience","Social connection"], recommendations:["Channel energy into meaningful goals","Share positivity with others","Build resilience reserves"], ai_generated:false };
  }

  if (mood === "neutral") {
    return { level:"positive", headline:"Balanced Emotional State", body:"Your responses reflect a steady, balanced emotional state. You're maintaining equilibrium and have good emotional awareness.", indicators:["Stable mood patterns","Healthy emotional regulation","Good self-awareness","Balanced energy"], wellness_score:68, stress_score:38, emotional_category:"Emotionally Balanced", strengths:["Emotional stability","Self-regulation","Mindfulness"], recommendations:["Maintain current wellness habits","Continue self-reflection","Build on positive patterns"], ai_generated:false };
  }

  // Sad — nuanced based on answer content
  if (severeCount >= 2 || (dominantScore > 0.85 && severeCount >= 1)) {
    return { level:"elevated", headline:"Elevated Emotional Distress Patterns", body:"Your responses suggest significant emotional distress that would benefit from additional support. These patterns are common and manageable with the right guidance.", indicators:["Elevated distress signals","Emotional exhaustion","Possible isolation patterns","Reduced resilience"], wellness_score:32, stress_score:78, emotional_category:"Emotionally Overwhelmed", strengths:["Courage to seek help","Self-awareness"], recommendations:["Consider speaking with a wellness professional","Prioritize rest","Reach out to your support network"], ai_generated:false };
  }
  if (moderateCount >= 2 || dominantScore > 0.7) {
    return { level:"moderate", headline:"Moderate Emotional Strain Identified", body:"Your responses indicate some emotional strain and fatigue. While not severe, these patterns suggest your emotional wellbeing would benefit from intentional care.", indicators:["Moderate stress indicators","Some emotional depletion","Need for recovery time","Opportunity to strengthen coping"], wellness_score:48, stress_score:60, emotional_category:"Emotionally Strained", strengths:["Seeking support","Emotional awareness"], recommendations:["Rest and recovery time","Talk to someone you trust","Reduce stressors where possible"], ai_generated:false };
  }
  // Default for sad — mild, not elevated
  return { level:"mild", headline:"Mild Emotional Heaviness Detected", body:"Your responses suggest you're experiencing some emotional weight, but your overall patterns indicate resilience and self-awareness. This is a natural part of the emotional spectrum.", indicators:["Temporary low mood","Emotional sensitivity","Reflective state","Underlying resilience present"], wellness_score:60, stress_score:42, emotional_category:"Mildly Low", strengths:["Self-awareness","Willingness to reflect","Emotional honesty"], recommendations:["Gentle self-care today","Connect with someone you trust","Short mindfulness practice"], ai_generated:false };
}
