/**
 * AssessmentResultCard
 * ─────────────────────────────────────────────────────────────────────────
 * Stage E — Final Emotional Assessment Result
 *
 * Presents a wellness summary using safe, non-diagnostic language.
 * Evaluates: emotional persistence, sadness intensity, hopelessness
 * indicators, burnout patterns, and isolation signals.
 *
 * Language rules:
 *   ✓ "Your responses suggest emotional distress patterns…"
 *   ✓ "You may be experiencing prolonged emotional strain."
 *   ✗ Never diagnose depression, anxiety disorders, or clinical conditions.
 */

import { motion } from "framer-motion";
import { Link } from "wouter";
import { ArrowRight, RefreshCw, ShieldCheck, Users, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMood } from "@/contexts/MoodContext";
import { formatScore } from "@/utils/emotionTheme";
import type { EmotionScore } from "@/services/emotionApi";
import ProfessionalSupportSection from "@/components/ProfessionalSupportSection";
import { getRecommendations } from "@/services/doctorRecommendationService";

interface AssessmentResultCardProps {
  emotions: EmotionScore[];
  answers: { question: string; answer: string }[];
  onReset: () => void;
}

// ── Wellness signal computation ────────────────────────────────────────────
const DISTRESS_LABELS = new Set(["sadness", "grief", "disappointment", "remorse", "fear", "nervousness"]);
const BURNOUT_LABELS  = new Set(["exhaustion", "annoyance", "disgust", "anger"]);
const POSITIVE_LABELS = new Set(["joy", "excitement", "optimism", "gratitude", "love", "relief", "pride"]);

function computeWellnessSignals(emotions: EmotionScore[]) {
  const distressScore = emotions
    .filter((e) => DISTRESS_LABELS.has(e.label))
    .reduce((sum, e) => sum + e.score, 0);

  const burnoutScore = emotions
    .filter((e) => BURNOUT_LABELS.has(e.label))
    .reduce((sum, e) => sum + e.score, 0);

  const positiveScore = emotions
    .filter((e) => POSITIVE_LABELS.has(e.label))
    .reduce((sum, e) => sum + e.score, 0);

  const dominant = emotions[0];
  const dominantIsDistress = DISTRESS_LABELS.has(dominant?.label ?? "");
  const dominantIsPositive = POSITIVE_LABELS.has(dominant?.label ?? "");
  const highIntensity = (dominant?.score ?? 0) > 0.7;

  return { distressScore, burnoutScore, positiveScore, dominantIsDistress, dominantIsPositive, highIntensity };
}

function buildAssessmentSummary(
  signals: ReturnType<typeof computeWellnessSignals>,
  mood: string | null
): { level: "elevated" | "moderate" | "positive"; headline: string; body: string; indicators: string[] } {
  const { distressScore, burnoutScore, positiveScore, dominantIsDistress, highIntensity } = signals;

  if (dominantIsDistress && highIntensity && distressScore > 0.6) {
    return {
      level: "elevated",
      headline: "Elevated Emotional Distress Patterns Detected",
      body: "Your responses suggest emotional distress patterns that may benefit from additional support. You may be experiencing prolonged emotional strain or emotional exhaustion. These patterns are common and manageable with the right guidance.",
      indicators: [
        "Elevated sadness or grief indicators",
        "Signs of emotional fatigue or depletion",
        "Possible feelings of disconnection or isolation",
        "Reduced emotional resilience patterns",
      ],
    };
  }

  if (distressScore > 0.3 || burnoutScore > 0.2) {
    return {
      level: "moderate",
      headline: "Moderate Emotional Strain Identified",
      body: "Your emotional responses indicate elevated stress and some emotional strain. While not severe, these patterns suggest your emotional wellbeing may benefit from intentional care and support.",
      indicators: [
        "Moderate stress or tension indicators",
        "Some signs of emotional depletion",
        "Possible need for emotional recovery time",
        "Opportunity to strengthen coping strategies",
      ],
    };
  }

  return {
    level: "positive",
    headline: "Stable Emotional Wellbeing Patterns",
    body: "Your responses reflect a relatively stable emotional state. Continuing to invest in your emotional wellness will help sustain and strengthen these positive patterns over time.",
    indicators: [
      "Positive emotional regulation indicators",
      "Stable mood and energy patterns",
      "Healthy emotional expression",
      "Good foundation for continued wellness",
    ],
  };
}

const LEVEL_STYLES = {
  elevated: {
    badge: "Elevated Distress",
    badgeBg: "rgba(239,68,68,0.08)",
    badgeBorder: "rgba(239,68,68,0.2)",
    badgeColor: "#dc2626",
    barColor: "from-red-400 to-rose-500",
  },
  moderate: {
    badge: "Moderate Strain",
    badgeBg: "rgba(245,158,11,0.08)",
    badgeBorder: "rgba(245,158,11,0.2)",
    badgeColor: "#d97706",
    barColor: "from-amber-400 to-orange-400",
  },
  positive: {
    badge: "Stable Wellbeing",
    badgeBg: "rgba(16,185,129,0.08)",
    badgeBorder: "rgba(16,185,129,0.2)",
    badgeColor: "#059669",
    barColor: "from-emerald-400 to-teal-400",
  },
};

