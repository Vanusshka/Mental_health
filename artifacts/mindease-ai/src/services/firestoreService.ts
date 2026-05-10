/**
 * Firestore Service
 * ─────────────────────────────────────────────────────────────────────────
 * Handles all Firestore read/write operations for emotional assessments.
 *
 * Collection structure:
 *   users/{uid}/assessments/{assessmentId}
 *
 * Each assessment document stores the full emotional snapshot from
 * the wellness assessment flow.
 */

import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EmotionScore } from "@/services/emotionApi";

// ── Assessment document shape ──────────────────────────────────────────────

export interface AssessmentRecord {
  uid: string;
  displayName: string;
  email: string;
  timestamp: Timestamp | null;

  // Mood selection
  selectedMood: "happy" | "neutral" | "sad";

  // RoBERTa emotion analysis
  dominantEmotion: string;
  dominantScore: number;
  emotions: EmotionScore[];

  // Assessment level from recommendation engine
  assessmentLevel: "elevated" | "moderate" | "positive";

  // Wellness indicators (0–100)
  emotionalBalance: number;
  stressIndicator: number;
  burnoutRisk: number;
  sleepWellness: number;
  emotionalResilience: number;
  socialConnectivity: number;

  // Wellness score (0–100)
  wellnessScore: number;

  // Reflection text (optional)
  reflection: string;

  // Q&A answers from the questionnaire
  answers: { question: string; answer: string }[];
}

// ── Wellness indicator values by mood ─────────────────────────────────────

function indicatorsByMood(mood: "happy" | "neutral" | "sad") {
  if (mood === "happy") return {
    emotionalBalance: 82, stressIndicator: 28, burnoutRisk: 18,
    sleepWellness: 76, emotionalResilience: 85, socialConnectivity: 88,
    wellnessScore: 78,
  };
  if (mood === "sad") return {
    emotionalBalance: 38, stressIndicator: 74, burnoutRisk: 65,
    sleepWellness: 44, emotionalResilience: 42, socialConnectivity: 35,
    wellnessScore: 42,
  };
  return {
    emotionalBalance: 61, stressIndicator: 52, burnoutRisk: 40,
    sleepWellness: 62, emotionalResilience: 65, socialConnectivity: 70,
    wellnessScore: 63,
  };
}

// ── Write ──────────────────────────────────────────────────────────────────

export interface SaveAssessmentInput {
  uid: string;
  displayName: string;
  email: string;
  selectedMood: "happy" | "neutral" | "sad";
  emotions: EmotionScore[];
  assessmentLevel: "elevated" | "moderate" | "positive";
  reflection: string;
  answers: { question: string; answer: string }[];
}

/**
 * Saves a completed emotional assessment to Firestore.
 * Returns the new document ID.
 */
export async function saveAssessment(input: SaveAssessmentInput): Promise<string> {
  const dominant = input.emotions[0] ?? { label: "neutral", score: 0 };
  const indicators = indicatorsByMood(input.selectedMood);

  const record: Omit<AssessmentRecord, "timestamp"> & { timestamp: ReturnType<typeof serverTimestamp> } = {
    uid:             input.uid,
    displayName:     input.displayName,
    email:           input.email,
    timestamp:       serverTimestamp(),
    selectedMood:    input.selectedMood,
    dominantEmotion: dominant.label,
    dominantScore:   dominant.score,
    emotions:        input.emotions,
    assessmentLevel: input.assessmentLevel,
    reflection:      input.reflection,
    answers:         input.answers,
    ...indicators,
  };

  const ref = collection(db, "users", input.uid, "assessments");
  const docRef = await addDoc(ref, record);
  return docRef.id;
}

// ── Read ───────────────────────────────────────────────────────────────────

/**
 * Fetches the N most recent assessments for a user, newest first.
 */
export async function getRecentAssessments(
  uid: string,
  count = 10,
): Promise<AssessmentRecord[]> {
  const ref = collection(db, "users", uid, "assessments");
  const q = query(ref, orderBy("timestamp", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data() } as AssessmentRecord));
}

/**
 * Fetches only the latest assessment for a user.
 */
export async function getLatestAssessment(uid: string): Promise<AssessmentRecord | null> {
  const results = await getRecentAssessments(uid, 1);
  return results[0] ?? null;
}
