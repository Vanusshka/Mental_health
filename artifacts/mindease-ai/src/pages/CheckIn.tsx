/**
 * CheckIn Page — /checkin
 * The primary emotional wellness assessment experience.
 * Hosts the full EmotionalAssessmentFlow (4 stages):
 *   1. Guided Reflection (emotion detection)
 *   2. Reflection Input (deeper context)
 *   3. Wellness Questionnaire (Gemini-generated)
 *   4. Assessment Result (wellness summary)
 */

import { motion } from "framer-motion";
import PageTransition from "@/components/PageTransition";
import EmotionalAssessmentFlow from "@/components/EmotionalAssessmentFlow";
import { useMood } from "@/contexts/MoodContext";

export default function CheckIn() {
  const { theme: moodTheme } = useMood();

  return (
    <PageTransition>
      <div className="min-h-screen px-6 py-14">
        <div className="container mx-auto max-w-3xl">
          {/* Page header */}
          <motion.div
            className="text-center mb-12"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
            }}
          >
            <motion.div
              variants={{
                hidden:  { opacity: 0, y: -10, filter: "blur(4px)" },
                visible: { opacity: 1, y: 0,   filter: "blur(0px)", transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
              }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/60 dark:bg-white/10 backdrop-blur-md border border-white/40 text-sm font-medium text-muted-foreground mb-5"
            >
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              Emotional Wellness Assessment
            </motion.div>

            <motion.h1
              className="text-4xl md:text-5xl font-semibold tracking-tight mb-4 bg-gradient-to-br from-foreground via-foreground/90 to-foreground/60 bg-clip-text text-transparent"
              variants={{
                hidden:  { opacity: 0, y: 18, filter: "blur(5px)" },
                visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
              }}
            >
              Your Emotional Check-In
            </motion.h1>

            <motion.p
              className="text-muted-foreground text-base max-w-lg mx-auto leading-relaxed"
              variants={{
                hidden:  { opacity: 0, filter: "blur(3px)" },
                visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
              }}
            >
              A guided, AI-powered assessment to understand your emotional state
              and provide personalised wellness insights.
            </motion.p>
          </motion.div>

          {/* Assessment container */}
          <motion.div
            className="relative rounded-[2rem] overflow-hidden p-px"
            animate={{
              background: moodTheme
                ? `linear-gradient(135deg, ${moodTheme.particle1}60, ${moodTheme.accent}40, ${moodTheme.particle2}60)`
                : "linear-gradient(135deg, rgba(99,102,241,0.3), rgba(56,189,248,0.2), rgba(99,102,241,0.3))",
            }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          >
            <div className="rounded-[calc(2rem-1px)] bg-background/80 backdrop-blur-xl p-8 md:p-12">
              <EmotionalAssessmentFlow />
            </div>
          </motion.div>

          {/* Reassurance note */}
          <motion.p
            className="text-center text-xs text-muted-foreground/45 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Your responses are processed privately and never stored or shared with third parties.
          </motion.p>
        </div>
      </div>
    </PageTransition>
  );
}