const NEXT_STEPS = {
  elevated: [
    { icon: Users, label: "Connect with a Wellness Expert", href: "/experts" },
    { icon: BookOpen, label: "Begin a New Guided Assessment", href: "/checkin" },
  ],
  moderate: [
    { icon: BookOpen, label: "Start a New Wellness Assessment", href: "/checkin" },
    { icon: Users, label: "Browse Expert Support Options", href: "/experts" },
  ],
  positive: [
    { icon: ArrowRight, label: "View Your Wellness Dashboard", href: "/dashboard" },
    { icon: BookOpen, label: "Begin Another Assessment", href: "/checkin" },
  ],
};

export default function AssessmentResultCard({ emotions, answers, onReset }: AssessmentResultCardProps) {
  const { mood, theme } = useMood();
  const signals = computeWellnessSignals(emotions);
  const summary = buildAssessmentSummary(signals, mood);
  const styles = LEVEL_STYLES[summary.level];
  const accentColor = theme?.accent ?? "hsl(var(--primary))";
  const nextSteps = NEXT_STEPS[summary.level];
  const recommendation = getRecommendations(emotions);

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-4"
    >
      {/* ── Assessment complete header ──────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-center pb-2"
      >
        <div className="flex items-center justify-center gap-2 mb-3">
          <div
            className="h-px flex-1 rounded-full max-w-[60px]"
            style={{ background: `${accentColor}25` }}
          />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">
            Assessment Complete
          </span>
          <div
            className="h-px flex-1 rounded-full max-w-[60px]"
            style={{ background: `${accentColor}25` }}
          />
        </div>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">
          Your Emotional Wellness Summary
        </h3>
      </motion.div>

      {/* ── Result level card ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ delay: 0.18, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(20px)",
          border: `1px solid ${styles.badgeBorder}`,
          boxShadow: `0 0 0 0 ${styles.badgeColor}00`,
        }}
      >
        {theme && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 80% 20%, ${theme.bg1}40, transparent 65%)`,
            }}
          />
        )}
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 mb-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: -8 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ delay: 0.35, type: "spring", stiffness: 280, damping: 22 }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border"
              style={{
                background: styles.badgeBg,
                borderColor: styles.badgeBorder,
                color: styles.badgeColor,
              }}
            >
              <ShieldCheck size={11} />
              {styles.badge}
            </motion.div>
          </div>
          <h4 className="text-base font-semibold mb-2 leading-snug">{summary.headline}</h4>
          <p className="text-sm text-muted-foreground leading-relaxed">{summary.body}</p>
        </div>
      </motion.div>

      {/* ── Emotional indicators ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.45)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
          Identified Patterns
        </p>
        <div className="space-y-2">
          {summary.indicators.map((indicator, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.07 }}
              className="flex items-center gap-2.5 text-sm text-foreground/75"
            >
              <div
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: styles.badgeColor }}
              />
              {indicator}
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Emotion breakdown ───────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.38 }}
        className="rounded-2xl p-5"
        style={{
          background: "rgba(255,255,255,0.45)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.45)",
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">
          Detected Emotional Profile
        </p>
        <div className="space-y-3">
          {emotions.map((e, i) => (
            <motion.div
              key={e.label}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.42 + i * 0.06 }}
            >
              <div className="flex justify-between mb-1">
                <span className="text-xs font-medium capitalize text-foreground/75">{e.label}</span>
                <span className="text-xs text-muted-foreground tabular-nums">{formatScore(e.score)}</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className={`h-full rounded-full bg-gradient-to-r ${styles.barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${e.score * 100}%` }}
                  transition={{ delay: 0.5 + i * 0.06, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Disclaimer ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="rounded-xl px-4 py-3 text-xs text-muted-foreground/60 leading-relaxed"
        style={{
          background: "rgba(0,0,0,0.025)",
          border: "1px solid rgba(0,0,0,0.05)",
        }}
      >
        <strong className="text-muted-foreground/80">Important:</strong> This assessment is a wellness
        screening tool, not a clinical diagnosis. Results are indicative only. If you are experiencing
        significant distress, please consult a qualified mental health professional.
      </motion.div>

      {/* ── Next steps ──────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-2.5"
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">
          Recommended Next Steps
        </p>
        {nextSteps.map((step, i) => (
          <Link key={i} href={step.href}>
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 rounded-xl px-4 py-3.5 cursor-pointer transition-all duration-200 group"
              style={{
                background: "rgba(255,255,255,0.5)",
                backdropFilter: "blur(12px)",
                border: `1px solid ${accentColor}20`,
              }}
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200"
                style={{ background: `${accentColor}12` }}
              >
                <step.icon size={15} style={{ color: accentColor }} />
              </div>
              <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors">
                {step.label}
              </span>
              <ArrowRight size={14} className="ml-auto text-muted-foreground/40 group-hover:text-muted-foreground/70 transition-colors" />
            </motion.div>
          </Link>
        ))}
      </motion.div>

      {/* ── Reset ───────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center pt-2"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="rounded-full gap-2 text-muted-foreground/60 hover:text-muted-foreground text-xs"
        >
          <RefreshCw size={12} />
          Retake Assessment
        </Button>
      </motion.div>

      {/* ── Professional Support Recommendations ────────────────────── */}
      <ProfessionalSupportSection recommendation={recommendation} />
    </motion.div>
  );
}
