/**
 * PageTransition
 * ─────────────────────────────────────────────────────────────────────────
 * Wraps every page with a soft, emotionally calming entrance/exit animation.
 *
 * Enter: fade in + gentle upward drift + subtle blur clear
 * Exit:  fade out + slight upward drift
 *
 * The blur-clear on enter gives a "coming into focus" feeling that
 * reinforces the reflective, mindful quality of the MANAS experience.
 */

import { motion } from "framer-motion";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

const variants = {
  initial: {
    opacity: 0,
    y:       16,
    filter:  "blur(6px)",
  },
  animate: {
    opacity: 1,
    y:       0,
    filter:  "blur(0px)",
    transition: {
      duration: 0.65,
      ease:     [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  },
  exit: {
    opacity: 0,
    y:       -8,
    filter:  "blur(3px)",
    transition: {
      duration: 0.3,
      ease:     [0.4, 0, 1, 1] as [number, number, number, number],
    },
  },
};

export default function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`w-full ${className}`}
    >
      {children}
    </motion.div>
  );
}
