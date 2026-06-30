/**
 * ReflectionInputCard
 * ─────────────────────────────────────────────────────────────────────────
 * Stage C — Emotional Reflection Stage
 *
 * Shown after emotion detection when distress signals are present.
 * Invites the user to share more context in a calm, reflective space.
 * This is NOT a chatbot reply — it is a structured reflection prompt
 * that deepens the assessment before the questionnaire begins.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMood } from "@/contexts/MoodContext";
import type { MoodType } from "@/contexts/MoodContext";

interface ReflectionInputCardProps {
  dominantEmotion: string;
  mood: MoodType;
  onComplete: (reflection: string) => void;
  onSkip: () => void;
}

// Reflection prompts tailored to emotional state
const REFLECTION_CONFIG: Record<
  string,
  { title: string; description: string; placeholder: string; prompts: string[] }
> = {
  sad: {
    title: "Help Us Understand Your Emotional State Better",
    description:
      "Take a moment to share what may be contributing to how you've been feeling recently. There's no right or wrong — this space is entirely yours.",
    placeholder:
      "What has been affecting your emotions lately? You can share as much or as little as you'd like…",
    prompts: [
      "What has been weighing on your mind recently?",
      "Have there been any specific events affecting how you feel?",
      "How long have you been experiencing these feelings?",
    ],
  },
  neutral: {
    title: "Tell Us More About Your Current State",
    description:
      "A balanced emotional state can still carry underlying patterns worth exploring. Share what's been on your mind.",
    placeholder:
      "Describe what your days have been like recently — emotionally, mentally, or physically…",
    prompts: [
      "What does a typical day feel like for you right now?",
      "Are there areas of your life feeling more challenging than usual?",
      "What would feeling better look like for you?",
    ],
  },
  happy: {
    title: "Reflect on What's Fuelling Your Wellbeing",
    description:
      "Understanding what contributes to positive emotional states helps build lasting wellness patterns.",
    placeholder:
      "What's been going well? What's contributing to your positive state today?",
    prompts: [
      "What has been bringing you energy and positivity lately?",
      "Are there habits or routines supporting your wellbeing?",
      "What would you like to build on from this positive state?",
    ],
  },
};

export default function ReflectionInputCard({
  dominantEmotion,
  mood,
  onComplete,
  onSkip,
}: ReflectionInputCardProps) {
  const [reflection, setReflection] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const { theme } = useMood();

  const config = REFLECTION_CONFIG[mood ?? "neutral"] ?? REFLECTION_CONFIG.neutral;
  const accentColor = theme?.accent ?? "hsl(var(--primary))";
  const canContinue = reflection.trim().length >= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="mb-7">
        <div className="flex items-center gap-2.5 mb-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${accentColor}18` }}
          >
            <Heart size={15} style={{ color: accentColor }} />
          </div>
          <div
            className="h-px flex-1 rounded-full"
            style={{ background: `${accentColor}20` }}
          />
          <span
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: accentColor }}
          >
            Emotional Reflection
          </span>
          <div
            className="h-px flex-1 rounded-full"
            style={{ background: `${accentColor}20` }}
          />
        </div>

        <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-3 leading-snug">
          {config.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-lg">
          {config.description}
        </p>
      </div>

      {/* ── Reflection prompts — read-only guidance, not interactive ── */}
      <motion.div
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.09, delayChildren: 0.2 } },
        }}
      >
        {config.prompts.map((prompt, i) => (
          <motion.div
            key={i}
            variants={{
              hidden:  { opacity: 0, y: 10, filter: "blur(3px)" },
              visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
            }}
            className="text-left text-xs text-muted-foreground/70 px-3.5 py-2.5 rounded-xl border select-none"
            style={{
              background: "rgba(255,255,255,0.4)",
              borderColor: "rgba(255,255,255,0.45)",
              backdropFilter: "blur(12px)",
              cursor: "default",
              userSelect: "none",
            }}
          >
            {prompt}
          </motion.div>
        ))}
      </motion.div>

      {/* ── Reflection textarea ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl overflow-hidden mb-5 transition-all duration-300"
        style={{
          boxShadow: isFocused
            ? `0 0 0 2px ${accentColor}45, 0 12px 40px rgba(0,0,0,0.06)`
            : "0 4px 20px rgba(0,0,0,0.04)",
        }}
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${isFocused ? `${accentColor}35` : "rgba(255,255,255,0.5)"}`,
          }}
        >
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={config.placeholder}
            rows={5}
            className="w-full resize-none bg-transparent px-5 pt-5 pb-3 text-sm text-foreground placeholder:text-muted-foreground/45 focus:outline-none leading-relaxed"
            aria-label="Emotional reflection input"
          />
          <div className="px-5 pb-4 flex justify-end">
            <span className="text-xs text-muted-foreground/35">
              {reflection.length > 0 ? `${reflection.length} characters` : "Share as much as you're comfortable with"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── Actions ────────────────────────────────────────────────── */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <Button
            onClick={() => onComplete(reflection.trim())}
            disabled={!canContinue}
            size="lg"
            className="flex-1 rounded-full gap-2 text-white border-0 hover:opacity-90 transition-opacity disabled:opacity-35"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${theme?.particle1 ?? "hsl(var(--secondary))"})`,
              boxShadow: theme ? `0 8px 28px ${theme.glow}` : undefined,
            }}
          >
            Continue to Assessment
            <ChevronRight size={16} />
          </Button>
          <Button
            variant="ghost"
            size="lg"
            onClick={onSkip}
            className="rounded-full text-muted-foreground hover:text-foreground transition-colors px-6"
          >
            Skip Reflection
          </Button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
