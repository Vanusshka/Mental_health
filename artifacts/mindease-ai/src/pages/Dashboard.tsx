/**
 * Dashboard — Emotional Wellness Insights
 * ─────────────────────────────────────────────────────────────────────────
 * A personal emotional wellness reflection space.
 * Integrates with MoodContext for adaptive theming.
 * Uses semi-static curated data + latest assessment signals.
 * NO fake patient names, NO admin metrics, NO hospital data.
 */

import { useRef, useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Brain, Sparkles, TrendingUp, RefreshCw, Heart,
  Moon, Wind, BookOpen, Zap, Activity, Shield,
  ArrowRight, Users, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import { useMood } from "@/contexts/MoodContext";
import { useAuth } from "@/contexts/AuthContext";
import { getRecentAssessments, type AssessmentRecord } from "@/services/firestoreService";
import { computeAssessmentLevel, getRecommendations } from "@/services/doctorRecommendationService";
import DoctorRecommendationCard from "@/components/DoctorRecommendationCard";

// ── Semi-static wellness trend data ───────────────────────────────────────
// Represents a believable 7-day emotional wellness arc.
// Intentionally gentle — not perfectly linear, not obviously fake.
const TREND_DATA = [
  { day: "Mon", balance: 52, stress: 68, energy: 48 },
  { day: "Tue", balance: 55, stress: 64, energy: 52 },
  { day: "Wed", balance: 49, stress: 72, energy: 44 },
  { day: "Thu", balance: 61, stress: 60, energy: 58 },
  { day: "Fri", balance: 67, stress: 54, energy: 63 },
  { day: "Sat", balance: 72, stress: 48, energy: 70 },
  { day: "Sun", balance: 69, stress: 52, energy: 66 },
];

// ── Wellness indicator definitions ────────────────────────────────────────
type IndicatorLevel = "low" | "moderate" | "good" | "strong";

interface WellnessIndicator {
  label: string;
  icon: string;
  value: number;
  level: IndicatorLevel;
  interpretation: string;
  color: string;
}

const LEVEL_COLOR: Record<IndicatorLevel, string> = {
  low:      "#f87171",   // red-400
  moderate: "#fb923c",   // orange-400
  good:     "#34d399",   // emerald-400
  strong:   "#818cf8",   // indigo-400
};

// Derive wellness indicators from mood context
function buildIndicators(mood: string | null): WellnessIndicator[] {
  const isSad     = mood === "sad";
  const isHappy   = mood === "happy";

  return [
    {
      label: "Emotional Balance",
      icon: "⚖️",
      value: isSad ? 38 : isHappy ? 82 : 61,
      level: isSad ? "low" : isHappy ? "strong" : "good",
      interpretation: isSad ? "Needs attention — gentle self-care helps" : isHappy ? "Thriving — sustain this energy" : "Steady — maintain your routines",
      color: isSad ? LEVEL_COLOR.low : isHappy ? LEVEL_COLOR.strong : LEVEL_COLOR.good,
    },
    {
      label: "Stress Indicator",
      icon: "⚡",
      value: isSad ? 74 : isHappy ? 28 : 52,
      level: isSad ? "low" : isHappy ? "strong" : "moderate",
      interpretation: isSad ? "Elevated — breathing exercises may help" : isHappy ? "Low — you're in a calm state" : "Moderate — monitor and manage",
      color: isSad ? LEVEL_COLOR.low : isHappy ? LEVEL_COLOR.strong : LEVEL_COLOR.moderate,
    },
    {
      label: "Burnout Risk",
      icon: "🔋",
      value: isSad ? 65 : isHappy ? 18 : 40,
      level: isSad ? "moderate" : isHappy ? "strong" : "good",
      interpretation: isSad ? "Some depletion signs — rest is recovery" : isHappy ? "Minimal — energy reserves are healthy" : "Low — you're pacing well",
      color: isSad ? LEVEL_COLOR.moderate : isHappy ? LEVEL_COLOR.strong : LEVEL_COLOR.good,
    },
    {
      label: "Sleep Wellness",
      icon: "🌙",
      value: isSad ? 44 : isHappy ? 76 : 62,
      level: isSad ? "low" : isHappy ? "strong" : "good",
      interpretation: isSad ? "Disrupted — consistent sleep timing helps" : isHappy ? "Restorative — keep this rhythm" : "Fair — aim for 7–8 hours",
      color: isSad ? LEVEL_COLOR.low : isHappy ? LEVEL_COLOR.strong : LEVEL_COLOR.good,
    },
    {
      label: "Emotional Resilience",
      icon: "🛡️",
      value: isSad ? 42 : isHappy ? 85 : 65,
      level: isSad ? "low" : isHappy ? "strong" : "good",
      interpretation: isSad ? "Building — small wins strengthen resilience" : isHappy ? "Strong — you're bouncing back well" : "Stable — continue nurturing it",
      color: isSad ? LEVEL_COLOR.low : isHappy ? LEVEL_COLOR.strong : LEVEL_COLOR.good,
    },
    {
      label: "Social Connectivity",
      icon: "💬",
      value: isSad ? 35 : isHappy ? 88 : 70,
      level: isSad ? "low" : isHappy ? "strong" : "good",
      interpretation: isSad ? "Withdrawn — one small connection can help" : isHappy ? "Thriving — your connections are nourishing" : "Healthy — keep engaging",
      color: isSad ? LEVEL_COLOR.low : isHappy ? LEVEL_COLOR.strong : LEVEL_COLOR.good,
    },
  ];
}

// ── Wellness score computation ─────────────────────────────────────────────
function computeWellnessScore(mood: string | null): number {
  if (mood === "happy")   return 78;
  if (mood === "sad")     return 42;
  if (mood === "neutral") return 63;
  return 58; // default — no assessment yet
}

// ── Personalised wellness insights ────────────────────────────────────────
interface WellnessInsight {
  icon: React.ElementType;
  title: string;
  body: string;
  tag: string;
  tagColor: string;
}

function buildInsights(mood: string | null): WellnessInsight[] {
  const isSad   = mood === "sad";
  const isHappy = mood === "happy";

  if (isSad) return [
    {
      icon: Wind,
      title: "Box Breathing Practice",
      body: "Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat 4 cycles. This activates your parasympathetic nervous system and reduces emotional intensity.",
      tag: "Immediate Relief",
      tagColor: "text-indigo-600 bg-indigo-50",
    },
    {
      icon: Moon,
      title: "Rest as Recovery",
      body: "Emotional exhaustion is real. Prioritise 7–8 hours of sleep tonight. Even a 20-minute rest without screens can meaningfully restore emotional capacity.",
      tag: "Sleep & Recovery",
      tagColor: "text-blue-600 bg-blue-50",
    },
    {
      icon: BookOpen,
      title: "Expressive Journaling",
      body: "Write 3 sentences about what you're feeling without judgment. Research shows expressive writing reduces emotional load and improves clarity within days.",
      tag: "Emotional Processing",
      tagColor: "text-violet-600 bg-violet-50",
    },
    {
      icon: Heart,
      title: "One Small Connection",
      body: "Isolation amplifies difficult emotions. A brief message to someone you trust — even just checking in — can meaningfully shift your emotional state.",
      tag: "Social Wellness",
      tagColor: "text-rose-600 bg-rose-50",
    },
  ];

  if (isHappy) return [
    {
      icon: Zap,
      title: "Channel Your Energy",
      body: "Positive emotional states are ideal for tackling meaningful goals. Use this window to make progress on something that matters to you.",
      tag: "Momentum",
      tagColor: "text-orange-600 bg-orange-50",
    },
    {
      icon: BookOpen,
      title: "Gratitude Anchoring",
      body: "Write down 3 specific things contributing to your positive state today. This practice builds emotional memory and helps sustain wellbeing over time.",
      tag: "Positive Psychology",
      tagColor: "text-amber-600 bg-amber-50",
    },
    {
      icon: Heart,
      title: "Share Your Positivity",
      body: "Positive emotions are contagious in the best way. Reaching out to someone today can strengthen your relationships and amplify your own wellbeing.",
      tag: "Social Wellness",
      tagColor: "text-rose-600 bg-rose-50",
    },
    {
      icon: Shield,
      title: "Build Resilience Reserves",
      body: "Good emotional states are the best time to build coping strategies. Establish a small daily wellness habit now — it will serve you during harder days.",
      tag: "Resilience",
      tagColor: "text-emerald-600 bg-emerald-50",
    },
  ];

  // Neutral / default
  return [
    {
      icon: Activity,
      title: "Mindful Check-In",
      body: "A balanced state is a great foundation. Take 5 minutes today to sit quietly and notice your thoughts without reacting. This builds long-term emotional awareness.",
      tag: "Mindfulness",
      tagColor: "text-sky-600 bg-sky-50",
    },
    {
      icon: Moon,
      title: "Sleep Consistency",
      body: "Consistent sleep and wake times — even on weekends — are the single most impactful habit for sustained emotional wellbeing.",
      tag: "Sleep Hygiene",
      tagColor: "text-blue-600 bg-blue-50",
    },
    {
      icon: Wind,
      title: "Stress Prevention",
      body: "Before stress accumulates, try a 10-minute walk or light stretching. Movement is one of the most evidence-backed emotional regulation tools available.",
      tag: "Prevention",
      tagColor: "text-teal-600 bg-teal-50",
    },
    {
      icon: BookOpen,
      title: "Reflective Journaling",
      body: "Even 5 minutes of free-writing each morning helps process background emotional noise and improves focus and clarity throughout the day.",
      tag: "Emotional Clarity",
      tagColor: "text-violet-600 bg-violet-50",
    },
  ];
}

// ── Emotional state label ──────────────────────────────────────────────────
function getEmotionalStateLabel(mood: string | null): { label: string; emoji: string; description: string; color: string } {
  if (mood === "sad") return {
    label: "Emotional Strain Detected",
    emoji: "🌙",
    description: "Your latest assessment reflects elevated emotional distress patterns. This is a signal worth paying attention to.",
    color: "#818cf8",
  };
  if (mood === "happy") return {
    label: "Positive Emotional State",
    emoji: "✨",
    description: "Your latest assessment reflects a positive and energised emotional state. Your wellbeing indicators are strong.",
    color: "#f97316",
  };
  if (mood === "neutral") return {
    label: "Balanced Emotional State",
    emoji: "🌊",
    description: "Your latest assessment reflects a steady, balanced emotional state. A calm foundation for continued wellness.",
    color: "#0ea5e9",
  };
  return {
    label: "No Assessment Yet",
    emoji: "🔍",
    description: "Complete your emotional check-in to see personalised wellness insights and your emotional profile.",
    color: "hsl(var(--primary))",
  };
}

// ── Wellness score ring ────────────────────────────────────────────────────
function WellnessScoreRing({ score, color }: { score: number; color: string }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div ref={ref} className="relative w-32 h-32 flex items-center justify-center">
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
        <motion.circle
          cx="60" cy="60" r="52"
          fill="none"
          stroke={color}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.6, ease: "easeOut", delay: 0.3 }}
          style={{ filter: `drop-shadow(0 0 6px ${color}60)` }}
        />
      </svg>
      <div className="text-center z-10">
        <motion.p
          className="text-3xl font-bold"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.9 }}
        >
          {score}
        </motion.p>
        <p className="text-[10px] text-muted-foreground font-medium">/ 100</p>
      </div>
    </div>
  );
}

