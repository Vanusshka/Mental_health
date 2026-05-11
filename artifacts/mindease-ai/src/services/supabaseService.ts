/**
 * Supabase Data Service — typed with explicit casts to avoid never[] errors
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { EmotionalCheckin, Workshop, Patient } from "@/lib/database.types";
import type { EmotionScore } from "@/services/emotionApi";

// ── Helpers ───────────────────────────────────────────────────────────────

function indicatorsByMood(mood: "happy" | "neutral" | "sad") {
  if (mood === "happy") return { emotional_balance:82, stress_score:28, burnout_risk:18, sleep_wellness:76, emotional_resilience:85, social_connectivity:88, wellness_score:78 };
  if (mood === "sad")   return { emotional_balance:38, stress_score:74, burnout_risk:65, sleep_wellness:44, emotional_resilience:42, social_connectivity:35, wellness_score:42 };
  return                       { emotional_balance:61, stress_score:52, burnout_risk:40, sleep_wellness:62, emotional_resilience:65, social_connectivity:70, wellness_score:63 };
}

function assessmentLevel(mood: string): "elevated" | "moderate" | "positive" {
  if (mood === "sad")     return "elevated";
  if (mood === "neutral") return "moderate";
  return "positive";
}

// ── Emotional Check-ins ───────────────────────────────────────────────────

export interface SaveCheckinInput {
  user_id?: string;
  display_name?: string;
  email?: string;
  mood: "happy" | "neutral" | "sad";
  emotions: EmotionScore[];
  reflection?: string;
  answers?: { question: string; answer: string }[];
  workshop_id?: string;
  patient_id?: string;
  doctor_id?: string;
  session_number?: number;
}

export async function saveCheckin(input: SaveCheckinInput): Promise<string | null> {
  if (!isSupabaseConfigured) { console.warn("Supabase not configured"); return null; }
  const dominant = input.emotions[0] ?? { label: "neutral", score: 0 };
  const indicators = indicatorsByMood(input.mood);

  const { data, error } = await (supabase
    .from("emotional_checkins") as any)
    .insert({
      user_id:             input.user_id ?? null,
      display_name:        input.display_name ?? "Anonymous",
      email:               input.email ?? null,
      mood:                input.mood,
      dominant_emotion:    dominant.label,
      dominant_score:      dominant.score,
      assessment_level:    assessmentLevel(input.mood),
      emotional_summary:   `${dominant.label} (${Math.round(dominant.score * 100)}%)`,
      reflection:          input.reflection ?? null,
      answers:             input.answers ?? null,
      workshop_id:         input.workshop_id ?? null,
      patient_id:          input.patient_id ?? null,
      doctor_id:           input.doctor_id ?? null,
      session_number:      input.session_number ?? null,
      ...indicators,
    })
    .select("id")
    .single();

  if (error) { console.error("[Supabase] saveCheckin error:", error.message); return null; }
  return (data as { id: string } | null)?.id ?? null;
}

export async function getRecentCheckins(userId: string, count = 10): Promise<EmotionalCheckin[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await (supabase
    .from("emotional_checkins") as any)
    .select("*")
    .eq("user_id", userId)
    .order("timestamp", { ascending: false })
    .limit(count);
  if (error) { console.error("[Supabase] getRecentCheckins:", error.message); return []; }
  return (data ?? []) as EmotionalCheckin[];
}

export async function getAllCheckins(limit = 200): Promise<EmotionalCheckin[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await (supabase
    .from("emotional_checkins") as any)
    .select("*")
    .order("timestamp", { ascending: false })
    .limit(limit);
  if (error) { console.error("[Supabase] getAllCheckins:", error.message); return []; }
  return (data ?? []) as EmotionalCheckin[];
}

// ── Analytics ─────────────────────────────────────────────────────────────

export interface EmotionalAnalytics {
  total: number;
  happy_pct: number;
  neutral_pct: number;
  sad_pct: number;
  avg_stress: number;
  avg_wellness: number;
  trend_data: { week: string; happy: number; neutral: number; stressed: number }[];
}

export async function getOrgAnalytics(): Promise<EmotionalAnalytics> {
  if (!isSupabaseConfigured) return fallbackAnalytics();

  const { data, error } = await (supabase
    .from("emotional_checkins") as any)
    .select("mood, stress_score, wellness_score, timestamp")
    .order("timestamp", { ascending: false })
    .limit(500);

  if (error || !data || (data as EmotionalCheckin[]).length === 0) return fallbackAnalytics();

  const rows = data as EmotionalCheckin[];
  const total = rows.length;
  const happy   = rows.filter(d => d.mood === "happy").length;
  const neutral = rows.filter(d => d.mood === "neutral").length;
  const sad     = rows.filter(d => d.mood === "sad").length;
  const avg_stress   = Math.round(rows.reduce((s, d) => s + (d.stress_score ?? 5), 0) / total);
  const avg_wellness = Math.round(rows.reduce((s, d) => s + (d.wellness_score ?? 60), 0) / total);

  const now = new Date();
  const trend_data = Array.from({ length: 6 }, (_, i) => {
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - (5 - i) * 7);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);
    const week = rows.filter(d => {
      const t = new Date(d.timestamp);
      return t >= weekStart && t < weekEnd;
    });
    const wTotal = week.length || 1;
    return {
      week: `W${i + 1}`,
      happy:    Math.round(week.filter(d => d.mood === "happy").length / wTotal * 100),
      neutral:  Math.round(week.filter(d => d.mood === "neutral").length / wTotal * 100),
      stressed: Math.round(week.filter(d => d.mood === "sad").length / wTotal * 100),
    };
  });

  return {
    total,
    happy_pct:   Math.round(happy / total * 100),
    neutral_pct: Math.round(neutral / total * 100),
    sad_pct:     Math.round(sad / total * 100),
    avg_stress,
    avg_wellness,
    trend_data,
  };
}

function fallbackAnalytics(): EmotionalAnalytics {
  return {
    total: 0, happy_pct: 0, neutral_pct: 0, sad_pct: 0,
    avg_stress: 0, avg_wellness: 0,
    trend_data: Array.from({ length: 6 }, (_, i) => ({ week: `W${i+1}`, happy: 0, neutral: 0, stressed: 0 })),
  };
}

// ── Workshops ─────────────────────────────────────────────────────────────

export interface CreateWorkshopInput {
  workshop_name: string;
  description?: string;
  organization_name?: string;
  organization_id?: string;
  date?: string;
}

export async function createWorkshop(input: CreateWorkshopInput): Promise<Workshop | null> {
  if (!isSupabaseConfigured) {
    return {
      id: Math.random().toString(36).slice(2, 10).toUpperCase(),
      workshop_name: input.workshop_name,
      description: input.description ?? null,
      organization_id: input.organization_id ?? null,
      organization_name: input.organization_name ?? null,
      date: input.date ?? null,
      created_at: new Date().toISOString(),
      checkin_count: 0,
    };
  }

  const { data, error } = await (supabase
    .from("workshops") as any)
    .insert({
      workshop_name:     input.workshop_name,
      description:       input.description ?? null,
      organization_name: input.organization_name ?? null,
      organization_id:   input.organization_id ?? null,
      date:              input.date ?? null,
    })
    .select()
    .single();

  if (error) { console.error("[Supabase] createWorkshop:", error.message); return null; }
  return data as Workshop;
}

export async function getWorkshops(orgId?: string): Promise<Workshop[]> {
  if (!isSupabaseConfigured) return [];
  const q = (supabase.from("workshops") as any).select("*").order("created_at", { ascending: false });
  const { data, error } = orgId ? await q.eq("organization_id", orgId) : await q;
  if (error) { console.error("[Supabase] getWorkshops:", error.message); return []; }
  return (data ?? []) as Workshop[];
}

export async function getAllWorkshops(): Promise<Workshop[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await (supabase
    .from("workshops") as any)
    .select("*")
    .order("created_at", { ascending: false });
  if (error) { console.error("[Supabase] getAllWorkshops:", error.message); return []; }
  return (data ?? []) as Workshop[];
}

export async function getWorkshopById(id: string): Promise<Workshop | null> {
  if (!isSupabaseConfigured) return null;
  const { data, error } = await (supabase
    .from("workshops") as any)
    .select("*")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Workshop;
}

// ── Workshop Participants ─────────────────────────────────────────────────

export async function addWorkshopParticipant(
  workshopId: string,
  mood: "happy" | "neutral" | "sad",
  stressScore: number
): Promise<boolean> {
  if (!isSupabaseConfigured) return true;

  const { error } = await (supabase
    .from("workshop_participants") as any)
    .insert({ workshop_id: workshopId, participant_mood: mood, stress_score: stressScore });

  if (error) { console.error("[Supabase] addParticipant:", error.message); return false; }
  return true;
}

export interface WorkshopAnalytics {
  workshop: Workshop | null;
  total_checkins: number;
  distribution: { happy: number; neutral: number; sad: number };
  avg_stress: number;
  stressed_percent: number;
}

export async function getWorkshopAnalytics(workshopId: string): Promise<WorkshopAnalytics> {
  const workshop = await getWorkshopById(workshopId);

  if (!isSupabaseConfigured) {
    return { workshop, total_checkins: 0, distribution: { happy: 0, neutral: 0, sad: 0 }, avg_stress: 0, stressed_percent: 0 };
  }

  const { data, error } = await (supabase
    .from("workshop_participants") as any)
    .select("participant_mood, stress_score")
    .eq("workshop_id", workshopId);

  if (error || !data || (data as { participant_mood: string; stress_score: number }[]).length === 0) {
    return { workshop, total_checkins: 0, distribution: { happy: 0, neutral: 0, sad: 0 }, avg_stress: 0, stressed_percent: 0 };
  }

  const rows = data as { participant_mood: string; stress_score: number }[];
  const total = rows.length;
  const happy   = rows.filter(d => d.participant_mood === "happy").length;
  const neutral = rows.filter(d => d.participant_mood === "neutral").length;
  const sad     = rows.filter(d => d.participant_mood === "sad").length;
  const avg_stress = Math.round(rows.reduce((s, d) => s + (d.stress_score ?? 5), 0) / total * 10) / 10;

  return {
    workshop,
    total_checkins: total,
    distribution: {
      happy:   Math.round(happy / total * 100),
      neutral: Math.round(neutral / total * 100),
      sad:     Math.round(sad / total * 100),
    },
    avg_stress,
    stressed_percent: Math.round(sad / total * 100),
  };
}

// ── Patient Management ────────────────────────────────────────────────────

export interface CreatePatientInput {
  doctor_id: string;
  name: string;
  age?: number;
  condition?: string;
  notes?: string;
}

export async function createPatient(input: CreatePatientInput): Promise<Patient | null> {
  if (!isSupabaseConfigured) {
    return { id: crypto.randomUUID(), doctor_id: input.doctor_id, name: input.name, age: input.age ?? null, condition: input.condition ?? null, notes: input.notes ?? null, created_at: new Date().toISOString() };
  }
  const { data, error } = await (supabase
    .from("patients") as any)
    .insert({ doctor_id: input.doctor_id, name: input.name, age: input.age ?? null, condition: input.condition ?? null, notes: input.notes ?? null })
    .select()
    .single();
  if (error) { console.error("[Supabase] createPatient:", error.message); return null; }
  return data as Patient;
}

export async function getPatientsByDoctor(doctorId: string): Promise<Patient[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await (supabase
    .from("patients") as any)
    .select("*")
    .eq("doctor_id", doctorId)
    .order("created_at", { ascending: false });
  if (error) { console.error("[Supabase] getPatients:", error.message); return []; }
  return (data ?? []) as Patient[];
}

export async function updatePatientNotes(patientId: string, notes: string): Promise<boolean> {
  if (!isSupabaseConfigured) return true;
  const { error } = await (supabase
    .from("patients") as any)
    .update({ notes })
    .eq("id", patientId);
  if (error) { console.error("[Supabase] updateNotes:", error.message); return false; }
  return true;
}

export async function getCheckinsByPatient(patientId: string): Promise<EmotionalCheckin[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await (supabase
    .from("emotional_checkins") as any)
    .select("*")
    .eq("patient_id", patientId)
    .order("timestamp", { ascending: true });
  if (error) { console.error("[Supabase] getCheckinsByPatient:", error.message); return []; }
  return (data ?? []) as EmotionalCheckin[];
}

export async function getNextSessionNumber(patientId: string): Promise<number> {
  if (!isSupabaseConfigured) return 1;
  const { count } = await (supabase
    .from("emotional_checkins") as any)
    .select("*", { count: "exact", head: true })
    .eq("patient_id", patientId);
  return (count ?? 0) + 1;
}

// ── Patient Sessions ──────────────────────────────────────────────────────

export interface SavePatientSessionInput {
  patient_id: string;
  doctor_id: string;
  session_number: number;
  mood: "happy" | "neutral" | "sad";
  stress_score: number;
  wellness_score: number;
  emotional_summary?: string;
  ai_analysis?: string;
  dominant_emotion?: string;
  assessment_level: "elevated" | "moderate" | "positive";
  reflection?: string;
  answers?: { question: string; answer: string }[];
}

export async function savePatientSession(input: SavePatientSessionInput): Promise<string | null> {
  if (!isSupabaseConfigured) {
    console.warn("[Supabase] Not configured — patient session not saved");
    return null;
  }
  const { data, error } = await (supabase
    .from("patient_sessions") as any)
    .insert({
      patient_id:        input.patient_id,
      doctor_id:         input.doctor_id,
      session_number:    input.session_number,
      mood:              input.mood,
      stress_score:      input.stress_score,
      wellness_score:    input.wellness_score,
      emotional_summary: input.emotional_summary ?? null,
      ai_analysis:       input.ai_analysis ?? null,
      dominant_emotion:  input.dominant_emotion ?? null,
      assessment_level:  input.assessment_level,
      reflection:        input.reflection ?? null,
      answers:           input.answers ?? null,
    })
    .select("id")
    .single();
  if (error) { console.error("[Supabase] savePatientSession:", error.message); return null; }
  return (data as { id: string } | null)?.id ?? null;
}

export async function getPatientSessions(patientId: string): Promise<import("@/lib/database.types").PatientSession[]> {
  if (!isSupabaseConfigured) return [];
  const { data, error } = await (supabase
    .from("patient_sessions") as any)
    .select("*")
    .eq("patient_id", patientId)
    .order("session_number", { ascending: true });
  if (error) { console.error("[Supabase] getPatientSessions:", error.message); return []; }
  return (data ?? []) as import("@/lib/database.types").PatientSession[];
}

// ── Doctor Portal — Patient Summaries ────────────────────────────────────

export interface PatientSummary {
  user_id: string;
  display_name: string;
  email: string;
  latest: EmotionalCheckin;
  all: EmotionalCheckin[];
  trend: "improving" | "stable" | "declining" | "critical";
  avg_wellness: number;
  session_count: number;
}

export async function getAllPatientSummaries(): Promise<PatientSummary[]> {
  const checkins = await getAllCheckins(300);
  if (checkins.length === 0) return [];

  const byUser = new Map<string, EmotionalCheckin[]>();
  for (const c of checkins) {
    const key = c.user_id ?? c.display_name ?? "anon";
    byUser.set(key, [...(byUser.get(key) ?? []), c]);
  }

  const summaries: PatientSummary[] = [];
  for (const [uid, records] of byUser.entries()) {
    const sorted = records.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const last5 = sorted.slice(0, 5);
    const avg_wellness = Math.round(last5.reduce((s, r) => s + r.wellness_score, 0) / last5.length);
    summaries.push({
      user_id:       uid,
      display_name:  sorted[0].display_name ?? "Anonymous",
      email:         sorted[0].email ?? "",
      latest:        sorted[0],
      all:           sorted,
      trend:         computeTrend(sorted),
      avg_wellness,
      session_count: sorted.length,
    });
  }

  const ORDER: Record<string, number> = { critical: 0, declining: 1, stable: 2, improving: 3 };
  return summaries.sort((a, b) => ORDER[a.trend] - ORDER[b.trend]);
}

function computeTrend(records: EmotionalCheckin[]): "improving" | "stable" | "declining" | "critical" {
  if (!records.length) return "stable";
  const latest = records[0];
  if (latest.assessment_level === "elevated" && latest.wellness_score < 45) return "critical";
  if (records.length < 2) return latest.assessment_level === "elevated" ? "declining" : "stable";
  const half = Math.ceil(records.length / 2);
  const recentAvg = records.slice(0, half).reduce((s, r) => s + r.wellness_score, 0) / half;
  const olderAvg  = records.slice(half).reduce((s, r) => s + r.wellness_score, 0) / (records.length - half);
  const delta = recentAvg - olderAvg;
  if (delta > 6)  return "improving";
  if (delta < -6) return "declining";
  return "stable";
}
