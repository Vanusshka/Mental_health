/**
 * Questionnaire API Service
 * Calls POST /generate-questions on the FastAPI backend.
 * Gemini generates empathetic follow-up questions server-side.
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

/**
 * Sends emotion analysis results to the backend and receives
 * Gemini-generated empathetic follow-up questions.
 */
export async function generateQuestions(
  payload: QuestionnaireRequest
): Promise<QuestionnaireResponse> {
  const response = await fetch(`${BACKEND_URL}/generate-questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = (body as { detail?: string }).detail;
    throw new Error(
      detail ??
        `Question generation failed (${response.status}). Please try again.`
    );
  }

  return response.json() as Promise<QuestionnaireResponse>;
}
