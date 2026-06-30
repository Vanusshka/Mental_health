/**
 * Questionnaire API — with offline fallback.
 * Never throws — always returns questions even if backend is down.
 */

import type { EmotionScore } from "./emotionApi";

export interface QuestionnaireRequest {
  text: string;
  emotions: EmotionScore[];
}

export interface QuestionnaireResponse {
  questions: string[];
}

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

const FALLBACK_QUESTIONS: Record<string, string[]> = {
  sadness:     ["Little interest or pleasure in doing things you usually enjoy — how often recently?", "Feeling tired or having little energy — how many days this week?", "How difficult have these feelings made daily tasks?"],
  nervousness: ["Feeling nervous, anxious, or on edge — how often over the past few days?", "Not being able to stop or control worrying — several days or nearly every day?", "How much have these feelings affected your ability to focus?"],
  anger:       ["Becoming easily annoyed or irritable — how often has this been happening?", "How is this affecting your daily routine and relationships?", "What would help you feel more at ease right now?"],
  joy:         ["What was the highlight of your day that made you feel this way?", "How can you carry this positive energy into tomorrow?", "On a scale of 1 to 5, how much energy do you feel you have right now?"],
  neutral:     ["On a scale of 1 to 10, how would you rate your energy level today?", "How well did you connect with others today?", "What is one small step you could take tomorrow to feel even slightly better?"],
  default:     ["How many hours of sleep did you get last night, and how was the quality?", "How would you describe your current stress level?", "How difficult have your feelings made it to do your work this week?"],
};

export async function generateQuestions(payload: QuestionnaireRequest): Promise<QuestionnaireResponse> {
  const dominant = payload.emotions[0]?.label ?? "default";

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${BACKEND_URL}/generate-questions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json() as QuestionnaireResponse;
  } catch {
    console.warn("[MANAS] Questions backend unreachable, using local fallback");
    return { questions: FALLBACK_QUESTIONS[dominant] ?? FALLBACK_QUESTIONS.default };
  }
}
