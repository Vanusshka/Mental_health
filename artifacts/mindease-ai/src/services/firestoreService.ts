/**
 * Firestore Service
 * ─────────────────────────────────────────────────────────────────────────
 * Handles all Firestore read/write operations for emotional assessments.
 *
 * Collection structure:
 *   users/{uid}/assessments/{assessmentId}
 */

import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  doc,
  query,
  orderBy,
  limit,
  collectionGroup,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { EmotionScore } from "@/services/emotionApi";

// ── User profile / role ───────────────────────────────────────────────────

export type UserRole = "patient" | "doctor";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: UserRole;
  createdAt: Timestamp | null;
}

/**
 * Fetch the user's role from Firestore.
 * Returns null if no profile document exists yet (first login).
 */
export async function getUserRole(uid: string): Promise<UserRole | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  const data = snap.data();
  return (data?.role as UserRole) ?? null;
}

/**
 * Save the user's chosen role to Firestore.
 * Uses setDoc with merge so it doesn't overwrite existing assessment data.
 */
export async function setUserRole(
  uid: string,
  displayName: string,
  email: string,
  role: UserRole,
): Promise<void> {
  const ref = doc(db, "users", uid);
  await setDoc(
    ref,
    {
      uid,
      displayName,
      email,
      role,
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

// ── Assessment document shape ──────────────────────────────────────────────

export interface AssessmentRecord {
  uid: string;
  displayName: string;
  email: string;
  timestamp: Timestamp | null;

  selectedMood: "happy" | "neutral" | "sad";

  dominantEmotion: string;
  dominantScore: number;
  emotions: EmotionScore[];

  assessmentLevel: "elevated" | "moderate" | "positive";

  emotionalBalance: number;
  stressIndicator: number;
  burnoutRisk: number;
  sleepWellness: number;
  emotionalResilience: number;
  socialConnectivity: number;

  wellnessScore: number;
  reflection: string;
  answers: { question: string; answer: string }[];
}

// ── Patient summary (aggregated from assessments) ─────────────────────────

export interface PatientSummary {
  uid: string;
  displayName: string;
  email: string;
  latestAssessment: AssessmentRecord;
  allAssessments: AssessmentRecord[];
  /** Computed trend: "improving" | "stable" | "declining" | "critical" */
  trend: "improving" | "stable" | "declining" | "critical";
  /** Average wellness score across last 5 sessions */
  avgWellnessScore: number;
  /** Total number of assessments */
  sessionCount: number;
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

// ── Read — single user ─────────────────────────────────────────────────────

export async function getRecentAssessments(
  uid: string,
  count = 10,
): Promise<AssessmentRecord[]> {
  const ref = collection(db, "users", uid, "assessments");
  const q = query(ref, orderBy("timestamp", "desc"), limit(count));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data() } as AssessmentRecord));
}

export async function getLatestAssessment(uid: string): Promise<AssessmentRecord | null> {
  const results = await getRecentAssessments(uid, 1);
  return results[0] ?? null;
}

// ── Read — all users (doctor portal) ──────────────────────────────────────

/**
 * Fetches all assessments across all users using a Firestore collection group query.
 *
 * Requires a Firestore composite index. If the index doesn't exist yet,
 * Firestore returns an error with a link to create it — this is surfaced
 * to the caller with a helpful message.
 *
 * Deploy the index with: firebase deploy --only firestore:indexes
 * Or use the link in the error message from the Firebase console.
 */
export async function getAllPatientSummaries(): Promise<PatientSummary[]> {
  let records: AssessmentRecord[] = [];

  try {
    const q = query(
      collectionGroup(db, "assessments"),
      orderBy("timestamp", "desc"),
      limit(200),
    );
    const snap = await getDocs(q);
    records = snap.docs.map((d) => ({ ...d.data() } as AssessmentRecord));
  } catch (err: unknown) {
    // Re-throw the original Firestore error unchanged so the caller
    // receives the real Firebase error object — including the auto-index
    // creation URL in the error message.
    throw err;
  }

  // Group by uid
  const byUid = new Map<string, AssessmentRecord[]>();
  for (const record of records) {
    if (!record.uid) continue;
    const existing = byUid.get(record.uid) ?? [];
    existing.push(record);
    byUid.set(record.uid, existing);
  }

  // Build PatientSummary per user
  const summaries: PatientSummary[] = [];
  for (const [uid, assessments] of byUid.entries()) {
    // Already sorted desc by timestamp from the query
    const latest = assessments[0];
    const last5 = assessments.slice(0, 5);
    const avgWellnessScore = Math.round(
      last5.reduce((s, a) => s + (a.wellnessScore ?? 58), 0) / last5.length
    );

    summaries.push({
      uid,
      displayName: latest.displayName || "Anonymous",
      email:       latest.email || "",
      latestAssessment: latest,
      allAssessments:   assessments,
      trend:            computeTrend(assessments),
      avgWellnessScore,
      sessionCount:     assessments.length,
    });
  }

  // Sort: critical first, then declining, stable, improving
  const ORDER = { critical: 0, declining: 1, stable: 2, improving: 3 };
  summaries.sort((a, b) => ORDER[a.trend] - ORDER[b.trend]);

  return summaries;
}

/**
 * Compute emotional trend from assessment history.
 * Compares average of first half vs second half of sessions.
 */
function computeTrend(
  assessments: AssessmentRecord[],
): "improving" | "stable" | "declining" | "critical" {
  if (assessments.length === 0) return "stable";

  const latest = assessments[0];

  // Critical: latest is elevated distress
  if (latest.assessmentLevel === "elevated" && (latest.wellnessScore ?? 58) < 45) {
    return "critical";
  }

  if (assessments.length < 2) {
    return latest.assessmentLevel === "elevated" ? "declining" : "stable";
  }

  // Compare recent vs older scores
  const half = Math.ceil(assessments.length / 2);
  const recentAvg = assessments.slice(0, half).reduce((s, a) => s + (a.wellnessScore ?? 58), 0) / half;
  const olderAvg  = assessments.slice(half).reduce((s, a) => s + (a.wellnessScore ?? 58), 0) / (assessments.length - half);

  const delta = recentAvg - olderAvg;
  if (delta > 6)  return "improving";
  if (delta < -6) return "declining";
  return "stable";
}
