/**
 * WellnessQuestionnaire
 * ─────────────────────────────────────────────────────────────────────────
 * Stage 3 — Guided Wellness Assessment
 *
 * Displays Gemini-generated questions as structured multiple-choice cards.
 * One question is shown at a time. Answers are selectable option buttons —
 * no free-text typing required.
 *
 * Answer options:
 *   - Default: frequency scale (Never → Very Often)
 *   - Contextually adapted based on question content
 *
 * This is a STRUCTURED ASSESSMENT — not a chatbot.
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClipboardList, Loader2, AlertCircle, RefreshCw, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateQuestions } from "@/services/questionnaireApi";
import { useMood } from "@/contexts/MoodContext";
import type { EmotionScore } from "@/services/emotionApi";

interface WellnessQuestionnaireProps {
  userText: string;
  reflection: string;
  emotions: EmotionScore[];
  onComplete: (answers: { question: string; answer: string }[]) => void;
  onReset: () => void;
}

type QAState = { question: string; answer: string | null };

// ── Answer option sets ─────────────────────────────────────────────────────

const FREQUENCY_OPTIONS = [
  { label: "Never",      value: "never",      emoji: "○" },
  { label: "Rarely",     value: "rarely",     emoji: "◔" },
  { label: "Sometimes",  value: "sometimes",  emoji: "◑" },
  { label: "Often",      value: "often",      emoji: "◕" },
  { label: "Very Often", value: "very_often", emoji: "●" },
];

const DURATION_OPTIONS = [
  { label: "Just today",      value: "just_today",    emoji: "🌅" },
  { label: "A few days",      value: "few_days",      emoji: "📅" },
  { label: "About a week",    value: "about_a_week",  emoji: "🗓️" },
  { label: "Several weeks",   value: "several_weeks", emoji: "📆" },
  { label: "A month or more", value: "month_or_more", emoji: "🌙" },
];

const SUPPORT_OPTIONS = [
  { label: "Close friends",   value: "close_friends",  emoji: "👥" },
  { label: "Family",          value: "family",         emoji: "🏠" },
  { label: "A professional",  value: "professional",   emoji: "🩺" },
  { label: "Online community", value: "online",        emoji: "💬" },
  { label: "No one right now", value: "no_one",        emoji: "🌿" },
];

const IMPACT_OPTIONS = [
  { label: "Not at all",       value: "not_at_all",    emoji: "😌" },
  { label: "Slightly",         value: "slightly",      emoji: "🙂" },
  { label: "Moderately",       value: "moderately",    emoji: "😐" },
  { label: "Quite a bit",      value: "quite_a_bit",   emoji: "😔" },
  { label: "Significantly",    value: "significantly",  emoji: "😞" },
];

type OptionSet = typeof FREQUENCY_OPTIONS;

/**
 * Heuristically pick the most relevant option set for a question.
 * Falls back to frequency options.
 */
function pickOptions(question: string): OptionSet {
  const q = question.toLowerCase();
  if (q.includes("how long") || q.includes("since when") || q.includes("duration") || q.includes("been feeling")) {
    return DURATION_OPTIONS;
  }
  if (q.includes("who") || q.includes("support") || q.includes("talk to") || q.includes("share") || q.includes("help")) {
    return SUPPORT_OPTIONS;
  }
  if (q.includes("impact") || q.includes("affect") || q.includes("influenc") || q.includes("daily") || q.includes("life")) {
    return IMPACT_OPTIONS;
  }
  return FREQUENCY_OPTIONS;
}

// ── Loading messages ───────────────────────────────────────────────────────

const LOADING_MESSAGES = {
  sad:     ["Preparing your personalised assessment…", "Generating contextual questions…", "Almost ready…"],
  happy:   ["Tailoring your wellness assessment…",     "Preparing reflective questions…",  "Almost ready…"],
  neutral: ["Building your assessment…",               "Generating wellness questions…",   "Almost ready…"],
};

// ── Component ──────────────────────────────────────────────────────────────

