/**
 * RoleSelection Page — /role-select
 * ─────────────────────────────────────────────────────────────────────────
 * Shown once after first Google sign-in when no role exists in Firestore.
 * User chooses: Patient (emotional wellness) or Doctor (monitoring portal).
 *
 * Role is saved to Firestore users/{uid} and the AuthContext is refreshed.
 * On subsequent logins the role is loaded automatically — this page is skipped.
 *
 * Design: premium glassmorphism · Framer Motion · emotionally warm
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Brain, Heart, Stethoscope, ArrowRight, Loader2, Sparkles, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { setUserRole, type UserRole } from "@/services/firestoreService";
import MoodBackground from "@/components/MoodBackground";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ROLES: {
  id: UserRole;
  icon: React.ElementType;
  emoji: string;
  label: string;
  tagline: string;
  description: string;
  features: string[];
  gradient: string;
  glowColor: string;
  ringColor: string;
  bgFrom: string;
}[] = [
  {
    id: "patient",
    icon: Heart,
    emoji: "🌿",
    label: "I'm here for myself",
    tagline: "Emotional Wellness Journey",
    description: "Access your personalised emotional assessment, guided reflection, and adaptive wellness insights.",
    features: [
      "Emotional Check-In & Assessment",
      "AI-powered wellness insights",
      "Guided reflection experience",
      "Personalised wellness dashboard",
    ],
    gradient: "from-violet-500 to-secondary",
    glowColor: "rgba(99,102,241,0.25)",
    ringColor: "#818cf8",
    bgFrom: "#ede9fe",
  },
  {
    id: "doctor",
    icon: Stethoscope,
    emoji: "🩺",
    label: "I'm a wellness professional",
    tagline: "Wellness Monitoring Portal",
    description: "Monitor patient emotional wellness, track progression, and access AI-generated clinical insights.",
    features: [
      "Real-time patient wellness data",
      "Emotional trend visualisation",
      "AI wellness insights per patient",
      "Priority classification system",
    ],
    gradient: "from-blue-500 to-cyan-500",
    glowColor: "rgba(56,189,248,0.25)",
    ringColor: "#38bdf8",
    bgFrom: "#e0f2fe",
  },
];

export default function RoleSelection() {
  const { user, refreshRole } = useAuth();
  const [, navigate]          = useLocation();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  async function handleConfirm() {
    if (!selected || !user) return;
    setIsSaving(true);
    setError(null);
    try {
      await setUserRole(
        user.uid,
        user.displayName ?? "Anonymous",
        user.email ?? "",
        selected,
      );
      await refreshRole();
      // Redirect based on chosen role
      navigate(selected === "doctor" ? "/doctor" : "/checkin");
    } catch (err) {
      console.error("[MANAS] Role save error:", err);
      setError("Could not save your role. Please try again.");
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12 relative overflow-hidden">
      <MoodBackground />

      <motion.div
        initial={{ opacity: 0, y: 32, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.75, ease: EASE }}
        className="w-full max-w-2xl relative z-10"
      >
        {/* ── Header ──────────────────────────────────────────────── */}
        <motion.div
          className="text-center mb-10"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } } }}
        >
          <motion.div
            variants={{ hidden: { opacity: 0, scale: 0.85 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: EASE } } }}
            className="flex items-center justify-center gap-2.5 mb-6"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/25">
              <Brain size={20} className="text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              MANAS
            </span>
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 14, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } } }}
            className="text-3xl md:text-4xl font-semibold tracking-tight mb-3"
          >
            Welcome{user?.displayName ? `, ${user.displayName.split(" ")[0]}` : ""}
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, filter: "blur(3px)" }, visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } } }}
            className="text-muted-foreground text-sm max-w-md mx-auto leading-relaxed"
          >
            Tell us how you'll be using MANAS. This helps us personalise your experience
            and direct you to the right space.
          </motion.p>
        </motion.div>

        {/* ── Role cards ──────────────────────────────────────────── */}
        <motion.div
          className="grid sm:grid-cols-2 gap-4 mb-8"
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } } }}
        >
          {ROLES.map((role) => {
            const isSelected = selected === role.id;
            return (
              <motion.button
                key={role.id}
                onClick={() => setSelected(role.id)}
                variants={{
                  hidden:  { opacity: 0, y: 24, filter: "blur(5px)" },
                  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
                }}
                whileHover={!isSaving ? { y: -5, transition: { duration: 0.22 } } : {}}
                whileTap={!isSaving ? { scale: 0.98 } : {}}
                disabled={isSaving}
                className="relative rounded-3xl p-7 text-left overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all duration-500"
                style={
                  isSelected
                    ? {
                        background: `linear-gradient(145deg, ${role.bgFrom}50, white 80%)`,
                        boxShadow: `0 20px 60px ${role.glowColor}, 0 0 0 2px ${role.ringColor}70`,
                        border: `2px solid ${role.ringColor}60`,
                      }
                    : {
                        background: "rgba(255,255,255,0.62)",
                        backdropFilter: "blur(20px)",
                        border: "1.5px solid rgba(255,255,255,0.5)",
                        boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
                      }
                }
                aria-pressed={isSelected}
              >
                {/* Background glow on selected */}
                {isSelected && (
                  <motion.div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 30% 20%, ${role.bgFrom}70, transparent 65%)` }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                )}

                {/* Bottom shimmer bar */}
                {isSelected && (
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-1 rounded-b-3xl bg-gradient-to-r ${role.gradient}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                )}

                <div className="relative z-10">
                  {/* Icon + checkmark row */}
                  <div className="flex items-start justify-between mb-5">
                    <motion.div
                      className="text-4xl select-none"
                      animate={isSelected ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                      transition={{ duration: 2.5, repeat: isSelected ? Infinity : 0, ease: "easeInOut" }}
                    >
                      {role.emoji}
                    </motion.div>

                    <AnimatePresence>
                      {isSelected && (
                        <motion.div
                          className={`w-6 h-6 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-md`}
                          initial={{ scale: 0, rotate: -90 }}
                          animate={{ scale: 1, rotate: 0 }}
                          exit={{ scale: 0 }}
                          transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                          <div className="w-2 h-2 rounded-full bg-white" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Labels */}
                  <p className={`text-xs font-semibold uppercase tracking-widest mb-1 bg-gradient-to-r ${role.gradient} bg-clip-text text-transparent`}>
                    {role.tagline}
                  </p>
                  <h3 className="text-lg font-semibold mb-2 leading-snug">{role.label}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mb-4">{role.description}</p>

                  {/* Feature list */}
                  <ul className="space-y-1.5">
                    {role.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground/80">
                        <div className="w-1 h-1 rounded-full bg-primary/40 flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Confirm button ───────────────────────────────────────── */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, y: 12, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.4, ease: EASE }}
              className="flex flex-col items-center gap-3"
            >
              <Button
                onClick={handleConfirm}
                disabled={isSaving}
                size="lg"
                className="rounded-full px-10 gap-2.5 text-white border-0 hover:opacity-90 transition-opacity shadow-lg disabled:opacity-60"
                style={{
                  background: selected === "doctor"
                    ? "linear-gradient(135deg, #3b82f6, #06b6d4)"
                    : "linear-gradient(135deg, #818cf8, #6366f1)",
                  boxShadow: selected === "doctor"
                    ? "0 8px 28px rgba(56,189,248,0.3)"
                    : "0 8px 28px rgba(129,140,248,0.3)",
                }}
              >
                {isSaving ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Setting up your space…</span>
                  </>
                ) : (
                  <>
                    <span>Continue as {selected === "doctor" ? "Wellness Professional" : "Patient"}</span>
                    <ArrowRight size={17} />
                  </>
                )}
              </Button>

              {error && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-destructive text-center"
                >
                  {error}
                </motion.p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Footer note ──────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex items-center justify-center gap-2 mt-8"
        >
          <Sparkles size={11} className="text-muted-foreground/40" />
          <p className="text-[11px] text-muted-foreground/45 text-center">
            Your role is saved securely. You can contact support to change it later.
          </p>
          <Shield size={11} className="text-muted-foreground/40" />
        </motion.div>
      </motion.div>
    </div>
  );
}
