/**
 * DoctorRecommendationCard
 * ─────────────────────────────────────────────────────────────────────────
 * Displays a single mental wellness professional with premium glassmorphism
 * styling. Emotionally supportive, never clinical or alarming.
 */

import { motion } from "framer-motion";
import { MapPin, Clock, Star, BadgeCheck, Globe, Building2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMood } from "@/contexts/MoodContext";
import type { WellnessProfessional } from "@/data/hyderabadProfessionals";

interface DoctorRecommendationCardProps {
  professional: WellnessProfessional;
  index: number;
}

const MODE_CONFIG = {
  Online:     { color: "text-emerald-600", bg: "bg-emerald-50",  dot: "bg-emerald-400", label: "Online"     },
  "In-Person":{ color: "text-blue-600",    bg: "bg-blue-50",     dot: "bg-blue-400",    label: "In-Person"  },
  Both:       { color: "text-violet-600",  bg: "bg-violet-50",   dot: "bg-violet-400",  label: "Online & In-Person" },
};

export default function DoctorRecommendationCard({
  professional: pro,
  index,
}: DoctorRecommendationCardProps) {
  const { theme } = useMood();
  const accentColor = theme?.accent ?? "hsl(var(--primary))";
  const modeStyle = MODE_CONFIG[pro.mode];

  return (
    <motion.div
      initial={{ opacity: 0, y: 36, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        delay: 0.08 + index * 0.15,
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={{
        y: -5,
        boxShadow: `0 20px 48px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.06)`,
        transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
      }}
      className="relative rounded-2xl overflow-hidden group"
      style={{
        background: "rgba(255,255,255,0.62)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.5)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
      }}
    >
      {/* Subtle mood-reactive top border */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all duration-700"
        style={{
          background: `linear-gradient(90deg, ${accentColor}60, ${theme?.particle1 ?? accentColor}40, transparent)`,
        }}
      />

      <div className="p-5">
        {/* ── Top row: avatar + name + mode badge ─────────────────── */}
        <div className="flex items-start gap-4 mb-4">
          {/* Avatar */}
          <div
            className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${pro.avatarGradient} flex items-center justify-center text-white text-lg font-bold shadow-md flex-shrink-0`}
          >
            {pro.avatarInitials}
          </div>

          {/* Name + credentials */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h4 className="font-semibold text-sm leading-tight text-foreground">
                  {pro.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">{pro.credentials}</p>
              </div>
              {pro.studentFriendly && (
                <span className="flex-shrink-0 text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                  Student-Friendly
                </span>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-semibold">{pro.rating}</span>
              <span className="text-xs text-muted-foreground">({pro.reviews} reviews)</span>
              <BadgeCheck size={12} className="text-primary ml-0.5" />
            </div>
          </div>
        </div>

        {/* ── Specialization ───────────────────────────────────────── */}
        <div
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium mb-3"
          style={{
            background: `${accentColor}10`,
            color: accentColor,
            border: `1px solid ${accentColor}25`,
          }}
        >
          {pro.specialization}
        </div>

        {/* ── Expertise tags ───────────────────────────────────────── */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {pro.expertise.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* ── Meta info grid ───────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Clock size={11} className="flex-shrink-0" />
            <span>{pro.experience} yrs experience</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin size={11} className="flex-shrink-0" />
            <span className="truncate">{pro.location.split(",")[0]}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Building2 size={11} className="flex-shrink-0" />
            <span className="truncate">{pro.hospital}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${modeStyle.dot} animate-pulse`} />
            <span className={`font-medium ${modeStyle.color}`}>{modeStyle.label}</span>
          </div>
        </div>

        {/* ── Languages ───────────────────────────────────────────── */}
        <div className="flex items-center gap-1.5 mb-4">
          <Globe size={11} className="text-muted-foreground flex-shrink-0" />
          <span className="text-xs text-muted-foreground">{pro.languages.join(" · ")}</span>
        </div>

        {/* ── Top achievement ──────────────────────────────────────── */}
        <div
          className="rounded-xl px-3 py-2 mb-4 text-xs text-muted-foreground/80 leading-relaxed"
          style={{
            background: "rgba(0,0,0,0.025)",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          ✦ {pro.achievements[0]}
        </div>

        {/* ── Fee + CTA ────────────────────────────────────────────── */}
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Per session</p>
            <p className="text-base font-bold text-foreground">₹{pro.fee.toLocaleString()}</p>
          </div>
          <Button
            size="sm"
            className="rounded-full px-5 gap-1.5 text-white border-0 hover:opacity-90 transition-opacity shadow-md text-xs"
            style={{
              background: `linear-gradient(135deg, ${accentColor}, ${theme?.particle1 ?? accentColor})`,
              boxShadow: theme ? `0 4px 16px ${theme.glow}` : undefined,
            }}
          >
            <Phone size={12} />
            Consult Professional
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
