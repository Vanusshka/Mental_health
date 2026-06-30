/**
 * MoodSelectionCard
 * ─────────────────────────────────────────────────────────────────────────
 * Stage 1 — Emotional Check-In
 *
 * Presents three large, visually rich mood cards (Happy / Neutral / Sad).
 * On selection:
 *   1. Sets the global mood theme (instant UI adaptation)
 *   2. Calls RoBERTa /analyze-mood with a representative text phrase
 *   3. Advances to the Reflection stage
 *
 * This is the entry point of the assessment — intentionally simple,
 * warm, and visually premium.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2 } from "lucide-react";
import { analyzeEmotion, type EmotionResponse } from "@/services/emotionApi";
import { useMood } from "@/contexts/MoodContext";
import type { MoodType } from "@/contexts/MoodContext";

interface MoodSelectionCardProps {
  onComplete: (result: EmotionResponse, text: string, selectedMood: NonNullable<MoodType>) => void;
}

// Representative phrases sent to RoBERTa for each mood selection
const MOOD_TEXTS: Record<NonNullable<MoodType>, string> = {
  happy:   "I feel happy, positive, and full of energy today. Things are going well.",
  neutral: "I feel okay today — balanced and steady, neither particularly high nor low.",
  sad:     "I feel sad, low, and emotionally drained. Things have been heavy lately.",
};

const MOODS: {
  id: NonNullable<MoodType>;
  emoji: string;
  label: string;
  description: string;
  gradient: string;
  glowColor: string;
  ringColor: string;
  bgFrom: string;
  bgTo: string;
  particleColor: string;
}[] = [
  {
    id: "happy",
    emoji: "😊",
    label: "Happy",
    description: "Feeling bright, positive, and energised",
    gradient: "from-yellow-400 via-orange-400 to-amber-400",
    glowColor: "rgba(251,191,36,0.35)",
    ringColor: "#fbbf24",
    bgFrom: "#fef3c7",
    bgTo: "#fed7aa",
    particleColor: "#fbbf24",
  },
  {
    id: "neutral",
    emoji: "😐",
    label: "Neutral",
    description: "Balanced and steady, neither high nor low",
    gradient: "from-sky-400 via-cyan-400 to-teal-400",
    glowColor: "rgba(56,189,248,0.3)",
    ringColor: "#38bdf8",
    bgFrom: "#e0f2fe",
    bgTo: "#d1fae5",
    particleColor: "#38bdf8",
  },
  {
    id: "sad",
    emoji: "😔",
    label: "Sad",
    description: "Feeling low, heavy, or emotionally drained",
    gradient: "from-indigo-400 via-violet-400 to-purple-500",
    glowColor: "rgba(129,140,248,0.3)",
    ringColor: "#818cf8",
    bgFrom: "#ede9fe",
    bgTo: "#bfdbfe",
    particleColor: "#818cf8",
  },
];

export default function MoodSelectionCard({ onComplete }: MoodSelectionCardProps) {
  const [selected, setSelected] = useState<NonNullable<MoodType> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setMood, theme } = useMood();

  async function handleSelect(moodId: NonNullable<MoodType>) {
    if (isAnalyzing) return;
    setSelected(moodId);
    setError(null);

    // Immediately apply the mood theme for instant visual feedback
    setMood(moodId);

    // Short delay so the selection animation plays before the loading state
    await new Promise((r) => setTimeout(r, 380));

    setIsAnalyzing(true);
    try {
      const text = MOOD_TEXTS[moodId];
      const result = await analyzeEmotion(text);
      onComplete(result, text, moodId);
    } finally {
      setIsAnalyzing(false);
    }
  }

  const accentColor = theme?.accent ?? "hsl(var(--primary))";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
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
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: accentColor }} />
          <span>Emotional Wellness Assessment</span>
        </motion.div>

        <motion.h2
          className="text-3xl md:text-4xl font-semibold tracking-tight mb-3 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          How are you feeling today?
        </motion.h2>

        <motion.p
          className="text-muted-foreground text-sm md:text-base max-w-md mx-auto leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
        >
          Select the mood that best reflects your current emotional state.
          This will personalise your entire wellness assessment.
        </motion.p>
      </div>

      {/* ── Mood cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {MOODS.map((mood, i) => {
          const isSelected = selected === mood.id;
          const isDisabled = isAnalyzing && !isSelected;

          // Directional entrance: happy from left, neutral scale up, sad from right
          const initialX = mood.id === "happy" ? -40 : mood.id === "sad" ? 40 : 0;
          const initialScale = mood.id === "neutral" ? 0.92 : 1;

          return (
            <motion.button
              key={mood.id}
              onClick={() => handleSelect(mood.id)}
              disabled={isAnalyzing}
              initial={{ opacity: 0, x: initialX, y: mood.id === "neutral" ? 16 : 24, scale: initialScale, filter: "blur(4px)" }}
              animate={{ opacity: 1, x: 0, y: 0, scale: 1, filter: "blur(0px)" }}
              transition={{
                delay: 0.18 + i * 0.11,
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={!isAnalyzing ? { y: -6, scale: 1.02, transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1] } } : {}}
              whileTap={!isAnalyzing ? { scale: 0.97, transition: { duration: 0.12 } } : {}}
              className="relative rounded-3xl p-7 text-left overflow-hidden cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={
                isSelected
                  ? {
                      background: `linear-gradient(145deg, ${mood.bgFrom}40, white 75%)`,
                      boxShadow: `0 20px 60px ${mood.glowColor}, 0 0 0 2px ${mood.ringColor}70`,
                      border: `2px solid ${mood.ringColor}60`,
                      opacity: 1,
                      transition: "box-shadow 0.5s ease, border-color 0.4s ease",
                    }
                  : {
                      background: "rgba(255,255,255,0.55)",
                      backdropFilter: "blur(16px)",
                      border: "1.5px solid rgba(255,255,255,0.5)",
                      boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
                      opacity: isDisabled ? 0.45 : 1,
                      transition: "opacity 0.3s ease, box-shadow 0.35s ease",
                    }
              }
              aria-label={`Select mood: ${mood.label}`}
              aria-pressed={isSelected}
            >
              {/* Background glow blob on selected */}
              {isSelected && (
                <motion.div
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: `radial-gradient(ellipse at 30% 20%, ${mood.bgFrom}80, transparent 65%)`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                />
              )}

              {/* Floating particles on selected */}
              {isSelected && (
                <>
                  {[0, 1, 2].map((p) => (
                    <motion.div
                      key={p}
                      className="absolute w-1.5 h-1.5 rounded-full pointer-events-none"
                      style={{
                        background: mood.particleColor,
                        left: `${20 + p * 25}%`,
                        top: `${15 + p * 20}%`,
                        opacity: 0,
                      }}
                      animate={{ opacity: [0, 0.6, 0], y: [0, -20, -40], scale: [0.8, 1.2, 0.5] }}
                      transition={{ duration: 2.5, repeat: Infinity, delay: p * 0.6, ease: "easeOut" }}
                    />
                  ))}
                </>
              )}

              {/* Emoji */}
              <motion.div
                className="text-6xl mb-5 relative z-10 select-none"
                animate={isSelected ? { scale: [1, 1.12, 1] } : { scale: 1 }}
                transition={{ duration: 2.2, repeat: isSelected ? Infinity : 0, ease: "easeInOut" }}
              >
                {isSelected && isAnalyzing ? (
                  <div className="w-16 h-16 flex items-center justify-center">
                    <Loader2
                      size={36}
                      className="animate-spin"
                      style={{ color: mood.ringColor }}
                    />
                  </div>
                ) : (
                  mood.emoji
                )}
              </motion.div>

              {/* Label + description */}
              <div className="relative z-10">
                <p
                  className={`text-xl font-bold mb-1.5 bg-gradient-to-r ${mood.gradient} bg-clip-text text-transparent`}
                >
                  {mood.label}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {mood.description}
                </p>
              </div>

              {/* Selected checkmark */}
              <AnimatePresence>
                {isSelected && !isAnalyzing && (
                  <motion.div
                    className={`absolute top-4 right-4 w-7 h-7 rounded-full bg-gradient-to-br ${mood.gradient} flex items-center justify-center shadow-md`}
                    initial={{ scale: 0, rotate: -90 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-white" />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Bottom shimmer bar on selected */}
              {isSelected && (
                <motion.div
                  className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl bg-gradient-to-r ${mood.gradient}`}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {/* ── Analysing indicator ─────────────────────────────────────── */}
      <AnimatePresence>
        {isAnalyzing && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex flex-col items-center gap-3 mb-4"
          >
            <p className="text-sm text-muted-foreground">
              Detecting emotional patterns…
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
            className="flex items-start gap-3 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3"
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
        transition={{ delay: 0.6 }}
      >
        Your responses are processed privately and never stored or shared.
      </motion.p>
    </motion.div>
  );
}
