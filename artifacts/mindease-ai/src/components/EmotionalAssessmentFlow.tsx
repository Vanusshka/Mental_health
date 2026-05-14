/**
 * EmotionalAssessmentFlow — with complete doctor-patient session persistence
 *
 * ALL mood paths (happy/neutral/sad) save sessions when doctor-initiated.
 * Patient context is read from URL params + PatientSessionContext (refresh-safe).
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearch } from "wouter";
import MoodSelectionCard from "@/components/MoodSelectionCard";
import ContextInputCard from "@/components/ContextInputCard";
import ContextResponseCard from "@/components/ContextResponseCard";
import ReflectionInputCard from "@/components/ReflectionInputCard";
import WellnessQuestionnaire from "@/components/WellnessQuestionnaire";
import AssessmentResultCard from "@/components/AssessmentResultCard";
import { useMood } from "@/contexts/MoodContext";
import type { MoodType } from "@/contexts/MoodContext";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientSession } from "@/contexts/PatientSessionContext";
import { saveCheckin, savePatientSession } from "@/services/supabaseService";
import { computeAssessmentLevel } from "@/services/doctorRecommendationService";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { EmotionResponse } from "@/services/emotionApi";

type Stage =
  | "mood-select"
  | "context-input"
  | "context-response"
  | "reflection"
  | "questionnaire"
  | "result";

const POSITIVE_STEPS = [
  { key: "mood-select",      label: "Check-In"  },
  { key: "context-input",    label: "Share"     },
  { key: "context-response", label: "Insights"  },
];

const SAD_STEPS = [
  { key: "mood-select",   label: "Check-In"   },
  { key: "reflection",    label: "Reflection" },
  { key: "questionnaire", label: "Assessment" },
  { key: "result",        label: "Summary"    },
];

function getSteps(selectedMood: NonNullable<MoodType> | null) {
  if (selectedMood === "sad") return SAD_STEPS;
  return POSITIVE_STEPS;
}

// ── Get next session number directly from Supabase ────────────────────────
async function fetchNextSessionNumber(patientId: string): Promise<number> {
  if (!isSupabaseConfigured) return 1;
  try {
    const { count } = await (supabase.from("patient_sessions") as any)
      .select("*", { count: "exact", head: true })
      .eq("patient_id", patientId);
    return (count ?? 0) + 1;
  } catch {
    return 1;
  }
}

// ── Build AI analysis string ───────────────────────────────────────────────
function buildAiAnalysis(
  mood: string, dominantEmotion: string,
  stressScore: number, wellnessScore: number,
  answers: { question: string; answer: string }[]
): string {
  const answerSummary = answers.length > 0
    ? answers.slice(0, 3).map(a => `${a.question}: ${a.answer}`).join(" | ")
    : "No questionnaire responses.";
  const stressTrend = stressScore > 65 ? "elevated stress" : stressScore > 40 ? "moderate stress" : "low stress";
  const wellnessTrend = wellnessScore >= 65 ? "positive wellbeing" : wellnessScore >= 45 ? "moderate wellbeing" : "needs support";
  return `Mood: ${mood}. Dominant: ${dominantEmotion}. Stress: ${stressScore}% (${stressTrend}). Wellness: ${wellnessScore}/100 (${wellnessTrend}). ${answerSummary}`;
}

// ── Indicators by mood ─────────────────────────────────────────────────────
function getIndicators(mood: string) {
  if (mood === "happy")   return { stress_score: 28, wellness_score: 78 };
  if (mood === "sad")     return { stress_score: 74, wellness_score: 42 };
  return                         { stress_score: 52, wellness_score: 63 };
}

export default function EmotionalAssessmentFlow() {
  const [stage, setStage]             = useState<Stage>("mood-select");
  const [selectedMood, setSelectedMood] = useState<NonNullable<MoodType> | null>(null);
  const [emotionResult, setEmotionResult] = useState<EmotionResponse | null>(null);
  const [userText, setUserText]       = useState("");
  const [contextText, setContextText] = useState("");
  const [reflection, setReflection]   = useState("");
  const [answers, setAnswers]         = useState<{ question: string; answer: string }[]>([]);
  const sessionSaved = useRef(false); // prevent double-save

  const { mood } = useMood();
  const { user } = useAuth();
  const { activeSession, clearSession } = usePatientSession();

  // Patient context: URL params take priority, then sessionStorage context
  const search = useSearch();
  const params = new URLSearchParams(search);
  const patientId  = params.get("patient_id")  ?? activeSession?.patient_id  ?? undefined;
  const doctorId   = params.get("doctor_id")   ?? activeSession?.doctor_id   ?? undefined;
  const workshopId = params.get("workshop_id") ?? undefined;
  const isDoctorFlow   = !!(patientId && doctorId);
  const isWorkshopFlow = !!workshopId;

  // ── Core save function — called from ALL completion paths ──────────────
  async function persistSession(
    finalMood: string,
    emotions: EmotionResponse["emotions"],
    finalReflection: string,
    finalAnswers: { question: string; answer: string }[]
  ) {
    if (sessionSaved.current) return; // prevent double-save
    sessionSaved.current = true;

    const dominant   = emotions[0] ?? { label: "neutral", score: 0 };
    const level      = computeAssessmentLevel(emotions);
    const indicators = getIndicators(finalMood);

    console.log("[MANAS] Saving session — patientId:", patientId, "doctorId:", doctorId, "isDoctorFlow:", isDoctorFlow);

    try {
      // Always save to emotional_checkins
      await saveCheckin({
        user_id:        user?.id,
        display_name:   user?.display_name ?? "Anonymous",
        email:          user?.email ?? "",
        mood:           finalMood as "happy" | "neutral" | "sad",
        emotions,
        reflection:     finalReflection,
        answers:        finalAnswers,
        patient_id:     patientId,
        doctor_id:      doctorId,
        workshop_id:    workshopId,
      });

      // Save workshop participant record
      if (isWorkshopFlow && workshopId) {
        const { addWorkshopParticipant } = await import("@/services/supabaseService");
        await addWorkshopParticipant(workshopId, finalMood as "happy"|"neutral"|"sad", indicators.stress_score);
        console.log("[MANAS] Workshop participant saved for workshop:", workshopId);
      }

      // Save to patient_sessions for doctor portal — ALL moods
      if (isDoctorFlow && patientId && doctorId) {
        const sessionNum = await fetchNextSessionNumber(patientId);
        const aiAnalysis = buildAiAnalysis(
          finalMood, dominant.label,
          indicators.stress_score, indicators.wellness_score,
          finalAnswers
        );

        console.log("[MANAS] Saving patient_session — session:", sessionNum);

        const result = await savePatientSession({
          patient_id:        patientId,
          doctor_id:         doctorId,
          session_number:    sessionNum,
          mood:              finalMood as "happy" | "neutral" | "sad",
          stress_score:      indicators.stress_score,
          wellness_score:    indicators.wellness_score,
          emotional_summary: `${dominant.label} (${Math.round(dominant.score * 100)}%)`,
          ai_analysis:       aiAnalysis,
          dominant_emotion:  dominant.label,
          assessment_level:  level,
          reflection:        finalReflection,
          answers:           finalAnswers,
        });

        console.log("[MANAS] patient_session saved:", result);
      }
    } catch (err) {
      console.error("[MANAS] Session save error:", err);
      sessionSaved.current = false; // allow retry
    }
  }

  // ── Stage handlers ─────────────────────────────────────────────────────

  function handleMoodSelected(result: EmotionResponse, text: string, moodId: NonNullable<MoodType>) {
    setEmotionResult(result);
    setUserText(text);
    setSelectedMood(moodId);
    sessionSaved.current = false; // reset for new assessment
    setStage(moodId === "sad" ? "reflection" : "context-input");
  }

  function handleContextSubmitted(text: string) {
    setContextText(text);
    setStage("context-response");
    // For doctor flows, save session when happy/neutral context is submitted
    if (isDoctorFlow && emotionResult && selectedMood) {
      persistSession(selectedMood, emotionResult.emotions, text, []);
    }
  }

  function handleReflectionComplete(reflectionText: string) {
    setReflection(reflectionText);
    setStage("questionnaire");
  }

  function handleReflectionSkip() {
    setReflection("");
    setStage("questionnaire");
  }

  async function handleQuestionnaireComplete(completedAnswers: { question: string; answer: string }[]) {
    setAnswers(completedAnswers);
    setStage("result");

    if (emotionResult && mood) {
      await persistSession(mood, emotionResult.emotions, reflection, completedAnswers);
    }
  }

  function handleReset() {
    setStage("mood-select");
    setSelectedMood(null);
    setEmotionResult(null);
    setUserText(""); setContextText(""); setReflection(""); setAnswers([]);
    sessionSaved.current = false;
  }

  // ── Stepper ────────────────────────────────────────────────────────────

  const steps = getSteps(selectedMood);
  const stageOrder = steps.map(s => s.key);
  const currentIdx = stageOrder.indexOf(stage);
  const displayIdx = currentIdx < 0 ? 0 : currentIdx;

  return (
    <div className="w-full">
      {/* Workshop session banner */}
      {isWorkshopFlow && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium"
          style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)", color: "#10b981" }}>
          🏢 Workshop emotional assessment — your results are anonymous
        </motion.div>
      )}

      {/* Doctor session banner */}
      {isDoctorFlow && activeSession && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium"
          style={{ background: "rgba(14,165,233,0.08)", border: "1px solid rgba(14,165,233,0.2)", color: "#0ea5e9" }}
        >
          🩺 Doctor-assisted session for <strong className="ml-1">{activeSession.patient_name}</strong>
          <span className="ml-auto opacity-60">Session #{activeSession.session_number}</span>
        </motion.div>
      )}

      {/* Progress stepper */}
      <div className="flex items-center justify-center gap-0 mb-10">
        {steps.map((step, i) => {
          const isDone   = i < displayIdx;
          const isActive = i === displayIdx;
          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center gap-1.5">
                <motion.div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold"
                  animate={{
                    background: isDone || isActive ? "hsl(var(--primary))" : "rgba(0,0,0,0.07)",
                    color:      isDone || isActive ? "#fff" : "rgba(0,0,0,0.35)",
                    scale:      isActive ? 1.12 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {isDone ? "✓" : i + 1}
                </motion.div>
                <span className="text-[10px] font-medium hidden sm:block transition-colors duration-300"
                  style={{ color: isActive ? "hsl(var(--foreground))" : "rgba(0,0,0,0.35)" }}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <motion.div className="w-10 sm:w-16 h-px mx-1 mb-4 rounded-full"
                  animate={{ background: i < displayIdx ? "hsl(var(--primary))" : "rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.5 }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Stage content */}
      <AnimatePresence mode="wait">
        {stage === "mood-select" && (
          <motion.div key="mood-select" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
            <MoodSelectionCard onComplete={handleMoodSelected} />
          </motion.div>
        )}

        {stage === "context-input" && selectedMood && selectedMood !== "sad" && (
          <motion.div key="context-input" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
            <ContextInputCard mood={selectedMood} onComplete={handleContextSubmitted} />
          </motion.div>
        )}

        {stage === "context-response" && selectedMood && selectedMood !== "sad" && (
          <motion.div key="context-response" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
            <ContextResponseCard
              mood={selectedMood}
              contextText={contextText}
              onReset={handleReset}
            />
          </motion.div>
        )}

        {stage === "reflection" && emotionResult && (
          <motion.div key="reflection" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
            <ReflectionInputCard
              dominantEmotion={emotionResult.emotions[0]?.label ?? "neutral"}
              mood={mood}
              onComplete={handleReflectionComplete}
              onSkip={handleReflectionSkip}
            />
          </motion.div>
        )}

        {stage === "questionnaire" && emotionResult && (
          <motion.div key="questionnaire" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
            <WellnessQuestionnaire
              userText={userText}
              reflection={reflection}
              emotions={emotionResult.emotions}
              onComplete={handleQuestionnaireComplete}
              onReset={handleReset}
            />
          </motion.div>
        )}

        {stage === "result" && emotionResult && (
          <motion.div key="result" initial={{ opacity:0, x:20 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-20 }} transition={{ duration:0.35, ease:[0.22,1,0.36,1] }}>
            <AssessmentResultCard
              emotions={emotionResult.emotions}
              answers={answers}
              onReset={handleReset}
              reflection={reflection}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