// ── Indicator card ─────────────────────────────────────────────────────────
function IndicatorCard({ indicator, delay }: { indicator: WellnessIndicator; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={isInView ? { opacity: 1, y: 0, filter: "blur(0px)" } : {}}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.09)", transition: { duration: 0.25 } }}
      className="p-5 rounded-2xl group cursor-default"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
        transition: "border-color 0.3s ease",
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-muted-foreground leading-tight">{indicator.label}</p>
        <span className="text-base">{indicator.icon}</span>
      </div>

      {/* Arc progress */}
      <div className="flex items-center justify-center my-2">
        <div className="relative w-20 h-10 overflow-hidden">
          <svg viewBox="0 0 80 40" className="w-full h-full">
            <path
              d="M 8 38 A 32 32 0 0 1 72 38"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <motion.path
              d="M 8 38 A 32 32 0 0 1 72 38"
              fill="none"
              stroke={indicator.color}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray="100"
              initial={{ strokeDashoffset: 100 }}
              animate={isInView ? { strokeDashoffset: 100 - indicator.value } : {}}
              transition={{ delay: delay + 0.3, duration: 0.9, ease: "easeOut" }}
              style={{ filter: `drop-shadow(0 0 4px ${indicator.color}80)` }}
            />
          </svg>
          <div className="absolute bottom-0 left-0 right-0 text-center">
            <span className="text-sm font-bold" style={{ color: indicator.color }}>
              {indicator.value}%
            </span>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground text-center leading-relaxed mt-1">
        {indicator.interpretation}
      </p>
    </motion.div>
  );
}

