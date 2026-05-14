/**
 * AssessmentResultCard — AI-powered nuanced emotional analysis
 * Uses Gemini API for personalized results. Falls back gracefully.
 * Sad mood no longer auto-classifies as elevated distress.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useSearch } from "wouter";
import { ArrowRight, RefreshCw, ShieldCheck, Users, BookOpen, Stethoscope, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMood } from "@/contexts/MoodContext";
import { formatScore } from "@/utils/emotionTheme";
import type { EmotionScore } from "@/services/emotionApi";
import ProfessionalSupportSection from "@/components/ProfessionalSupportSection";
import { getRecommendations } from "@/services/doctorRecommendationService";
import { analyzeAssessment, type AssessmentAnalysisResult } from "@/services/assessmentAnalysisApi";

interface AssessmentResultCardProps {
  emotions: EmotionScore[];
  answers: { question: string; answer: string }[];
  onReset: () => void;
  reflection?: string;
}

// Level → visual style mapping (expanded for nuanced levels)
const LEVEL_STYLES: Record<string, { badge: string; badgeBg: string; badgeBorder: string; badgeColor: string; barColor: string }> = {
  elevated:   { badge:"Elevated Distress",    badgeBg:"rgba(239,68,68,0.08)",   badgeBorder:"rgba(239,68,68,0.2)",   badgeColor:"#dc2626", barColor:"from-red-400 to-rose-500" },
  moderate:   { badge:"Moderate Strain",      badgeBg:"rgba(245,158,11,0.08)",  badgeBorder:"rgba(245,158,11,0.2)",  badgeColor:"#d97706", barColor:"from-amber-400 to-orange-400" },
  mild:       { badge:"Mild Emotional Weight", badgeBg:"rgba(251,191,36,0.08)", badgeBorder:"rgba(251,191,36,0.2)",  badgeColor:"#b45309", barColor:"from-yellow-400 to-amber-400" },
  reflective: { badge:"Reflective State",     badgeBg:"rgba(99,102,241,0.08)",  badgeBorder:"rgba(99,102,241,0.2)",  badgeColor:"#4f46e5", barColor:"from-indigo-400 to-violet-400" },
  recovering: { badge:"Recovering",           badgeBg:"rgba(20,184,166,0.08)",  badgeBorder:"rgba(20,184,166,0.2)",  badgeColor:"#0d9488", barColor:"from-teal-400 to-cyan-400" },
  positive:   { badge:"Stable Wellbeing",     badgeBg:"rgba(16,185,129,0.08)",  badgeBorder:"rgba(16,185,129,0.2)",  badgeColor:"#059669", barColor:"from-emerald-400 to-teal-400" },
};

const NEXT_STEPS: Record<string, { icon: typeof Users; label: string; href: string }[]> = {
  elevated:   [{ icon:Users, label:"Connect with a Wellness Expert", href:"/experts" }, { icon:BookOpen, label:"Begin a New Assessment", href:"/checkin" }],
  moderate:   [{ icon:BookOpen, label:"Start a New Wellness Assessment", href:"/checkin" }, { icon:Users, label:"Browse Expert Support", href:"/experts" }],
  mild:       [{ icon:BookOpen, label:"View Your Wellness Dashboard", href:"/dashboard" }, { icon:Users, label:"Browse Wellness Experts", href:"/experts" }],
  reflective: [{ icon:BookOpen, label:"View Your Wellness Dashboard", href:"/dashboard" }, { icon:BookOpen, label:"Begin Another Assessment", href:"/checkin" }],
  recovering: [{ icon:BookOpen, label:"View Your Wellness Dashboard", href:"/dashboard" }, { icon:Users, label:"Browse Wellness Experts", href:"/experts" }],
  positive:   [{ icon:ArrowRight, label:"View Your Wellness Dashboard", href:"/dashboard" }, { icon:BookOpen, label:"Begin Another Assessment", href:"/checkin" }],
};

export default function AssessmentResultCard({ emotions, answers, onReset, reflection }: AssessmentResultCardProps) {
  const { mood, theme } = useMood();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const isDoctorSession = !!params.get("doctor_id");

  const [analysis, setAnalysis] = useState<AssessmentAnalysisResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyzeAssessment(mood ?? "neutral", emotions, answers, reflection)
      .then(setAnalysis)
      .finally(() => setLoading(false));
  }, []);

  const accentColor = theme?.accent ?? "hsl(var(--primary))";
  const recommendation = getRecommendations(emotions);

  const level = analysis?.level ?? "positive";
  const styles = LEVEL_STYLES[level] ?? LEVEL_STYLES.positive;
  const nextSteps = NEXT_STEPS[level] ?? NEXT_STEPS.positive;

  return (
    <motion.div initial={{ opacity:0, y:32, scale:0.96, filter:"blur(8px)" }} animate={{ opacity:1, y:0, scale:1, filter:"blur(0px)" }} transition={{ duration:0.75, ease:[0.22,1,0.36,1] }} className="w-full space-y-4">

      {/* Header */}
      <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }} className="text-center pb-2">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-px flex-1 rounded-full max-w-[60px]" style={{ background:`${accentColor}25` }} />
          <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground/60">Assessment Complete</span>
          <div className="h-px flex-1 rounded-full max-w-[60px]" style={{ background:`${accentColor}25` }} />
        </div>
        <h3 className="text-xl md:text-2xl font-semibold tracking-tight">Your Emotional Wellness Summary</h3>
      </motion.div>

      {/* Loading state */}
      {loading && (
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="rounded-2xl p-8 flex flex-col items-center gap-3"
          style={{ background:"rgba(255,255,255,0.55)", backdropFilter:"blur(20px)", border:"1px solid rgba(255,255,255,0.45)" }}>
          <Loader2 size={28} className="animate-spin" style={{ color: accentColor }} />
          <p className="text-sm text-muted-foreground">Generating your personalized wellness analysis...</p>
        </motion.div>
      )}

      {/* Result card */}
      {!loading && analysis && (
        <>
          <motion.div initial={{ opacity:0, y:20, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ delay:0.18, duration:0.7, ease:[0.22,1,0.36,1] }}
            className="rounded-2xl p-6 relative overflow-hidden"
            style={{ background:"rgba(255,255,255,0.55)", backdropFilter:"blur(20px)", border:`1px solid ${styles.badgeBorder}` }}>
            {theme && <div className="absolute inset-0 pointer-events-none" style={{ background:`radial-gradient(ellipse at 80% 20%, ${theme.bg1}40, transparent 65%)` }} />}
            <div className="relative z-10">
              <div className="flex items-start justify-between gap-4 mb-3 flex-wrap">
                <motion.div initial={{ opacity:0, scale:0.8 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.35, type:"spring", stiffness:280, damping:22 }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border"
                  style={{ background:styles.badgeBg, borderColor:styles.badgeBorder, color:styles.badgeColor }}>
                  <ShieldCheck size={11} />
                  {styles.badge}
                </motion.div>
                {analysis.emotional_category && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background:`${accentColor}12`, color:accentColor, border:`1px solid ${accentColor}25` }}>
                    {analysis.emotional_category}
                  </span>
                )}
              </div>
              <h4 className="text-base font-semibold mb-2 leading-snug">{analysis.headline}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{analysis.body}</p>

              {/* Wellness + Stress scores */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                {[["Wellness Score", analysis.wellness_score, accentColor], ["Stress Level", analysis.stress_score, analysis.stress_score > 60 ? "#f87171" : "#10b981"]].map(([label, val, color]) => (
                  <div key={label as string} className="rounded-xl p-3 text-center" style={{ background:"rgba(0,0,0,0.03)", border:"1px solid rgba(0,0,0,0.06)" }}>
                    <p className="text-lg font-bold" style={{ color: color as string }}>{val as number}/100</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{label as string}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Identified patterns */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="rounded-2xl p-5"
            style={{ background:"rgba(255,255,255,0.45)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.45)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">Identified Patterns</p>
            <div className="space-y-2">
              {analysis.indicators.map((indicator, i) => (
                <motion.div key={i} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.35+i*0.07 }} className="flex items-center gap-2.5 text-sm text-foreground/75">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background:styles.badgeColor }} />
                  {indicator}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Strengths */}
          {analysis.strengths?.length > 0 && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.34 }} className="rounded-2xl p-5"
              style={{ background:"rgba(255,255,255,0.45)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.45)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">Your Emotional Strengths</p>
              <div className="flex flex-wrap gap-2">
                {analysis.strengths.map((s, i) => (
                  <span key={i} className="text-xs font-medium px-3 py-1 rounded-full" style={{ background:`${accentColor}12`, color:accentColor, border:`1px solid ${accentColor}25` }}>{s}</span>
                ))}
              </div>
            </motion.div>
          )}

          {/* Emotion breakdown */}
          <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.38 }} className="rounded-2xl p-5"
            style={{ background:"rgba(255,255,255,0.45)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.45)" }}>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">Detected Emotional Profile</p>
            <div className="space-y-3">
              {emotions.slice(0, 5).map((e, i) => (
                <motion.div key={e.label} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.42+i*0.06 }}>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium capitalize text-foreground/75">{e.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{formatScore(e.score)}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <motion.div className={`h-full rounded-full bg-gradient-to-r ${styles.barColor}`} initial={{ width:0 }} animate={{ width:`${e.score*100}%` }} transition={{ delay:0.5+i*0.06, duration:0.65, ease:[0.22,1,0.36,1] }} />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Recommendations */}
          {analysis.recommendations?.length > 0 && (
            <motion.div initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.42 }} className="rounded-2xl p-5"
              style={{ background:"rgba(255,255,255,0.45)", backdropFilter:"blur(16px)", border:"1px solid rgba(255,255,255,0.45)" }}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-4">Personalized Recommendations</p>
              <div className="space-y-2">
                {analysis.recommendations.map((r, i) => (
                  <motion.div key={i} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.45+i*0.07 }} className="flex items-start gap-2.5 text-sm text-foreground/75">
                    <span className="text-base flex-shrink-0">{"🌱🧘💬".charAt(i)}</span>
                    {r}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Disclaimer */}
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.55 }} className="rounded-xl px-4 py-3 text-xs text-muted-foreground/60 leading-relaxed"
            style={{ background:"rgba(0,0,0,0.025)", border:"1px solid rgba(0,0,0,0.05)" }}>
            <strong className="text-muted-foreground/80">Important:</strong> This assessment is a wellness screening tool, not a clinical diagnosis. Results are indicative only.
            {analysis.ai_generated && <span className="ml-1 text-muted-foreground/40">· AI-generated analysis</span>}
          </motion.div>

          {/* Next steps */}
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }} className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3">Recommended Next Steps</p>

            {isDoctorSession && (
              <Link href="/doctor">
                <motion.div whileHover={{ x:4 }} className="flex items-center gap-3 rounded-xl px-4 py-3.5 cursor-pointer group mb-1"
                  style={{ background:"rgba(14,165,233,0.08)", backdropFilter:"blur(12px)", border:"1.5px solid rgba(14,165,233,0.3)" }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:"rgba(14,165,233,0.15)" }}>
                    <Stethoscope size={15} style={{ color:"#0ea5e9" }} />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-foreground/90 block">Return to Doctor Portal</span>
                    <span className="text-xs text-muted-foreground">View saved patient data & session history</span>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground/40" />
                </motion.div>
              </Link>
            )}

            {nextSteps.map((step, i) => (
              <Link key={i} href={step.href}>
                <motion.div whileHover={{ x:4 }} className="flex items-center gap-3 rounded-xl px-4 py-3.5 cursor-pointer group"
                  style={{ background:"rgba(255,255,255,0.5)", backdropFilter:"blur(12px)", border:`1px solid ${accentColor}20` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background:`${accentColor}12` }}>
                    <step.icon size={15} style={{ color:accentColor }} />
                  </div>
                  <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground">{step.label}</span>
                  <ArrowRight size={14} className="ml-auto text-muted-foreground/40" />
                </motion.div>
              </Link>
            ))}
          </motion.div>

          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }} className="flex justify-center pt-2">
            <Button variant="ghost" size="sm" onClick={onReset} className="rounded-full gap-2 text-muted-foreground/60 hover:text-muted-foreground text-xs">
              <RefreshCw size={12} /> Retake Assessment
            </Button>
          </motion.div>

          <ProfessionalSupportSection recommendation={recommendation} />
        </>
      )}
    </motion.div>
  );
}
