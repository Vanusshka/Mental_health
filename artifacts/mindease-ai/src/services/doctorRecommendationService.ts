/**
 * Doctor Recommendation Service
 * ─────────────────────────────────────────────────────────────────────────
 * Maps emotional assessment signals → relevant professional categories →
 * ranked list of recommended Hyderabad wellness professionals.
 *
 * IMPORTANT: This system NEVER diagnoses clinical conditions.
 * It maps emotional distress PATTERNS to support categories only.
 *
 * Recommendation is suppressed for positive / stable assessments.
 */

import {
  hyderabadProfessionals,
  type WellnessProfessional,
} from "@/data/hyderabadProfessionals";
import type { EmotionScore } from "@/services/emotionApi";

// ── Emotion → category mapping ─────────────────────────────────────────────

const ANXIETY_EMOTIONS    = new Set(["nervousness", "fear", "confusion", "embarrassment"]);
const BURNOUT_EMOTIONS    = new Set(["annoyance", "anger", "disgust", "exhaustion"]);
const GRIEF_EMOTIONS      = new Set(["sadness", "grief", "remorse", "disappointment"]);
const TRAUMA_EMOTIONS     = new Set(["fear", "disgust", "shock"]);
const ISOLATION_EMOTIONS  = new Set(["sadness", "grief", "disappointment", "remorse"]);
const SLEEP_EMOTIONS      = new Set(["nervousness", "fear", "annoyance"]);

export type AssessmentLevel = "elevated" | "moderate" | "positive";

export interface RecommendationResult {
  shouldShow: boolean;
  level: AssessmentLevel;
  categories: string[];
  professionals: WellnessProfessional[];
  supportMessage: string;
}

/**
 * Compute the assessment level from emotion scores.
 * Mirrors the logic in AssessmentResultCard for consistency.
 */
export function computeAssessmentLevel(emotions: EmotionScore[]): AssessmentLevel {
  const DISTRESS = new Set(["sadness", "grief", "disappointment", "remorse", "fear", "nervousness"]);
  const BURNOUT  = new Set(["exhaustion", "annoyance", "disgust", "anger"]);

  const distressScore = emotions
    .filter((e) => DISTRESS.has(e.label))
    .reduce((s, e) => s + e.score, 0);

  const burnoutScore = emotions
    .filter((e) => BURNOUT.has(e.label))
    .reduce((s, e) => s + e.score, 0);

  const dominant      = emotions[0];
  const dominantLabel = dominant?.label ?? "";
  const highIntensity = (dominant?.score ?? 0) > 0.7;

  if (DISTRESS.has(dominantLabel) && highIntensity && distressScore > 0.6) return "elevated";
  if (distressScore > 0.3 || burnoutScore > 0.2) return "moderate";
  return "positive";
}

/**
 * Derive the most relevant professional categories from emotion scores.
 * Returns a prioritised list (most relevant first).
 */
function deriveCategories(emotions: EmotionScore[]): string[] {
  const scores: Record<string, number> = {
    anxiety:       0,
    stress_burnout: 0,
    grief_loss:    0,
    trauma:        0,
    relationships: 0,
    sleep:         0,
    general:       0,
  };

  for (const e of emotions) {
    const w = e.score; // weight by confidence
    if (ANXIETY_EMOTIONS.has(e.label))   scores.anxiety       += w * 1.2;
    if (BURNOUT_EMOTIONS.has(e.label))   scores.stress_burnout += w * 1.2;
    if (GRIEF_EMOTIONS.has(e.label))     scores.grief_loss    += w * 1.1;
    if (TRAUMA_EMOTIONS.has(e.label))    scores.trauma        += w * 1.0;
    if (ISOLATION_EMOTIONS.has(e.label)) scores.relationships += w * 0.9;
    if (SLEEP_EMOTIONS.has(e.label))     scores.sleep         += w * 0.8;
  }

  // Always include general as a fallback
  scores.general = 0.1;

  return Object.entries(scores)
    .filter(([, v]) => v > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([k]) => k);
}

/**
 * Score a professional against the derived categories.
 * Higher score = better match.
 */
