/**
 * ProfessionalSupportSection
 * ─────────────────────────────────────────────────────────────────────────
 * Shown after the AssessmentResultCard when emotional distress patterns
 * are detected (moderate or elevated level).
 *
 * Displays personalised mental wellness professional recommendations
 * from the curated Hyderabad dataset.
 *
 * Language is always supportive and non-diagnostic.
 * NEVER shown for positive / stable assessments.
 */

import { motion, AnimatePresence } from "framer-motion";
import { Heart, MapPin, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import DoctorRecommendationCard from "@/components/DoctorRecommendationCard";
import { useMood } from "@/contexts/MoodContext";
import type { RecommendationResult } from "@/services/doctorRecommendationService";

interface ProfessionalSupportSectionProps {
  recommendation: RecommendationResult;
}

const LEVEL_HEADER = {
  elevated: {
    eyebrow: "Personalised Support Options",
    headline: "You may benefit from speaking with a wellness professional",
    subtext:
      "Based on your emotional assessment patterns, these Hyderabad-based mental wellness professionals may offer meaningful support. Reaching out is a sign of strength.",
  },
  moderate: {
    eyebrow: "Additional Support Available",
    headline: "These professionals may help support your emotional wellbeing",
    subtext:
      "Your assessment suggests some emotional strain. Speaking with a wellness professional can provide helpful tools and a safe space to process your feelings.",
  },
  positive: {
    eyebrow: "",
    headline: "",
    subtext: "",
  },
};

export default function ProfessionalSupportSection({
  recommendation,
}: ProfessionalSupportSectionProps) {
  const { theme } = useMood();
  const accentColor = theme?.accent ?? "hsl(var(--primary))";

  if (!recommendation.shouldShow || recommendation.professionals.length === 0) {
    return null;
  }

  const header = LEVEL_HEADER[recommendation.level];

  return (
    <AnimatePresence>
      <motion.section
        initial={{ opacity: 0, y: 40, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.75, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
        className="w-full mt-8"
        aria-label="Professional Support Recommendations"
      >
        {/* ── Divider ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 rounded-full" style={{ background: `${accentColor}20` }} />
          <div
            className="flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: theme ? `${theme.bg1}60` : "rgba(99,102,241,0.07)",
              border: `1px solid ${accentColor}25`,
              color: accentColor,
            }}
          >
            <Heart size={12} />
            <span>Professional Support</span>
          </div>
          <div className="h-px flex-1 rounded-full" style={{ background: `${accentColor}20` }} />
        </div>

        {/* ── Section header ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: accentColor }}
          >
            {header.eyebrow}
          </p>
          <h3 className="text-xl md:text-2xl font-semibold tracking-tight mb-3 leading-snug">
            {header.headline}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
            {recommendation.supportMessage || header.subtext}
          </p>
        </motion.div>

        {/* ── Location badge ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 mb-6"
        >
          <div
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground"
            style={{
              background: "rgba(0,0,0,0.04)",
              border: "1px solid rgba(0,0,0,0.07)",
            }}
          >
            <MapPin size={11} />
            <span>Hyderabad, Telangana · Verified Professionals</span>
          </div>
        </motion.div>

        {/* ── Professional cards ───────────────────────────────────── */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: {
              transition: { staggerChildren: 0.13, delayChildren: 0.5 },
            },
          }}
        >
          {recommendation.professionals.map((pro, i) => (
            <DoctorRecommendationCard
              key={pro.id}
              professional={pro}
              index={i}
            />
          ))}
        </motion.div>

        {/* ── View all experts CTA ─────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3"
        >
          <Link href="/experts">
            <Button
              variant="outline"
              className="rounded-full gap-2 px-6 border-border hover:bg-primary/5 transition-colors"
            >
              View All Hyderabad Professionals
              <ChevronRight size={14} />
            </Button>
          </Link>
        </motion.div>

        {/* ── Disclaimer ───────────────────────────────────────────── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.75 }}
          className="text-center text-xs text-muted-foreground/45 mt-6 max-w-lg mx-auto leading-relaxed"
        >
          These recommendations are based on your emotional assessment patterns and are not a
          clinical diagnosis. Consultation fees and availability are subject to change.
          Always verify professional credentials independently.
        </motion.p>
      </motion.section>
    </AnimatePresence>
  );
}
