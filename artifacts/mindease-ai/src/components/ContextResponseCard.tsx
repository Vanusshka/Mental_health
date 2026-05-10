/**
 * ContextResponseCard
 * ─────────────────────────────────────────────────────────────────────────
 * Displays the Gemini-generated context-aware emotional response.
 * Used for both happy and neutral paths after the user shares their context.
 *
 * Shows:
 *   - A personalised, context-specific message from Gemini
 *   - 2–4 contextually relevant wellness suggestions
 *   - CTAs to dashboard or check-in again
 *
 * Tone: warm · personal · specific · never generic
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { Sparkles, Heart, ArrowRight, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMood } from "@/contexts/MoodContext";
import { generateContextResponse, type ContextResponseResult } from "@/services/contextResponseApi";

interface ContextResponseCardProps {
  mood: "happy" | "neutral";
  contextText: string;
  onReset: () => void;
}

const LOADING_MESSAGES = {
  happy: [
    "Reading your beautiful moment…",
    "Crafting something just for you…",
    "Almost ready…",
  ],
  neutral: [
    "Understanding your current state…",
    "Preparing personalised guidance…",
    "Almost ready…",
  ],
};

export default function ContextResponseCard({ mood, contextText, onReset }: ContextResponseCardProps) {
  const { theme } = useMood();
  const accentColor = theme?.accent ?? (mood === "happy" ? "#f97316" : "#0ea5e9");
  const glow        = theme?.glow   ?? "rgba(99,102,241,0.2)";

  const [result, setResult]         = useState<ContextResponseResult | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const loadingMessages = LOADING_MESSAGES[mood];
  const isKeyMissing = (error ?? "").toLowerCase().includes("gemini_api_key") ||
    (error ?? "").toLowerCase().includes("api key") ||
    (error ?? "").toLowerCase().includes("not set");
  const isRateLimit = (error ?? "").toLowerCase().includes("rate limit") ||
    (error ?? "").toLowerCase().includes("quota") ||
    (error ?? "").toLowerCase().includes("exhausted");

  // Cycle loading messages
  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => setLoadingMsgIdx((i) => (i + 1) % loadingMessages.length), 1800);
    return () => clearInterval(id);
  }, [isLoading, loadingMessages.length]);

  // Fetch from Gemini on mount
  useEffect(() => {
    let cancelled = false;
    async function fetch() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await generateContextResponse({ mood, context_text: contextText });
        if (!cancelled) setResult(data);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to generate response.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetch();
    return () => { cancelled = true; };
  }, [mood, contextText]);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-5 py-12"
      >
        <div className="relative flex items-center justify-center">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{ width: 44 + i * 26, height: 44 + i * 26, border: `1.5px solid ${accentColor}25` }}
              animate={{ scale: [1, 1.45, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.75, ease: "easeInOut" }}
            />
          ))}
          <motion.div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: `${accentColor}15` }}
          >
            <Loader2 size={20} style={{ color: accentColor }} className="animate-spin" />
          </motion.div>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={loadingMsgIdx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.35 }}
            className="text-sm text-muted-foreground"
          >
            {loadingMessages[loadingMsgIdx]}
          </motion.p>
        </AnimatePresence>
        <div className="flex gap-1.5">
          {[0, 1, 2, 3].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: accentColor }}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8] }}
              transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.22, ease: "easeInOut" }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !result) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center gap-4 py-10 text-center"
      >
        <div className="w-11 h-11 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertCircle size={20} className="text-destructive" />
        </div>
        <div>
          <p className="font-medium text-sm mb-1.5">
            {isKeyMissing ? "Gemini API key not configured" : isRateLimit ? "Rate limit reached" : "Couldn't generate your response"}
          </p>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            {isKeyMissing
              ? "Add your Gemini API key to backend/.env to enable personalised responses."
              : isRateLimit
              ? "The Gemini API daily quota has been reached. This resets automatically — please try again in a few minutes or tomorrow."
              : error}
          </p>
        </div>
        <div className="flex gap-3 mt-1">
          <Button variant="outline" size="sm" onClick={onReset} className="rounded-full gap-2">
            <RefreshCw size={13} /> Start Over
          </Button>
        </div>
      </motion.div>
    );
  }

  // ── Response ─────────────────────────────────────────────────────────────
  const headerEmoji = mood === "happy" ? "✨" : "🌊";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="w-full space-y-5"
    >
      {/* ── Personalised message card ─────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative overflow-hidden rounded-3xl p-7 text-center"
        style={{
          background: theme
            ? `linear-gradient(145deg, ${theme.bg1}80, ${theme.bg2}55, ${theme.bg3}35)`
            : mood === "happy"
            ? "linear-gradient(145deg, #fef3c780, #fde68a55, #fed7aa35)"
            : "linear-gradient(145deg, #e0f2fe80, #cffafe55, #d1fae535)",
          border: `1px solid ${accentColor}30`,
          boxShadow: `0 8px 40px ${glow}`,
        }}
      >
        {/* Floating particles */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 5 + i * 3,
              height: 5 + i * 3,
              background: `${accentColor}50`,
              left: `${15 + i * 30}%`,
              top: `${10 + i * 20}%`,
              opacity: 0,
            }}
            animate={{ opacity: [0, 0.6, 0], y: [0, -16, -32], scale: [0.8, 1.2, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, delay: i * 1.1, ease: "easeOut" }}
          />
        ))}

        <motion.div
          className="text-5xl mb-4 select-none"
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          {headerEmoji}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold mb-5"
          style={{
            background: `${accentColor}15`,
            border: `1px solid ${accentColor}30`,
            color: accentColor,
          }}
        >
          <Sparkles size={12} />
          <span>{mood === "happy" ? "Your Personalised Response" : "Your Wellness Guidance"}</span>
        </motion.div>

        {/* The Gemini-generated message */}
        <motion.p
          className="text-base md:text-lg font-medium leading-relaxed text-foreground/85 max-w-xl mx-auto"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {result.message}
        </motion.p>
      </motion.div>

      {/* ── Contextual suggestions ────────────────────────────────── */}
      {result.suggestions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/60 mb-3 flex items-center gap-2">
            <Heart size={12} style={{ color: accentColor }} />
            {mood === "happy" ? "Ways to Honour This Moment" : "Personalised Wellness Suggestions"}
          </p>
          <motion.div
            className="space-y-2.5"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.4 } },
            }}
          >
            {result.suggestions.map((suggestion, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden:  { opacity: 0, x: -14, filter: "blur(3px)" },
                  visible: { opacity: 1, x: 0,   filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
                }}
                whileHover={{ x: 3, transition: { duration: 0.2 } }}
                className="flex items-start gap-3 rounded-2xl px-4 py-3.5"
                style={{
                  background: "rgba(255,255,255,0.6)",
                  backdropFilter: "blur(14px)",
                  border: "1px solid rgba(255,255,255,0.5)",
                }}
              >
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 text-[10px] font-bold text-white"
                  style={{ background: accentColor }}
                >
                  {i + 1}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed">{suggestion}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* ── CTAs ──────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Link href="/dashboard" className="flex-1">
          <Button
            size="lg"
            className="w-full rounded-full gap-2 text-white border-0 hover:opacity-90 transition-opacity"
            style={{
              background: theme
                ? `linear-gradient(135deg, ${theme.particle1}, ${theme.accent})`
                : mood === "happy"
                ? "linear-gradient(135deg, #fbbf24, #f97316)"
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
        transition={{ delay: 0.65 }}
        className="text-center text-xs text-muted-foreground/45 leading-relaxed"
      >
        {mood === "happy"
          ? "MANAS is here with you — in every emotional season. 🌸"
          : "MANAS walks with you — through every emotional season. 🌿"}
      </motion.p>
    </motion.div>
  );
}