function scoreProfessional(
  pro: WellnessProfessional,
  categories: string[],
): number {
  let score = 0;
  for (let i = 0; i < categories.length; i++) {
    const priority = categories.length - i; // higher priority = higher weight
    if (pro.categories.includes(categories[i])) {
      score += priority * 10;
    }
  }
  // Tiebreak: experience + rating
  score += pro.experience * 0.5 + pro.rating * 2;
  return score;
}

/**
 * Build a supportive, non-diagnostic message based on assessment level
 * and top emotional patterns.
 */
function buildSupportMessage(
  level: AssessmentLevel,
  categories: string[],
): string {
  const topCategory = categories[0] ?? "general";

  const messages: Record<string, Record<AssessmentLevel, string>> = {
    anxiety: {
      elevated: "Your assessment suggests elevated anxiety patterns. Speaking with a wellness professional may help you develop effective coping strategies.",
      moderate: "Your responses indicate some anxiety-related patterns. A wellness professional can offer personalised support and practical tools.",
      positive: "",
    },
    stress_burnout: {
      elevated: "Your assessment reflects significant emotional exhaustion and burnout patterns. Professional support can help you restore balance and resilience.",
      moderate: "Your responses suggest some stress and burnout indicators. A wellness professional may help you build sustainable coping strategies.",
      positive: "",
    },
    grief_loss: {
      elevated: "Your assessment indicates prolonged emotional distress patterns. Speaking with a grief or emotional wellness specialist may provide meaningful support.",
      moderate: "Your responses reflect some emotional heaviness. A wellness professional can offer a safe space to process and heal.",
      positive: "",
    },
    trauma: {
      elevated: "Your assessment suggests emotional distress patterns that may benefit from specialised support. A trauma-informed professional can help you feel safe and supported.",
      moderate: "Your responses indicate some emotional distress. A wellness professional can offer gentle, evidence-based support.",
      positive: "",
    },
    relationships: {
      elevated: "Your assessment reflects patterns of emotional isolation or relational distress. A counselling professional may help you reconnect and rebuild.",
      moderate: "Your responses suggest some interpersonal or emotional strain. A wellness professional can offer supportive guidance.",
      positive: "",
    },
    sleep: {
      elevated: "Your assessment indicates significant sleep and fatigue-related patterns. A wellness professional specialising in sleep and stress can help.",
      moderate: "Your responses suggest some sleep or fatigue-related concerns. A wellness professional may offer helpful strategies.",
      positive: "",
    },
    general: {
      elevated: "Your assessment suggests elevated emotional distress patterns. Speaking with a mental wellness professional may provide meaningful support.",
      moderate: "Your responses indicate some emotional strain. Additional support from a wellness professional may be beneficial.",
      positive: "",
    },
  };

  return messages[topCategory]?.[level] ?? messages.general[level] ?? "";
}

/**
 * Main recommendation function.
 * Returns up to 3 best-matched professionals, or empty if not applicable.
 */
export function getRecommendations(
  emotions: EmotionScore[],
): RecommendationResult {
  const level = computeAssessmentLevel(emotions);

  // Only show recommendations for moderate or elevated distress
  if (level === "positive") {
    return {
      shouldShow: false,
      level,
      categories: [],
      professionals: [],
      supportMessage: "",
    };
  }

  const categories = deriveCategories(emotions);

  // Score and rank all professionals
  const ranked = hyderabadProfessionals
    .map((pro) => ({ pro, score: scoreProfessional(pro, categories) }))
    .sort((a, b) => b.score - a.score)
    .map(({ pro }) => pro);

  // Return top 3 — ensure variety (no two with same primary specialization)
  const selected: WellnessProfessional[] = [];
  const seenSpecs = new Set<string>();
  for (const pro of ranked) {
    if (selected.length >= 3) break;
    if (!seenSpecs.has(pro.specialization)) {
      selected.push(pro);
      seenSpecs.add(pro.specialization);
    }
  }
  // If we couldn't get 3 unique specs, fill up to 3
  for (const pro of ranked) {
    if (selected.length >= 3) break;
    if (!selected.includes(pro)) selected.push(pro);
  }

  const supportMessage = buildSupportMessage(level, categories);

  return {
    shouldShow: true,
    level,
    categories,
    professionals: selected,
    supportMessage,
  };
}
