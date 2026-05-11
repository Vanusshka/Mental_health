/**
 * Emotion Analysis API Service
 * Communicates with the FastAPI backend at /api/analyze-mood
 */

export interface EmotionScore {
  label: string;
  score: number;
}

export interface EmotionResponse {
  emotions: EmotionScore[];
}

export interface EmotionApiError {
  message: string;
  status?: number;
}

// Use env var in production (set VITE_BACKEND_URL in Vercel), fallback to localhost
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

/**
 * Sends user text to the backend emotion analysis endpoint.
 * Returns top emotions sorted by confidence score.
 */
export async function analyzeEmotion(text: string): Promise<EmotionResponse> {
  const response = await fetch(`${BACKEND_URL}/analyze-mood`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Unknown error");
    throw new Error(
      `Emotion analysis failed (${response.status}): ${errorText}`
    );
  }

  const data: EmotionResponse = await response.json();
  return data;
}
