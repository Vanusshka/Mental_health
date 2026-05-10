/**
 * Emotion Theme Utility
 * Maps backend emotion labels → MoodType and supportive UI content
 */

import type { MoodType } from "@/contexts/MoodContext";
import type { EmotionScore } from "@/services/emotionApi";

// Emotions that map to "sad" mood theme
const SAD_EMOTIONS = new Set([
  "sadness",
  "grief",
  "disappointment",
  "remorse",
  "embarrassment",
  "nervousness",
  "fear",
  "disgust",
  "anger",
  "annoyance",
]);

// Emotions that map to "happy" mood theme
const HAPPY_EMOTIONS = new Set([
  "joy",
  "excitement",
  "optimism",
  "amusement",
  "admiration",
  "approval",
  "caring",
  "desire",
  "gratitude",
  "love",
  "pride",
  "relief",
]);

/**
 * Converts the dominant backend emotion label into a MoodType
 * for the existing MoodContext theme system.
 */
export function emotionToMoodType(dominantLabel: string): MoodType {
  const label = dominantLabel.toLowerCase();
  if (SAD_EMOTIONS.has(label)) return "sad";
  if (HAPPY_EMOTIONS.has(label)) return "happy";
  return "neutral";
}

/**
 * Returns the dominant emotion (highest score) from the list.
 */
export function getDominantEmotion(emotions: EmotionScore[]): EmotionScore | null {
  if (!emotions || emotions.length === 0) return null;
  return emotions[0]; // already sorted by score desc from backend
}

/**
 * Returns a supportive message based on the detected mood.
 */
export function getSupportiveMessage(mood: MoodType): {
  headline: string;
  subtext: string;
  emoji: string;
} {
  switch (mood) {
    case "sad":
      return {
        headline: "You're not alone in this.",
        subtext:
          "It's okay to feel this way. MANAS is here to listen, support, and gently guide you through.",
        emoji: "🌙",
      };
    case "happy":
      return {
        headline: "Your energy is radiant today!",
        subtext:
          "Channel this positivity into something meaningful. You're in a great space to grow.",
        emoji: "✨",
      };
    case "neutral":
    default:
      return {
        headline: "Steady and grounded.",
        subtext:
          "A calm mind is a powerful mind. Let's make the most of this balanced state.",
        emoji: "🌊",
      };
  }
}

/**
 * Returns a human-readable label for an emotion score percentage.
 */
export function formatScore(score: number): string {
  return `${Math.round(score * 100)}%`;
}

/**
 * Returns a color class for an emotion bar based on mood type.
 */
export function getEmotionBarColor(mood: MoodType): string {
  switch (mood) {
    case "sad":
      return "from-indigo-400 to-violet-500";
    case "happy":
      return "from-yellow-400 to-orange-400";
    case "neutral":
    default:
      return "from-sky-400 to-teal-400";
  }
}
