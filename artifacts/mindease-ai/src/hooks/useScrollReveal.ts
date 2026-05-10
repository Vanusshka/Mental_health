/**
 * useScrollReveal
 * ─────────────────────────────────────────────────────────────────────────
 * Returns Framer Motion variants for scroll-triggered reveal animations.
 * Designed for emotional wellness UI — breathable, never flashy.
 *
 * Usage:
 *   const { containerVariants, itemVariants } = useScrollReveal();
 *   <motion.div
 *     variants={containerVariants}
 *     initial="hidden"
 *     whileInView="visible"
 *     viewport={{ once: true, margin: "-60px" }}
 *   >
 *     <motion.div variants={itemVariants}>...</motion.div>
 *   </motion.div>
 */

type EaseTuple = [number, number, number, number];
const EASE: EaseTuple = [0.22, 1, 0.36, 1];

export function useScrollReveal(staggerDelay = 0.1) {
  // ── Stagger container ────────────────────────────────────────────────
  const containerVariants = {
    hidden:  {},
    visible: {
      transition: {
        staggerChildren: staggerDelay,
        delayChildren:   0.05,
      },
    },
  };

  // ── Standard item: fade + float up + blur clear ──────────────────────
  const itemVariants = {
    hidden:  { opacity: 0, y: 22, filter: "blur(4px)" },
    visible: {
      opacity: 1,
      y:       0,
      filter:  "blur(0px)",
      transition: { duration: 0.65, ease: EASE },
    },
  };

  // ── Card variant: lighter float, subtle scale ────────────────────────
  const cardVariants = {
    hidden:  { opacity: 0, y: 18, scale: 0.982, filter: "blur(3px)" },
    visible: {
      opacity: 1,
      y:       0,
      scale:   1,
      filter:  "blur(0px)",
      transition: { duration: 0.6, ease: EASE },
    },
  };

  // ── Float variant: for dashboard indicator cards ─────────────────────
  // Gentler — cards are small and already partially visible
  const floatVariants = {
    hidden:  { opacity: 0, y: 14, filter: "blur(2px)" },
    visible: {
      opacity: 1,
      y:       0,
      filter:  "blur(0px)",
      transition: { duration: 0.5, ease: EASE },
    },
  };

  // ── Slide variant: for horizontal reveals (insights, steps) ─────────
  const slideVariants = {
    hidden:  { opacity: 0, x: -16, filter: "blur(3px)" },
    visible: {
      opacity: 1,
      x:       0,
      filter:  "blur(0px)",
      transition: { duration: 0.55, ease: EASE },
    },
  };

  // ── Glow variant: for result/summary cards that need emphasis ────────
  const glowVariants = {
    hidden:  { opacity: 0, scale: 0.95, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      scale:   1,
      filter:  "blur(0px)",
      transition: { duration: 0.75, ease: EASE },
    },
  };

  return {
    containerVariants,
    itemVariants,
    cardVariants,
    floatVariants,
    slideVariants,
    glowVariants,
  };
}
