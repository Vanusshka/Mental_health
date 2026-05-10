/**
 * NeutralGuidanceCard
 * ─────────────────────────────────────────────────────────────────────────
 * Shown when the user selects Neutral / Okay / Balanced.
 *
 * This is NOT an assessment. It is a supportive, preventive wellness
 * experience that guides the user toward emotional growth and flourishing.
 *
 * Tone: caring · protective · motivating · emotionally aware · hopeful
 * Never: clinical · alarming · heavy · assessment-like
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import {
  Sparkles, ArrowRight, RefreshCw, Moon, Wind,
  BookOpen, Activity, Heart, Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMood } from "@/contexts/MoodContext";

interface NeutralGuidanceCardProps {
  onReset: () => void;
}

const WELLNESS_PILLARS = [
  {
    icon: Moon,
    title: "Sleep as Your Foundation",
    body: "Consistent sleep and wake times — even on weekends — are the single most impactful habit for sustained emotional wellbeing. Tonight, try sleeping 30 minutes earlier.",
    tag: "Sleep Hygiene",
    tagColor: "text-blue-600 bg-blue-50",
  },
  {
    icon: Wind,
    title: "Daily Mindful Moments",
    body: "Even 5 minutes of quiet, intentional breathing each morning builds long-term emotional regulation. You don't need to meditate — just pause and breathe with awareness.",
    tag: "Mindfulness",
    tagColor: "text-sky-600 bg-sky-50",
  },
  {
    icon: Activity,
    title: "Move Your Body, Shift Your Mood",
    body: "A 10-minute walk — especially outdoors — is one of the most evidence-backed emotional regulation tools available. Movement is medicine for the mind.",
    tag: "Physical Wellness",
    tagColor: "text-teal-600 bg-teal-50",
  },
  {
    icon: BookOpen,
    title: "Reflective Journaling",
    body: "Writing 3 sentences about your day — without judgment — helps process background emotional noise and improves clarity. Small habit, significant impact.",
    tag: "Emotional Clarity",
    tagColor: "text-violet-600 bg-violet-50",
  },
  {
    icon: Heart,
    title: "Nurture One Connection",
    body: "Social connection is a core pillar of emotional wellbeing. Reach out to one person today — not to solve anything, just to connect. It matters more than you think.",
    tag: "Social Wellness",
    tagColor: "text-rose-600 bg-rose-50",
  },
  {
    icon: Zap,
    title: "Protect Your Energy",
    body: "Emotional balance is easier to maintain than to restore. Notice what drains you today and gently reduce it. Small boundaries protect large reserves of wellbeing.",
    tag: "Energy Management",
    tagColor: "text-amber-600 bg-amber-50",
  },
];

const GROWTH_AFFIRMATIONS = [
  "Maintaining emotional balance is just as important as recovering from emotional stress.",
  "Small positive habits today can lead to a happier and healthier emotional life.",
  "You're paying attention to your mental wellness early — that's a powerful act of self-care.",
  "Emotional growth doesn't require crisis. It grows in the quiet, steady moments like this one.",
];

export default function NeutralGuidanceCard({ onReset }: NeutralGuidanceCardProps) {
  const { theme } = useMood();
  const accentColor = theme?.accent ?? "#0ea5e9";
  const glow = theme?.glow ?? "rgba(56,189,248,0.25)";

  const affirmation = GROWTH_AFFIRMATIONS[Math.floor(Math.random() * GROWTH_AFFIRMATIONS.length)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-5"
    >
      {/* ── Supportive header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center relative overflow-hidden rounded-3xl p-8"
        style={{
          background: theme
            ? `linear-gradient(145deg, ${theme.bg1}70, ${theme.bg2}50, ${theme.bg3}35)`
            : "linear-gradient(145deg, #e0f2fe70, #cffafe50, #d1fae535)",
          border: `1px solid ${accentColor}25`,
          boxShadow: `0 6px 32px ${glow}`,
        }}
      >
        {/* Gentle floating orbs */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 6 + i * 4,
              height: 6 + i * 4,
              background: `${accentColor}40`,
              left: `${15 + i * 30}%`,
              top: `${20 + i * 15}%`,
              opacity: 0,
            }}
            animate={{ opacity: [0, 0.5, 0], y: [0, -12, -24], scale: [0.8, 1.1, 0.6] }}
            transition={{ duration: 4, repeat: Infinity, delay: i * 1.2, ease: "easeOut" }}
          />
        ))}

        <motion.div
          className="text-5xl mb-4 select-none"
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          🌊
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-4"
          style={{
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
            color: accentColor,
          }}
        >
          <Sparkles size={12} />
          <span>Balanced Emotional State</span>
        </motion.div>

        <motion.h2
          className="text-2xl md:text-3xl font-semibold tracking-tight mb-3 leading-snug"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          I'm glad you chose to check in today.
        </motion.h2>

        <motion.p
          className="text-sm text-muted-foreground leading-relaxed max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          It's good that you're paying attention to your mental wellness early.
          A balanced state is a powerful foundation — and the right time to grow.
        </motion.p>
      </motion.div>

      {/* ── Affirmation ───────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-5 text-center"
        style={{
          background: "rgba(255,255,255,0.6)",
          backdropFilter: "blur(16px)",
          border: `1px solid ${accentColor}18`,
        }}
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <Heart size={13} style={{ color: accentColor }} />
          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
            A Gentle Reminder
          </span>
          <Heart size={13} style={{ color: accentColor }} />
        </div>
        <p className="text-base font-medium leading-relaxed text-foreground/80 italic">
          "{affirmation}"
        </p>
      </motion.div>

      {/* ── Wellness growth pillars ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.38 }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3 flex items-center gap-2">
          <Activity size={13} />
          Wellness Practices to Grow From Here
        </p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {WELLNESS_PILLARS.map((pillar, i) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.42 + i * 0.07, duration: 0.45 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="rounded-2xl p-4 transition-all duration-300 hover:shadow-md"
              style={{
                background: "rgba(255,255,255,0.6)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.5)",
              }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center mb-3"
                style={{ background: `${accentColor}12` }}
              >
                <pillar.icon size={15} style={{ color: accentColor }} />
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 inline-block ${pillar.tagColor}`}>
                {pillar.tag}
              </span>
              <h4 className="text-sm font-semibold mb-1.5 leading-snug">{pillar.title}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{pillar.body}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Preventive wellness note ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.62 }}
        className="rounded-2xl p-5"
        style={{
          background: `${accentColor}07`,
          border: `1px solid ${accentColor}18`,
        }}
      >
        <div className="flex items-start gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: `${accentColor}15` }}
          >
            <Sparkles size={14} style={{ color: accentColor }} />
          </div>
          <div>
            <p className="text-sm font-medium mb-1" style={{ color: accentColor }}>
              Emotional Wellness is Preventive
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              You don't need to be in distress to invest in your emotional health.
              The practices above are most powerful when started from a place of balance —
              exactly where you are right now. This is the ideal moment to begin.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ── CTAs ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.68 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link href="/dashboard" className="flex-1">
          <Button
            size="lg"
            className="w-full rounded-full gap-2 text-white border-0 hover:opacity-90 transition-opacity"
            style={{
              background: theme
                ? `linear-gradient(135deg, ${theme.particle1}, ${theme.accent})`
                : "linear-gradient(135deg, #38bdf8, #0ea5e9)",
              boxShadow: `0 8px 28px ${glow}`,
            }}
          >
            View Wellness Dashboard
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

      {/* ── Closing note ──────────────────────────────────────────── */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.78 }}
        className="text-center text-xs text-muted-foreground/50 leading-relaxed"
      >
        MANAS walks with you — through every emotional season. 🌿
      </motion.p>
    </motion.div>
  );
}
