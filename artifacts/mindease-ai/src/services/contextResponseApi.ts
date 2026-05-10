/**
 * Context Response API Service
 * Calls POST /generate-response on the FastAPI backend.
 * Gemini generates a personalised, context-aware emotional response.
 * Used for happy and neutral users after they share their context.
 */

const BACKEND_URL = "http://127.0.0.1:8000";

export interface ContextResponseRequest {
  mood: "happy" | "neutral";
  context_text: string;
}

export interface ContextResponseResult {
  message: string;
  suggestions: string[];
}

export async function generateContextResponse(
  payload: ContextResponseRequest
): Promise<ContextResponseResult> {
  const response = await fetch(`${BACKEND_URL}/generate-response`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = (body as { detail?: string }).detail;
    throw new Error(
      detail ?? `Response generation failed (${response.status}). Please try again.`
    );
  }

  return response.json() as Promise<ContextResponseResult>;
}
