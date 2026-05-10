/**
 * GuidedReflectionSection
 * ─────────────────────────────────────────────────────────────────────────
 * Stage A + B of the Emotional Wellness Assessment:
 *   A. Greeting — "How has your day been so far?"
 *   B. Emotion Detection — user writes, RoBERTa analyses, UI adapts
 *
 * This is NOT a chatbot. It is the opening stage of a structured
 * psychological wellness assessment.
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeEmotion, type EmotionResponse } from "@/services/emotionApi";
import { useMood } from "@/contexts/MoodContext";
import { emotionToMoodType, getDominantEmotion } from "@/utils/emotionTheme";

interface GuidedReflectionSectionProps {
  onComplete: (result: EmotionResponse, text: string) => void;
}

const PROMPTS = [
  "I've been feeling overwhelmed and can't seem to catch a break…",
  "Today felt heavy. I'm not sure why, but something feels off…",
  "I feel disconnected from people around me lately…",
  "Things have been going well — I feel calm and focused today.",
  "I'm exhausted, both mentally and physically…",
];

export default function GuidedReflectionSection({ onComplete }: GuidedReflectionSectionProps) {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const { setMood, theme } = useMood();
  const placeholderIdx = useRef(Math.floor(Math.random() * PROMPTS.length));

  const canSubmit = text.trim().length >= 10 && !isAnalyzing;
  const accentColor = theme?.accent ?? "hsl(var(--primary))";

  async function handleBeginAssessment() {
    if (!canSubmit) return;
    setError(null);
    setIsAnalyzing(true);
    try {
      const result = await analyzeEmotion(text.trim());
      const dominant = getDominantEmotion(result.emotions);
      if (dominant) setMood(emotionToMoodType(dominant.label));
      onComplete(result, text.trim());
    } catch (err) {
      setError(
        err instanceof Error && err.message.includes("fetch")
          ? "Unable to reach the analysis server. Please ensure the backend is running on port 8000."
          : "Emotion analysis failed. Please try again."
      );
    } finally {
      setIsAnalyzing(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleBeginAssessment();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* ── Section header ─────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium mb-6"
          style={{
            background: theme ? `${theme.bg1}50` : "rgba(99,102,241,0.07)",
            borderColor: theme ? `${theme.accent}30` : "rgba(99,102,241,0.18)",
            color: accentColor,
          }}
        >
          <Brain size={13} />
          <span>Emotional Wellness Assessment</span>
        </motion.div>

        <motion.h2
          className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          How has your day been so far?
        </motion.h2>

        <motion.p
          className="text-muted-foreground text-sm md:text-base max-w-lg mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Take a moment to describe how you're feeling. Your response will be
          used to personalise your emotional wellness assessment.
        </motion.p>
      </div>

      {/* ── Text input ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="relative rounded-2xl overflow-hidden transition-all duration-400"
        style={{
          boxShadow: isFocused
            ? `0 0 0 2px ${accentColor}50, 0 16px 48px rgba(0,0,0,0.07)`
            : "0 4px 24px rgba(0,0,0,0.05)",
        }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${isFocused ? `${accentColor}40` : "rgba(255,255,255,0.5)"}`,
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={PROMPTS[placeholderIdx.current]}
            rows={5}
            disabled={isAnalyzing}
            className="w-full resize-none bg-transparent px-6 pt-6 pb-4 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none leading-relaxed disabled:opacity-50"
            aria-label="Describe how you are feeling today"
          />
          <div className="flex items-center justify-between px-6 pb-5 pt-1">
            <span className="text-xs text-muted-foreground/40 select-none">
              {text.length >= 10
                ? `${text.length} characters · Ctrl+Enter to begin`
                : "Write at least a sentence to begin your assessment"}
            </span>
            <Button
              onClick={handleBeginAssessment}
              disabled={!canSubmit}
              size="sm"
              className="rounded-full px-6 gap-2 text-white border-0 hover:opacity-90 transition-opacity shadow-md disabled:opacity-35"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${theme?.particle1 ?? "hsl(var(--secondary))"})`,
              }}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Analysing…</span>
                </>
              ) : (
                <span>Begin Assessment</span>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Analysing state ────────────────────────────────────────── */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-6 flex flex-col items-center gap-3"
          >
            <p className="text-sm text-muted-foreground">
              Detecting emotional patterns in your response…
            </p>
            <div className="flex gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ background: accentColor }}
                  animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
                  transition={{ duration: 1.3, repeat: Infinity, delay: i * 0.18, ease: "easeInOut" }}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-start gap-3 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3"
          >
            <AlertCircle size={15} className="text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Privacy note ───────────────────────────────────────────── */}
      <motion.p
        className="text-center text-xs text-muted-foreground/40 mt-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Your responses are processed privately and never stored or shared.
      </motion.p>
    </motion.div>
  );
}
