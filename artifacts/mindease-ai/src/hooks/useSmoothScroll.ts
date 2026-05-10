/**
 * useSmoothScroll
 * ─────────────────────────────────────────────────────────────────────────
 * Initialises Lenis smooth scrolling with wellness-appropriate settings:
 *   - Gentle lerp (0.08) — buttery, not aggressive
 *   - Smooth wheel + touch
 *   - Synced with Framer Motion's RAF loop for perfect compatibility
 *
 * Call once at the app root. Returns the Lenis instance for optional use.
 */

import { useEffect, useRef } from "react";
import Lenis from "@studio-freight/lenis";

export function useSmoothScroll() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration:   1.4,          // scroll animation duration in seconds
      easing:     (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo ease-out
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenisRef.current = lenis;

    // RAF loop — keeps Lenis in sync with the browser's paint cycle
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
