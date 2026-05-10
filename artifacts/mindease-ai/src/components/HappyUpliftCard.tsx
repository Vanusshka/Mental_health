/**
 * HappyUpliftCard
 * ─────────────────────────────────────────────────────────────────────────
 * Shown when the user selects Happy / Joyful / Positive.
 *
 * This is NOT an assessment. It is a warm, celebratory emotional experience
 * that honours the user's positive state and gently reinforces it.
 *
 * Tone: warm · celebratory · encouraging · emotionally rewarding
 * Never: clinical · mechanical · motivational-poster generic
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { Sparkles, Heart, Sun, ArrowRight, RefreshCw, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMood } from "@/contexts/MoodContext";

interface HappyUpliftCardProps {
  onReset: () => void;
}

const GRATITUDE_PRACTICES = [
  {
    icon: "✍️",
    title: "Anchor This Feeling",
    body: "Write down three specific things that are contributing to your happiness today. This practice builds emotional memory and helps you return to this state more easily.",
  },
  {
    icon: "🌱",
    title: "Share Your Light",
    body: "Positive emotions are genuinely contagious. Reaching out to someone you care about today — even briefly — amplifies your own joy and strengthens your connections.",
  },
  {
    icon: "🛡️",
    title: "Build While You're Strong",
    body: "Positive emotional states are the ideal time to build resilience habits. A small daily wellness practice established now will serve you deeply during harder days.",
  },
  {
    icon: "🌊",
    title: "Let It Flow Naturally",
    body: "You don't need to hold onto happiness tightly. Trust that this feeling is a natural part of your emotional rhythm — and that it will return whenever you nurture it.",
  },
];

const AFFIRMATIONS = [
  "May you continue carrying this happiness through every stage of life.",
  "Your positive energy is a gift — to yourself and to everyone around you.",
  "Wishing you continued emotional peace, growth, and joyful moments ahead.",
  "This happiness you feel today is a reflection of the care you've given yourself.",
];

export default function HappyUpliftCard({ onReset }: HappyUpliftCardProps) {
  const { theme } = useMood();
  const accentColor = theme?.accent ?? "#f97316";
  const glow = theme?.glow ?? "rgba(251,191,36,0.3)";

  // Pick a random affirmation on each render
  const affirmation = AFFIRMATIONS[Math.floor(Math.random() * AFFIRMATIONS.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-5"
    >
      {/* ── Celebration header ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center relative overflow-hidden rounded-3xl p-8"
        style={{
          background: theme
            ? `linear-gradient(145deg, ${theme.bg1}80, ${theme.bg2}60, ${theme.bg3}40)`
            : "linear-gradient(145deg, #fef3c780, #fde68a60, #fed7aa40)",
          border: `1px solid ${accentColor}30`,
          boxShadow: `0 8px 40px ${glow}`,
        }}
      >
        {/* Floating sparkles */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.div
            key={i}
            className="absolute pointer-events-none"
            style={{
              left: `${10 + i * 18}%`,
              top: `${8 + (i % 3) * 22}%`,
              color: accentColor,
              opacity: 0,
            }}
            animate={{ opacity: [0, 0.7, 0], y: [0, -18, -36], scale: [0.8, 1.2, 0.5] }}
            transition={{ duration: 3, repeat: Infinity, delay: i * 0.7, ease: "easeOut" }}
          >
            <Star size={10} fill="currentColor" />
          </motion.div>
        ))}

        <motion.div
          className="text-6xl mb-4 select-none"
          animate={{ scale: [1, 1.1, 1], rotate: [0, 3, -3, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          ✨
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4"
          style={{
            background: `${accentColor}18`,
            border: `1px solid ${accentColor}35`,
            color: accentColor,
          }}
        >
          <Sparkles size={12} />
          <span>Positive Emotional State Detected</span>
        </motion.div>

        <motion.h2
          className="text-2xl md:text-3xl font-semibold tracking-tight mb-3 leading-snug"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          I'm truly glad you're feeling happy today.
        </motion.h2>

        <motion.p
          className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          It's wonderful to see you in a positive emotional state. Your wellbeing matters deeply —
          and moments like this are worth honouring.
        </motion.p>
      </motion.div>

      {/* ── Affirmation card ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-5 text-center relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(16px)",
          border: `1px solid ${accentColor}20`,
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart size={14} style={{ color: accentColor }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
            A Thought for You
          </span>
          <Heart size={14} style={{ color: accentColor }} />
        </div>
        <p className="text-base font-medium leading-relaxed text-foreground/80 italic">
          "{affirmation}"
        </p>
      </motion.div>

      {/* ── Gratitude & resilience practices ─────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.38 }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3 flex items-center gap-2">
          <Sun size={13} />
          Ways to Honour and Sustain This Feeling
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          {GRATITUDE_PRACTICES.map((practice, i) => (
            <motion.div
              key={practice.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 + i * 0.08, duration: 0.45 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-2xl p-4 transition-all duration-300 hover:shadow-md"
              style={{
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            >
              <div className="text-2xl mb-2">{practice.icon}</div>
              <h4 className="text-sm font-semibold mb-1.5 leading-snug">{practice.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{practice.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Emotional resilience note ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-2xl p-5"
        style={{
          background: `${accentColor}08`,
          border: `1px solid ${accentColor}20`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${accentColor}18` }}
          >
            <Sparkles size={14} style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: accentColor }}>
              Emotional Resilience Reminder
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Happiness is not a destination — it's a practice. The awareness you're showing today
              by checking in on your emotional state is itself a powerful act of self-care.
              Continue nurturing this relationship with yourself.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── CTAs ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link href="/dashboard" className="flex-1">
          <Button
            size="lg"
            className="w-full rounded-full gap-2 text-white border-0 hover:opacity-90 transition-opacity"
            style={{
              background: theme
                ? `linear-gradient(135deg, ${theme.particle1}, ${theme.accent})`
                : "linear-gradient(135deg, #fbbf24, #f97316)",
              boxShadow: `0 8px 28px ${glow}`,
            }}
          >
            View Your Wellness Dashboard
            <ArrowRight size={15} />
          </Button>
        </Link>
        <Button
          variant="outline"
          size="lg"
          onClick={onReset}
          className="rounded-full gap-2 border-border hover:bg-primary/5"
        >
          <RefreshCw size={14} />
          Check In Again
        </Button>
      </motion.div>

      {/* ── Closing warmth ────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
        className="text-center text-xs text-muted-foreground/50 leading-relaxed"
      >
        MANAS is here with you — in every emotional season. 🌸
      </motion.p>
    </motion.div>
  );
}
