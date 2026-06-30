/**
 * Emotion Analysis API Service
 * Calls backend /analyze-mood. Falls back to local rule-based analysis
 * if backend is unreachable — so assessment NEVER fails.
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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://127.0.0.1:8000";

// ── Local emotion fallback — no backend needed ────────────────────────────
const LOCAL_EMOTIONS: Record<string, EmotionScore[]> = {
  happy:   [
    { label:"joy", score:0.82 }, { label:"optimism", score:0.10 },
    { label:"excitement", score:0.05 }, { label:"gratitude", score:0.02 }, { label:"love", score:0.01 },
  ],
  neutral: [
    { label:"neutral", score:0.65 }, { label:"approval", score:0.15 },
    { label:"realization", score:0.10 }, { label:"curiosity", score:0.07 }, { label:"caring", score:0.03 },
  ],
  sad: [
    { label:"sadness", score:0.78 }, { label:"disappointment", score:0.12 },
    { label:"grief", score:0.06 }, { label:"remorse", score:0.03 }, { label:"fear", score:0.01 },
  ],
};

function localFallback(text: string): EmotionResponse {
  const t = text.toLowerCase();
  if (t.includes("happy") || t.includes("joy") || t.includes("positive") || t.includes("energi") || t.includes("well"))
    return { emotions: LOCAL_EMOTIONS.happy };
  if (t.includes("sad") || t.includes("drained") || t.includes("heavy") || t.includes("low") || t.includes("grief"))
    return { emotions: LOCAL_EMOTIONS.sad };
  return { emotions: LOCAL_EMOTIONS.neutral };
}

/**
 * Sends user text to the backend emotion analysis endpoint.
 * If backend is unreachable (timeout 5s), uses local rule-based fallback.
 * Never throws — assessment always continues.
 */
export async function analyzeEmotion(text: string): Promise<EmotionResponse> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(`${BACKEND_URL}/analyze-mood`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
      signal: controller.signal,
    });
    clearTimeout(timer);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json() as EmotionResponse;
  } catch {
    // Backend unreachable — use local fallback silently, no error shown
    console.warn("[MANAS] Backend unreachable, using local emotion fallback");
    return localFallback(text);
  }
}
