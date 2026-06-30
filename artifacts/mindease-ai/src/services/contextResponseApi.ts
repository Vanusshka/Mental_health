/**
 * Context Response API — with offline fallback.
 * Never throws — always returns a warm response even if backend is down.
 */

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

export interface ContextResponseRequest {
  mood: "happy" | "neutral";
  context_text: string;
}

export interface ContextResponseResult {
  message: string;
  suggestions: string[];
}

const FALLBACKS: Record<string, ContextResponseResult> = {
  happy: {
    message: "That's wonderful to hear! Your positive energy is radiant today. Savour this feeling — it's a sign that you're thriving.",
    suggestions: [
      "Write down what's making you feel this way so you can revisit it on harder days.",
      "Share your positivity with someone who might need a boost today.",
      "Use this energy to make progress on something meaningful to you.",
    ],
  },
  neutral: {
    message: "Finding your balance today? That's a great place to be. Neutral is not empty — it's clarity and calm.",
    suggestions: [
      "Try a 1-minute stretch or deep breath to check in with your body.",
      "Neutral is a valid part of the emotional cycle — rest in it without judgment.",
      "Pick one small thing today that brings you even a little joy.",
    ],
  },
};

export async function generateContextResponse(payload: ContextResponseRequest): Promise<ContextResponseResult> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const response = await fetch(`${BACKEND_URL}/generate-response`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json() as ContextResponseResult;
  } catch {
    console.warn("[MANAS] Context response backend unreachable, using local fallback");
    return FALLBACKS[payload.mood] ?? FALLBACKS.neutral;
  }
}
