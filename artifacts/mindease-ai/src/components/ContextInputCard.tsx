/**
 * ContextInputCard
 * ─────────────────────────────────────────────────────────────────────────
 * Step 2 for Happy and Neutral paths.
 *
 * Asks the user a warm, reflective question about WHAT is behind their mood.
 * This context is then sent to Gemini to generate a personalised response.
 *
 * Happy prompt:  "What has been making you feel happy recently?"
 * Neutral prompt: "How has your routine been lately?"
 *
 * Tone: warm · inviting · emotionally safe · never clinical
 * No questionnaire. No assessment. Just a single reflective input.
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMood } from "@/contexts/MoodContext";

interface ContextInputCardProps {
  mood: "happy" | "neutral";
  onComplete: (contextText: string) => void;
}

// ── Mood-specific copy ─────────────────────────────────────────────────────

const COPY = {
  happy: {
    badge:       "Positive Emotional State",
    emoji:       "✨",
    question:    "What has been making you feel happy recently?",
    subtext:     "Share the moments, people, or experiences that brought you joy. Your response will help us celebrate with you in a way that truly feels personal.",
    placeholder: "I was blessed with a baby boy and also received a hike at work…",
    buttonLabel: "Share My Happiness",
    loadingText: "Crafting your personalised response…",
  },
  neutral: {
    badge:       "Balanced Emotional State",
    emoji:       "🌊",
    question:    "How has your routine been lately?",
    subtext:     "Share a little about your current days — emotionally, mentally, or in your daily life. This helps us offer guidance that actually fits your situation.",
    placeholder: "Work has been repetitive and I feel mentally tired sometimes…",
    buttonLabel: "Share My Experience",
    loadingText: "Preparing your personalised wellness guidance…",
  },
} as const;

const PROMPT_CHIPS = {
  happy: [
    "Something wonderful happened at work",
    "A special family moment",
    "I achieved a personal goal",
    "I feel grateful for someone",
  ],
  neutral: [
    "Work has been repetitive lately",
    "I feel a bit mentally tired",
    "My routine feels a little flat",
    "I want to feel more motivated",
  ],
};

export default function ContextInputCard({ mood, onComplete }: ContextInputCardProps) {
  const [text, setText]         = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef             = useRef<HTMLTextAreaElement>(null);
  const { theme }               = useMood();

  const copy        = COPY[mood];
  const chips       = PROMPT_CHIPS[mood];
  const accentColor = theme?.accent ?? (mood === "happy" ? "#f97316" : "#0ea5e9");
  const glow        = theme?.glow   ?? "rgba(99,102,241,0.2)";
  const canSubmit   = text.trim().length >= 5 && !isLoading;

  function handleChipClick(chip: string) {
    setText(chip + " ");
    textareaRef.current?.focus();
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    setIsLoading(true);
    try {
      onComplete(text.trim());
    } catch {
      setError("Something went wrong. Please try again.");
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
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
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="text-center mb-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-medium mb-5"
          style={{
            background: theme ? `${theme.bg1}50` : `${accentColor}10`,
            borderColor: `${accentColor}30`,
            color: accentColor,
          }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
          <span>{copy.badge}</span>
        </motion.div>

        <motion.div
          className="text-5xl mb-4 select-none"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
        >
          {copy.emoji}
        </motion.div>

        <motion.h2
          className="text-2xl md:text-3xl font-semibold tracking-tight mb-3 leading-snug"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {copy.question}
        </motion.h2>

        <motion.p
          className="text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.28 }}
        >
          {copy.subtext}
        </motion.p>
      </div>

      {/* ── Quick-start chips ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.32 }}
        className="flex flex-wrap gap-2 justify-center mb-5"
      >
        {chips.map((chip: string, i: number) => (
          <motion.button
            key={chip}
            onClick={() => handleChipClick(chip)}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 + i * 0.06 }}
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            className="text-xs px-3.5 py-1.5 rounded-full border transition-all duration-200"
            style={{
              background: "rgba(255,255,255,0.55)",
              backdropFilter: "blur(12px)",
              borderColor: "rgba(255,255,255,0.5)",
              color: "hsl(var(--muted-foreground))",
            }}
          >
            {chip}
          </motion.button>
        ))}
      </motion.div>

      {/* ── Text input ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="rounded-2xl overflow-hidden mb-4 transition-all duration-300"
        style={{
          boxShadow: isFocused
            ? `0 0 0 2px ${accentColor}50, 0 12px 40px rgba(0,0,0,0.06)`
            : "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.65)",
            backdropFilter: "blur(20px)",
            border: `1.5px solid ${isFocused ? `${accentColor}45` : "rgba(255,255,255,0.55)"}`,
          }}
        >
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={copy.placeholder}
            rows={4}
            disabled={isLoading}
            className="w-full resize-none bg-transparent px-5 pt-5 pb-3 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none leading-relaxed disabled:opacity-50"
            aria-label={copy.question}
          />
          <div className="flex items-center justify-between px-5 pb-4 pt-1">
            <span className="text-xs text-muted-foreground/35 select-none">
              {text.length > 0 ? `${text.length} characters · Ctrl+Enter to continue` : "Share as much or as little as you'd like"}
            </span>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              size="sm"
              className="rounded-full px-5 gap-2 text-white border-0 hover:opacity-90 transition-opacity shadow-md disabled:opacity-35"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${theme?.particle1 ?? accentColor})`,
                boxShadow: canSubmit ? `0 4px 16px ${glow}` : undefined,
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Generating…</span>
                </>
              ) : (
                <>
                  <Send size={14} />
                  <span>{copy.buttonLabel}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* ── Loading state ─────────────────────────────────────────── */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3 py-4"
          >
            <p className="text-sm text-muted-foreground">{copy.loadingText}</p>
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

      {/* ── Error ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3"
          >
            <AlertCircle size={14} className="text-destructive mt-0.5 flex-shrink-0" />
            <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Privacy note ──────────────────────────────────────────── */}
      <motion.p
        className="text-center text-xs text-muted-foreground/40 mt-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
      >
        Your response is processed privately and never stored or shared.
      </motion.p>
    </motion.div>
  );
}
