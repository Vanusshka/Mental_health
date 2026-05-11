/**
 * EmotionalAssessmentFlow
 * ─────────────────────────────────────────────────────────────────────────
 * Top-level orchestrator for the emotionally adaptive wellness experience.
 *
 * THREE DISTINCT PATHS — each emotionally appropriate:
 *
 *   HAPPY   → context-input → context-response  (celebratory, personalised)
 *   NEUTRAL → context-input → context-response  (supportive, personalised)
 *   SAD     → reflection → questionnaire → result → [doctor recommendations]
 *
 * Happy and neutral users:
 *   1. Are asked WHAT is behind their mood (ContextInputCard)
 *   2. Receive a Gemini-generated, context-specific response (ContextResponseCard)
 *   3. NEVER see questionnaires, assessments, or clinical flows
 *
 * Distressed users receive the full structured assessment flow.
 *
 * Routing uses the moodId passed directly from MoodSelectionCard —
 * never reads from useMood() context (which is async/stale at routing time).
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MoodSelectionCard from "@/components/MoodSelectionCard";
import ContextInputCard from "@/components/ContextInputCard";
import ContextResponseCard from "@/components/ContextResponseCard";
import ReflectionInputCard from "@/components/ReflectionInputCard";
import WellnessQuestionnaire from "@/components/WellnessQuestionnaire";
import AssessmentResultCard from "@/components/AssessmentResultCard";
import { useMood } from "@/contexts/MoodContext";
import type { MoodType } from "@/contexts/MoodContext";
import { useAuth } from "@/contexts/AuthContext";
import { saveCheckin } from "@/services/supabaseService";
import { computeAssessmentLevel } from "@/services/doctorRecommendationService";
import type { EmotionResponse } from "@/services/emotionApi";

// ── Stage types ────────────────────────────────────────────────────────────

type Stage =
  | "mood-select"       // Step 1 — always shown
  | "context-input"     // Happy/Neutral: ask what is behind the mood
  | "context-response"  // Happy/Neutral: show Gemini personalised response
  | "reflection"        // Sad: deep reflection prompt
  | "questionnaire"     // Sad: Gemini-generated questions
  | "result";           // Sad: wellness summary + doctor recommendations

// ── Stepper configs ────────────────────────────────────────────────────────

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
  return POSITIVE_STEPS; // happy and neutral both use the 3-step positive path
}

// ── Component ──────────────────────────────────────────────────────────────

export default function EmotionalAssessmentFlow() {
  const [stage, setStage]               = useState<Stage>("mood-select");
  const [selectedMood, setSelectedMood] = useState<NonNullable<MoodType> | null>(null);
  const [emotionResult, setEmotionResult] = useState<EmotionResponse | null>(null);
  const [userText, setUserText]         = useState("");
  const [contextText, setContextText]   = useState("");
  const [reflection, setReflection]     = useState("");
  const [answers, setAnswers]           = useState<{ question: string; answer: string }[]>([]);
  const { mood } = useMood();
  const { user } = useAuth();

  // ── Stage routing ──────────────────────────────────────────────────────
  // IMPORTANT: routing uses `moodId` passed directly from MoodSelectionCard,
  // NOT from useMood() — React state updates are async and mood would be
  // stale/null at this point in the render cycle.

  function handleMoodSelected(result: EmotionResponse, text: string, moodId: NonNullable<MoodType>) {
    setEmotionResult(result);
    setUserText(text);
    setSelectedMood(moodId);

    if (moodId === "sad") {
      setStage("reflection");
    } else {
      // happy and neutral → ask for context first
      setStage("context-input");
    }
  }

  function handleContextSubmitted(text: string) {
    setContextText(text);
    setStage("context-response");
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

    // Save to Supabase (non-blocking)
    if (emotionResult && mood) {
      try {
        await saveCheckin({
          user_id:      user?.id,
          display_name: user?.display_name ?? "Anonymous",
          email:        user?.email ?? "",
          mood:         mood as "happy" | "neutral" | "sad",
          emotions:     emotionResult.emotions,
          reflection,
          answers:      completedAnswers,
        });
      } catch (err) {
        console.warn("[MindEase] Supabase save failed:", err);
      }
    }
  }

  function handleReset() {
    setStage("mood-select");
    setSelectedMood(null);
    setEmotionResult(null);
    setUserText("");
    setContextText("");
    setReflection("");
    setAnswers([]);
  }

  // ── Stepper ────────────────────────────────────────────────────────────

  const steps = getSteps(selectedMood);
  const stageOrder = steps.map((s) => s.key);
  const currentIdx = stageOrder.indexOf(stage);
  const displayIdx = currentIdx < 0 ? 0 : currentIdx;

  return (
    <div className="w-full">
      {/* ── Progress stepper ──────────────────────────────────────── */}
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
                    color:      isDone || isActive ? "#fff"                 : "rgba(0,0,0,0.35)",
                    scale:      isActive ? 1.12 : 1,
                  }}
                  transition={{ duration: 0.4 }}
                >
                  {isDone ? "✓" : i + 1}
                </motion.div>
                <span
                  className="text-[10px] font-medium hidden sm:block transition-colors duration-300"
                  style={{ color: isActive ? "hsl(var(--foreground))" : "rgba(0,0,0,0.35)" }}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <motion.div
                  className="w-10 sm:w-16 h-px mx-1 mb-4 rounded-full"
                  animate={{ background: i < displayIdx ? "hsl(var(--primary))" : "rgba(0,0,0,0.1)" }}
                  transition={{ duration: 0.5 }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── Stage content ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">

        {/* Step 1: Mood selection — all paths */}
        {stage === "mood-select" && (
          <motion.div key="mood-select"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <MoodSelectionCard onComplete={handleMoodSelected} />
          </motion.div>
        )}

        {/* Happy/Neutral Step 2: Ask for context */}
        {stage === "context-input" && selectedMood && selectedMood !== "sad" && (
          <motion.div key="context-input"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ContextInputCard
              mood={selectedMood}
              onComplete={handleContextSubmitted}
            />
          </motion.div>
        )}

        {/* Happy/Neutral Step 3: Gemini personalised response */}
        {stage === "context-response" && selectedMood && selectedMood !== "sad" && (
          <motion.div key="context-response"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ContextResponseCard
              mood={selectedMood}
              contextText={contextText}
              onReset={handleReset}
            />
          </motion.div>
        )}

        {/* Sad Step 2: Reflection */}
        {stage === "reflection" && emotionResult && (
          <motion.div key="reflection"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <ReflectionInputCard
              dominantEmotion={emotionResult.emotions[0]?.label ?? "neutral"}
              mood={mood}
              onComplete={handleReflectionComplete}
              onSkip={handleReflectionSkip}
            />
          </motion.div>
        )}

        {/* Sad Step 3: Questionnaire */}
        {stage === "questionnaire" && emotionResult && (
          <motion.div key="questionnaire"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <WellnessQuestionnaire
              userText={userText}
              reflection={reflection}
              emotions={emotionResult.emotions}
              onComplete={handleQuestionnaireComplete}
              onReset={handleReset}
            />
          </motion.div>
        )}

        {/* Sad Step 4: Result + doctor recommendations */}
        {stage === "result" && emotionResult && (
          <motion.div key="result"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <AssessmentResultCard
              emotions={emotionResult.emotions}
              answers={answers}
              onReset={handleReset}
            />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