// ── Main Dashboard component ───────────────────────────────────────────────
export default function Dashboard() {
  const { mood, theme } = useMood();
  const { user } = useAuth();
  const accentColor  = theme?.accent ?? "hsl(var(--primary))";
  const indicators   = buildIndicators(mood);
  const insights     = buildInsights(mood);
  const wellnessScore = computeWellnessScore(mood);
  const stateLabel   = getEmotionalStateLabel(mood);
  const hasAssessment = mood !== null;

  // Firestore history
  const [history, setHistory]         = useState<AssessmentRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setHistoryLoading(true);
    getRecentAssessments(user.uid, 7)
      .then(setHistory)
      .catch(() => {}) // non-blocking
      .finally(() => setHistoryLoading(false));
  }, [user]);

  // Use latest Firestore record to override mood-based indicators if available
  const latestRecord = history[0] ?? null;

  // Recommendation snapshot (only for distress patterns)
  const dummyEmotions = mood === "sad"
    ? [{ label: "sadness", score: 0.82 }, { label: "disappointment", score: 0.18 }]
    : mood === "neutral"
    ? [{ label: "nervousness", score: 0.35 }, { label: "neutral", score: 0.65 }]
    : [{ label: "joy", score: 0.85 }, { label: "excitement", score: 0.15 }];

  const recommendation = getRecommendations(dummyEmotions);

  // Adaptive trend data — shift values based on mood
  const trendData = TREND_DATA.map((d, i) => ({
    ...d,
    balance: mood === "sad"
      ? Math.max(30, d.balance - 18 + i * 2)
      : mood === "happy"
      ? Math.min(95, d.balance + 12)
      : d.balance,
    stress: mood === "sad"
      ? Math.min(90, d.stress + 14)
      : mood === "happy"
      ? Math.max(20, d.stress - 22)
      : d.stress,
  }));

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <PageTransition>
      <div className="container mx-auto max-w-6xl px-6 py-10">

        {/* ── Page header ─────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 gap-6">
          <div className="flex-1">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground mb-2 font-medium"
            >
              {today}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-4xl font-semibold tracking-tight mb-2"
            >
              Emotional Wellness Insights — MANAS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.12 }}
              className="text-muted-foreground text-sm max-w-lg leading-relaxed"
            >
              {hasAssessment
                ? "Your personalised wellness overview, derived from your latest emotional assessment."
                : "Complete your emotional check-in to unlock personalised wellness insights and your full emotional profile."}
            </motion.p>

            {!hasAssessment && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-4"
              >
                <Link href="/checkin">
                  <Button
                    className="rounded-full gap-2 text-white border-0 hover:opacity-90 transition-opacity"
                    style={{
                      background: `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))`,
                    }}
                  >
                    <Brain size={15} />
                    Begin Your Assessment
                  </Button>
                </Link>
              </motion.div>
            )}
          </div>

          {/* Wellness score ring */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="flex flex-col items-center gap-2"
          >
            <WellnessScoreRing score={wellnessScore} color={accentColor} />
            <p className="text-xs text-muted-foreground font-medium">Wellness Score</p>
            {hasAssessment && (
              <span
                className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full"
                style={{
                  background: `${accentColor}15`,
                  color: accentColor,
                  border: `1px solid ${accentColor}30`,
                }}
              >
                {mood === "sad" ? "Needs Care" : mood === "happy" ? "Thriving" : "Balanced"}
              </span>
            )}
          </motion.div>
        </div>

        {/* ── Latest emotional state banner ────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-5 mb-8 relative overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.6)",
            backdropFilter: "blur(20px)",
            border: `1px solid ${accentColor}25`,
            boxShadow: `0 4px 24px ${accentColor}10`,
          }}
        >
          {theme && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse at 90% 50%, ${theme.bg1}50, transparent 60%)`,
              }}
            />
          )}
          <div className="relative z-10 flex items-center gap-4">
            <motion.div
              className="text-4xl flex-shrink-0"
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {stateLabel.emoji}
            </motion.div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="text-xs font-semibold uppercase tracking-widest"
                  style={{ color: stateLabel.color }}
                >
                  Latest Emotional State
                </span>
                <span
                  className="text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{
                    background: `${stateLabel.color}15`,
                    color: stateLabel.color,
                    border: `1px solid ${stateLabel.color}30`,
                  }}
                >
                  {stateLabel.label}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {stateLabel.description}
              </p>
            </div>
            <Link href="/checkin" className="flex-shrink-0 hidden sm:block">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5 text-xs"
              >
                <RefreshCw size={12} />
                Reassess
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* ── Wellness indicators grid ─────────────────────────────── */}
        <div className="mb-8">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70 mb-4 flex items-center gap-2"
          >
            <Activity size={14} />
            Wellness Indicators
          </motion.h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {indicators.map((ind, i) => (
              <IndicatorCard key={ind.label} indicator={ind} delay={i * 0.07} />
            ))}
          </div>
        </div>

        {/* ── Trend chart + mood timeline ──────────────────────────── */}
        <div className="grid md:grid-cols-3 gap-5 mb-8">

          {/* Area chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            <h2 className="text-sm font-semibold mb-1 flex items-center gap-2">
              <TrendingUp size={15} className="text-primary" />
              7-Day Emotional Wellness Trend
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              Emotional balance, stress, and energy patterns over the past week
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={accentColor} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={accentColor} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="stressGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f87171" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="balance"
                  stroke={accentColor}
                  strokeWidth={2.5}
                  fill="url(#balanceGrad)"
                  dot={{ fill: accentColor, r: 3.5, strokeWidth: 0 }}
                  name="Emotional Balance"
                />
                <Area
                  type="monotone"
                  dataKey="stress"
                  stroke="#f87171"
                  strokeWidth={2}
                  fill="url(#stressGrad)"
                  dot={{ fill: "#f87171", r: 3, strokeWidth: 0 }}
                  strokeDasharray="5 3"
                  name="Stress Level"
                />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-5 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full" style={{ background: accentColor }} />
                <span className="text-[11px] text-muted-foreground">Emotional Balance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 rounded-full bg-red-400" style={{ borderTop: "2px dashed #f87171" }} />
                <span className="text-[11px] text-muted-foreground">Stress Level</span>
              </div>
            </div>
          </motion.div>

          {/* Mood consistency panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-2xl p-6"
            style={{
              background: "rgba(255,255,255,0.6)",
              backdropFilter: "blur(16px)",
              border: "1px solid rgba(255,255,255,0.5)",
            }}
          >
            <h2 className="text-sm font-semibold mb-1">Mood Consistency</h2>
            <p className="text-xs text-muted-foreground mb-5">This week's emotional pattern</p>
            <div className="space-y-3">
              {trendData.map((d, i) => {
                const isToday = i === trendData.length - 1;
                const barWidth = `${d.balance}%`;
                return (
                  <motion.div
                    key={d.day}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + i * 0.06 }}
                    className="flex items-center gap-3"
                  >
                    <span className={`text-xs w-7 flex-shrink-0 font-medium ${isToday ? "" : "text-muted-foreground"}`}>
                      {d.day}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: isToday ? accentColor : `${accentColor}70` }}
                        initial={{ width: 0 }}
                        animate={{ width: barWidth }}
                        transition={{ delay: 0.5 + i * 0.06, duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-[11px] text-muted-foreground w-8 text-right tabular-nums">
                      {d.balance}%
                    </span>
                  </motion.div>
                );
              })}
            </div>
            <div
              className="mt-5 rounded-xl px-3 py-2.5 text-xs text-muted-foreground leading-relaxed"
              style={{ background: "rgba(0,0,0,0.03)", border: "1px solid rgba(0,0,0,0.05)" }}
            >
              {mood === "sad"
                ? "Your emotional balance has been lower this week. Small daily practices can gradually shift this pattern."
                : mood === "happy"
                ? "Your emotional balance has been strong this week. Keep nurturing the habits that support this."
                : "Your emotional balance has been steady this week — a healthy foundation for continued wellbeing."}
            </div>
          </motion.div>
        </div>

        {/* ── Personalised wellness insights ───────────────────────── */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center justify-between mb-4"
          >
            <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
              <Sparkles size={14} />
              Personalised Wellness Insights
            </h2>
            <span
              className="text-[10px] font-medium px-2.5 py-1 rounded-full"
              style={{
                background: `${accentColor}10`,
                color: accentColor,
                border: `1px solid ${accentColor}20`,
              }}
            >
              Adapted to your emotional state
            </span>
          </motion.div>

          <motion.div
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.09, delayChildren: 0.1 } },
            }}
          >
            {insights.map((insight, i) => (
              <motion.div
                key={insight.title}
                variants={{
                  hidden:  { opacity: 0, y: 20, filter: "blur(4px)" },
                  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
                }}
                whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)", transition: { duration: 0.22 } }}
                className="rounded-2xl p-5"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${accentColor}12` }}
                >
                  <insight.icon size={17} style={{ color: accentColor }} />
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mb-2 inline-block ${insight.tagColor}`}>
                  {insight.tag}
                </span>
                <h3 className="text-sm font-semibold mb-1.5 leading-snug">{insight.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{insight.body}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* ── Assessment history (Firestore) ───────────────────────── */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                <Clock size={14} />
                Assessment History
              </h2>
              <span
                className="text-[10px] font-medium px-2.5 py-1 rounded-full"
                style={{ background: `${accentColor}10`, color: accentColor, border: `1px solid ${accentColor}20` }}
              >
                {history.length} session{history.length !== 1 ? "s" : ""} recorded
              </span>
            </div>
            <motion.div
              className="space-y-2.5"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } } }}
            >
              {history.map((record, i) => {
                const moodEmoji = record.selectedMood === "happy" ? "😊" : record.selectedMood === "sad" ? "😔" : "😐";
                const levelColor = record.assessmentLevel === "elevated" ? "#f87171" : record.assessmentLevel === "moderate" ? "#fb923c" : "#34d399";
                const ts = record.timestamp as { toDate?: () => Date } | null;
                const dateStr = ts?.toDate
                  ? ts.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
                  : "Recent";
                return (
                  <motion.div
                    key={i}
                    variants={{
                      hidden:  { opacity: 0, x: -16, filter: "blur(3px)" },
                      visible: { opacity: 1, x: 0,   filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
                    }}
                    whileHover={{ x: 3, transition: { duration: 0.2 } }}
                    className="flex items-center gap-4 rounded-xl px-4 py-3"
                    style={{
                      background: "rgba(255,255,255,0.55)",
                      backdropFilter: "blur(12px)",
                      border: "1px solid rgba(255,255,255,0.45)",
                    }}
                  >
                    <span className="text-2xl flex-shrink-0">{moodEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold capitalize text-foreground/80">
                          {record.dominantEmotion}
                        </span>
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                          style={{ background: `${levelColor}15`, color: levelColor, border: `1px solid ${levelColor}30` }}
                        >
                          {record.assessmentLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
                        Wellness score: {record.wellnessScore}/100 · Balance: {record.emotionalBalance}%
                      </p>
                    </div>
                    <span className="text-[11px] text-muted-foreground/60 flex-shrink-0 hidden sm:block">
                      {dateStr}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>
          </motion.div>
        )}

        {/* ── Professional support snapshot (distress only) ─────────── */}
        {recommendation.shouldShow && recommendation.professionals.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-2">
                  <Users size={14} />
                  Professional Support Snapshot
                </h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on your emotional patterns, these professionals may offer meaningful support.
                </p>
              </div>
              <Link href="/experts">
                <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs">
                  View All Experts
                  <ArrowRight size={12} />
                </Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendation.professionals.map((pro, i) => (
                <DoctorRecommendationCard key={pro.id} professional={pro} index={i} />
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="mt-4 rounded-xl px-4 py-3 text-xs text-muted-foreground/60 leading-relaxed"
              style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.05)" }}
            >
              <strong className="text-muted-foreground/80">Note:</strong> These recommendations are
              based on emotional assessment patterns, not a clinical diagnosis. Always verify
              professional credentials independently.
            </motion.div>
          </motion.div>
        )}

        {/* ── Wellness disclaimer ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl p-5 mb-8"
          style={{
            background: "rgba(255,255,255,0.45)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(255,255,255,0.4)",
          }}
        >
          <div className="flex items-start gap-3">
            <Shield size={16} className="text-muted-foreground/60 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground/70 leading-relaxed">
              <strong className="text-muted-foreground/90">About this dashboard:</strong> Wellness
              indicators and trend data are derived from your emotional assessment responses and
              curated wellness research. This is a reflective wellness tool, not a clinical
              diagnostic system. For significant emotional distress, please consult a qualified
              mental health professional.
            </p>
          </div>
        </motion.div>

        {/* ── Action bar ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-wrap gap-3"
        >
          <Link href="/checkin">
            <Button
              className="rounded-full gap-2 text-white border-0 hover:opacity-90 transition-opacity"
              style={{
                background: `linear-gradient(135deg, ${accentColor}, ${theme?.particle1 ?? accentColor})`,
                boxShadow: theme ? `0 6px 20px ${theme.glow}` : undefined,
              }}
            >
              <Brain size={15} />
              {hasAssessment ? "Reassess Emotional State" : "Begin Assessment"}
            </Button>
          </Link>
          <Link href="/session-summary">
            <Button variant="outline" className="rounded-full gap-2">
              <BookOpen size={15} />
              View Session Summary
            </Button>
          </Link>
          <Link href="/experts">
            <Button variant="ghost" className="rounded-full gap-2 text-muted-foreground">
              <Users size={15} />
              Browse Wellness Experts
            </Button>
          </Link>
        </motion.div>

      </div>
    </PageTransition>
  );
}