export default function WellnessQuestionnaire({
  userText,
  reflection,
  emotions,
  onComplete,
  onReset,
}: WellnessQuestionnaireProps) {
  const { mood, theme } = useMood();
  const [qaList, setQaList]           = useState<QAState[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredOption, setHoveredOption] = useState<string | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);

  const moodKey        = (mood ?? "neutral") as keyof typeof LOADING_MESSAGES;
  const loadingMessages = LOADING_MESSAGES[moodKey];
  const accentColor    = theme?.accent ?? "hsl(var(--primary))";
  const isKeyMissing   = (error ?? "").toLowerCase().includes("gemini_api_key") || (error ?? "").toLowerCase().includes("api key");
  const isRateLimit    = (error ?? "").toLowerCase().includes("rate limit") || (error ?? "").toLowerCase().includes("quota") || (error ?? "").toLowerCase().includes("exhausted");

  // Cycle loading messages
  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => setLoadingMsgIdx((i) => (i + 1) % loadingMessages.length), 1900);
    return () => clearInterval(id);
  }, [isLoading, loadingMessages.length]);

  // Fetch questions from Gemini
  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const combinedText = reflection
          ? `${userText}\n\nAdditional context: ${reflection}`
          : userText;
        const result = await generateQuestions({ text: combinedText, emotions });
        if (!cancelled) {
          setQaList(result.questions.map((q) => ({ question: q, answer: null })));
          setActiveIndex(0);
        }
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to generate assessment.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [userText, reflection, emotions]);

  function handleSelectAnswer(value: string, label: string) {
    const updated = qaList.map((qa, i) =>
      i === activeIndex ? { ...qa, answer: label } : qa
    );
    setQaList(updated);
    setHoveredOption(null);

    const next = activeIndex + 1;
    if (next < qaList.length) {
      setTimeout(() => setActiveIndex(next), 420);
    } else {
      const completed = updated.filter((qa) => qa.answer !== null) as { question: string; answer: string }[];
      setTimeout(() => onComplete(completed), 500);
    }
  }

  async function handleRetry() {
    setError(null);
    setIsLoading(true);
    setQaList([]);
    setActiveIndex(0);
    try {
      const combinedText = reflection ? `${userText}\n\nAdditional context: ${reflection}` : userText;
      const result = await generateQuestions({ text: combinedText, emotions });
      setQaList(result.questions.map((q) => ({ question: q, answer: null })));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate assessment.");
    } finally {
      setIsLoading(false);
    }
  }

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
  if (error) {
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
            {isKeyMissing ? "Gemini API key not configured" : isRateLimit ? "Rate limit reached" : "Assessment generation failed"}
          </p>
          <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
            {isKeyMissing
              ? "Add your Gemini API key to backend/.env to enable AI-generated assessment questions."
              : isRateLimit
              ? "The Gemini API daily quota has been reached. This resets automatically — please try again in a few minutes or tomorrow."
              : error}
          </p>
          {isKeyMissing && (
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 text-xs underline"
              style={{ color: accentColor }}
            >
              Get a free API key →
            </a>
          )}
        </div>
        <div className="flex gap-3 mt-1">
          {!isKeyMissing && (
            <Button variant="outline" size="sm" onClick={handleRetry} className="rounded-full gap-2">
              <RefreshCw size={13} /> Retry
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={onReset} className="rounded-full text-muted-foreground">
            Start Over
          </Button>
        </div>
      </motion.div>
    );
  }

  const current = qaList[activeIndex];
  const options  = current ? pickOptions(current.question) : FREQUENCY_OPTIONS;

  // ── Assessment questions ─────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${accentColor}15` }}
        >
          <ClipboardList size={15} style={{ color: accentColor }} />
        </div>
        <div className="flex-1">
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: accentColor }}>
            Wellness Assessment
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Question {activeIndex + 1} of {qaList.length}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="flex gap-1.5 mb-7">
        {qaList.map((qa, i) => (
          <motion.div
            key={i}
            className="h-1 rounded-full flex-1 transition-all duration-500"
            style={{
              background:
                qa.answer !== null
                  ? accentColor
                  : i === activeIndex
                  ? `${accentColor}55`
                  : "rgba(0,0,0,0.08)",
            }}
          />
        ))}
      </div>

      {/* Answered questions — compact read-only */}
      <div className="space-y-2 mb-5">
        {qaList.slice(0, activeIndex).map((qa, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl px-4 py-2.5 flex items-center gap-3"
            style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}18` }}
          >
            <span
              className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-white text-[10px] font-bold"
              style={{ background: accentColor }}
            >
              <Check size={10} />
            </span>
            <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
              <p className="text-xs text-foreground/65 truncate">{qa.question}</p>
              <span
                className="text-xs font-medium flex-shrink-0 px-2.5 py-0.5 rounded-full"
                style={{ background: `${accentColor}15`, color: accentColor }}
              >
                {qa.answer}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Active question card */}
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 28, scale: 0.97, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -16, scale: 0.97, filter: "blur(4px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="rounded-2xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.65)",
              backdropFilter: "blur(20px)",
              border: `1.5px solid ${accentColor}30`,
              boxShadow: `0 8px 32px ${accentColor}12`,
            }}
          >
            {/* Question text */}
            <div className="px-6 pt-6 pb-5 flex items-start gap-3">
              <motion.div
                className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-white mt-0.5"
                style={{ background: accentColor }}
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {activeIndex + 1}
              </motion.div>
              <p className="text-base font-medium leading-relaxed text-foreground/90 pt-0.5">
                {current.question}
              </p>
            </div>

            {/* Selectable answer options */}
            <div className="px-6 pb-6">
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-5 gap-2.5"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
                }}
              >
                {options.map((opt) => {
                  const isHovered = hoveredOption === opt.value;
                  return (
                    <motion.button
                      key={opt.value}
                      variants={{
                        hidden:  { opacity: 0, y: 14, filter: "blur(3px)" },
                        visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
                      }}
                      onClick={() => handleSelectAnswer(opt.value, opt.label)}
                      onMouseEnter={() => setHoveredOption(opt.value)}
                      onMouseLeave={() => setHoveredOption(null)}
                      whileHover={{ scale: 1.04, y: -2, transition: { duration: 0.18 } }}
                      whileTap={{ scale: 0.96 }}
                      className="flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 cursor-pointer focus:outline-none focus-visible:ring-2"
                      style={{
                        background: isHovered ? `${accentColor}12` : "rgba(255,255,255,0.5)",
                        borderColor: isHovered ? `${accentColor}60` : "rgba(255,255,255,0.5)",
                        boxShadow: isHovered ? `0 4px 16px ${accentColor}20` : "none",
                        transition: "background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
                      }}
                      aria-label={opt.label}
                    >
                      <span className="text-xl select-none">{opt.emoji}</span>
                      <span
                        className="text-xs font-medium text-center leading-tight"
                        style={{
                          color: isHovered ? accentColor : "hsl(var(--foreground)/0.7)",
                          transition: "color 0.2s ease",
                        }}
                      >
                        {opt.label}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>

              <p className="text-xs text-muted-foreground/40 text-center mt-4">
                Select the option that best describes your experience
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exit link */}
      <div className="flex justify-center mt-5">
        <button
          onClick={onReset}
          className="text-xs text-muted-foreground/40 hover:text-muted-foreground/70 transition-colors"
        >
          Exit assessment
        </button>
      </div>
    </motion.div>
  );
}
