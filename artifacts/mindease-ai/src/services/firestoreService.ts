/**
 * firestoreService.ts — DEPRECATED
 * Firebase/Firestore has been replaced by Supabase.
 * This file is kept as a stub to avoid breaking any residual imports.
 * All actual data operations use supabaseService.ts
 */

export type UserRole = "patient" | "doctor";

export interface AssessmentRecord {
  uid: string;
  displayName: string;
  email: string;
  timestamp: null;
  selectedMood: "happy" | "neutral" | "sad";
  dominantEmotion: string;
  dominantScore: number;
  emotions: { label: string; score: number }[];
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

export interface PatientSummary {
  uid: string;
  displayName: string;
  email: string;
  latestAssessment: AssessmentRecord;
  allAssessments: AssessmentRecord[];
  trend: "improving" | "stable" | "declining" | "critical";
  avgWellnessScore: number;
  sessionCount: number;
}

// All functions are no-ops — use supabaseService.ts instead
export async function getUserRole(_uid: string): Promise<UserRole | null> { return null; }
export async function setUserRole(_uid: string, _name: string, _email: string, _role: UserRole): Promise<void> {}
export async function saveAssessment(_input: unknown): Promise<string> { return ""; }
export async function getRecentAssessments(_uid: string, _count?: number): Promise<AssessmentRecord[]> { return []; }
export async function getLatestAssessment(_uid: string): Promise<AssessmentRecord | null> { return null; }
export async function getAllPatientSummaries(): Promise<PatientSummary[]> { return []; }
