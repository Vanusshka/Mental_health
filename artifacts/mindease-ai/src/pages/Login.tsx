/**
 * Login Page — MANAS
 * ─────────────────────────────────────────────────────────────────────────
 * Premium, emotionally calming Google sign-in.
 * Shows a config warning if Firebase env vars are missing.
 * Surfaces specific Firebase error codes for easier debugging.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Brain, Loader2, AlertCircle, Sparkles, Shield, Heart, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signInWithGoogle } from "@/services/authService";
import { useAuth } from "@/contexts/AuthContext";
import MoodBackground from "@/components/MoodBackground";

const WELLNESS_PILLARS = [
  { icon: Brain,    text: "Emotionally adaptive AI assessment" },
  { icon: Sparkles, text: "Personalised wellness insights"      },
  { icon: Heart,    text: "Guided emotional reflection"         },
  { icon: Shield,   text: "Private & secure — your data stays yours" },
];

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const { user, isConfigured }    = useAuth();
  const [, navigate]              = useLocation();

  // Redirect already-authenticated users
  useEffect(() => {
    if (user) navigate("/checkin");
  }, [user, navigate]);

  async function handleGoogleSignIn() {
    if (!isConfigured) {
      setError("Firebase is not configured. Add your credentials to artifacts/mindease-ai/.env and restart the dev server.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await signInWithGoogle();
      // On success: AuthContext updates user → useEffect redirects to /checkin
      // On redirect flow: page reloads, AuthContext picks up the result
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";

      // Redirect flow initiated — not an error, page will reload
      if (msg === "__redirect__") return;

      // User closed the popup — silent, no error shown
      if (msg.toLowerCase().includes("cancelled") || msg.toLowerCase().includes("closed")) {
        setIsLoading(false);
        return;
      }

      // Show the specific error message from authService
      console.error("[MANAS Auth] Login error:", err);
      setError(msg || "Sign-in failed. Please try again.");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden">
      <MoodBackground />

      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <div
          className="rounded-3xl p-8 md:p-10"
          style={{
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(28px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.55)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 1px 0 rgba(255,255,255,0.8) inset",
          }}
        >
          {/* ── Logo ──────────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-3 mb-8"
          >
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-md shadow-primary/25">
              <Brain size={22} className="text-white" />
            </div>
            <div>
              <p className="text-lg font-semibold tracking-tight bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                MANAS
              </p>
              <p className="text-[11px] text-muted-foreground">Emotional Wellness Platform</p>
            </div>
          </motion.div>

          {/* ── Config warning ────────────────────────────────────── */}
          {!isConfigured && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-2.5 rounded-xl bg-amber-50 border border-amber-200 px-4 py-3"
            >
              <Settings size={14} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-0.5">Firebase not configured</p>
                <p className="text-[11px] text-amber-600 leading-relaxed">
                  Add your Firebase credentials to <code className="font-mono bg-amber-100 px-1 rounded">artifacts/mindease-ai/.env</code> and restart the dev server to enable sign-in.
                </p>
              </div>
            </motion.div>
          )}

          {/* ── Headline ──────────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mb-2 leading-snug">
              Your emotional wellness journey starts here
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sign in to access your personalised emotional assessment, wellness insights, and progress history.
            </p>
          </motion.div>

          {/* ── Wellness pillars ──────────────────────────────────── */}
          <motion.div
            className="space-y-2.5 mb-8"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08, delayChildren: 0.32 } },
            }}
          >
            {WELLNESS_PILLARS.map((pillar, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden:  { opacity: 0, x: -14, filter: "blur(3px)" },
                  visible: { opacity: 1, x: 0,   filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
                }}
                className="flex items-center gap-3"
              >
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <pillar.icon size={13} className="text-primary" />
                </div>
                <span className="text-xs text-muted-foreground">{pillar.text}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* ── Google sign-in button ─────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              size="lg"
              className="w-full rounded-2xl gap-3 text-sm font-medium border transition-all duration-200 hover:shadow-md disabled:opacity-60"
              style={{
                background: "rgba(255,255,255,0.9)",
                color: "hsl(var(--foreground))",
                border: "1px solid rgba(0,0,0,0.12)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                height: "52px",
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-primary" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" className="flex-shrink-0">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </Button>
          </motion.div>

          {/* ── Error ─────────────────────────────────────────────── */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 flex items-start gap-2.5 rounded-xl bg-destructive/8 border border-destructive/20 px-4 py-3"
              >
                <AlertCircle size={14} className="text-destructive mt-0.5 flex-shrink-0" />
                <p className="text-xs text-muted-foreground leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Privacy note ──────────────────────────────────────── */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55 }}
            className="text-center text-[11px] text-muted-foreground/50 mt-6 leading-relaxed"
          >
            By signing in, you agree to our Terms of Service and Privacy Policy.
            Your emotional data is encrypted and never shared.
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
