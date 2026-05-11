/**
 * MoodBackground
 * ─────────────────────────────────────────────────────────────────────────
 * Fullscreen video background mapped to selected mood.
 * Videos: /happy.mp4 · /neutral.mp4 · /sad.mp4
 *
 * KEY BEHAVIOUR:
 * - Video starts when mood is selected
 * - Video STAYS playing until user leaves /checkin (assessment complete)
 * - On /dashboard, /doctor, /org etc → fades back to default gradient
 * - Brighter: opacity 0.88, brightness(1.2), overlay only 0.22
 * - Smooth 2s crossfade between moods
 * - GPU-accelerated, no flicker on loop
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMood } from "@/contexts/MoodContext";
import { useLocation } from "wouter";

const MOOD_VIDEOS: Record<string, string> = {
  happy:   "/happy.mp4",
  neutral: "/neutral.mp4",
  sad:     "/sad.mp4",
};

// Pages where video background should be shown
const VIDEO_PAGES = ["/checkin", "/mood", "/"];

// Overlay tint — very light, just enough for text readability
const OVERLAY_COLOR: Record<string, string> = {
  happy:   "rgba(255,248,220,0.18)",
  neutral: "rgba(230,245,255,0.18)",
  sad:     "rgba(235,230,255,0.18)",
};

interface Particle {
  id: number; x: number; y: number;
  size: number; duration: number; delay: number; color: string;
}

function generateParticles(c1: string, c2: string, count = 20): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 5 + 2,
    duration: Math.random() * 12 + 10,
    delay: Math.random() * 5,
    color: i % 2 === 0 ? c1 : c2,
  }));
}

const PARTICLE_COLORS: Record<string, [string, string]> = {
  happy:   ["#fbbf24", "#fb923c"],
  neutral: ["#38bdf8", "#34d399"],
  sad:     ["#818cf8", "#93c5fd"],
};

function VideoLayer({ src, mood }: { src: string; mood: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.load();
    const play = () => v.play().catch(() => {});
    play();
    v.addEventListener("pause", play);
    return () => v.removeEventListener("pause", play);
  }, [src]);

  // Happy is lighter, neutral/sad are brighter
  const filterMap: Record<string, string> = {
    happy:   "brightness(1.08) saturate(1.05) contrast(1.02)",
    neutral: "brightness(1.20) saturate(1.12) contrast(1.04)",
    sad:     "brightness(1.18) saturate(1.10) contrast(1.04)",
  };

  return (
    <video
      ref={ref}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      preload="auto"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        objectPosition: "center center",
        filter: filterMap[mood] || "brightness(1.15)",
        // NO scale, NO translateZ — these cause the white edge flash
        willChange: "opacity",
        display: "block",
      }}
    />
  );
}

export default function MoodBackground() {
  const { mood, theme } = useMood();
  const [location] = useLocation();
  const [particles, setParticles] = useState<Particle[]>([]);

  // Track the last selected mood so video persists even if mood context clears
  const [activeMood, setActiveMood] = useState<string | null>(null);

  useEffect(() => {
    if (mood) setActiveMood(mood);
  }, [mood]);

  // Only show video on assessment pages
  const isAssessmentPage = VIDEO_PAGES.some(p => location === p) || location === "/checkin";

  // Clear active mood when leaving assessment pages
  useEffect(() => {
    if (!isAssessmentPage) setActiveMood(null);
  }, [isAssessmentPage]);

  useEffect(() => {
    if (activeMood && PARTICLE_COLORS[activeMood]) {
      const [c1, c2] = PARTICLE_COLORS[activeMood];
      setParticles(generateParticles(c1, c2, 20));
    } else {
      setParticles([]);
    }
  }, [activeMood]);

  const videoSrc = activeMood ? MOOD_VIDEOS[activeMood] : null;
  const overlayColor = activeMood ? OVERLAY_COLOR[activeMood] : "rgba(248,246,255,0.55)";

  const defaultGradient =
    "radial-gradient(ellipse at 20% 30%,#f3f0ff 0%,transparent 55%)," +
    "radial-gradient(ellipse at 80% 20%,#e8f4fd 0%,transparent 50%)," +
    "linear-gradient(145deg,#f8f6ff 0%,#f0f4ff 100%)";

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: -10, overflow: "hidden", pointerEvents: "none" }}>

      {/* ── Default gradient base ───────────────────────────────── */}
      <div style={{ position: "absolute", inset: 0, background: defaultGradient }} />

      {/* ── Video layer — stays until assessment done ───────────── */}
      <AnimatePresence mode="sync">
        {videoSrc && (
          <motion.div
            key={videoSrc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.92 }}   // HIGH opacity — bright and immersive
            exit={{ opacity: 0 }}
            transition={{ duration: 2.0, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <VideoLayer src={videoSrc} mood={activeMood || "neutral"} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Very light tinted overlay — just for text readability ── */}
      <motion.div
        animate={{ background: overlayColor }}
        transition={{ duration: 2.0, ease: "easeInOut" }}
        style={{ position: "absolute", inset: 0 }}
      />

      {/* ── Subtle gradient blobs (very low opacity, don't compete) */}
      {activeMood && (
        <>
          <motion.div
            style={{
              position: "absolute", width: "50vw", height: "50vw",
              top: "-15%", left: "-15%", borderRadius: "50%",
              filter: "blur(90px)", opacity: 0.08, pointerEvents: "none",
            }}
            animate={{
              background: theme
                ? `radial-gradient(circle,${theme.bg1},transparent 70%)`
                : "radial-gradient(circle,#f3f0ff,transparent 70%)",
              x: [0, 28, -12, 0], y: [0, -18, 16, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            style={{
              position: "absolute", width: "40vw", height: "40vw",
              bottom: "-12%", right: "-10%", borderRadius: "50%",
              filter: "blur(90px)", opacity: 0.07, pointerEvents: "none",
            }}
            animate={{
              background: theme
                ? `radial-gradient(circle,${theme.bg2},transparent 70%)`
                : "radial-gradient(circle,#e8f4fd,transparent 70%)",
              x: [0, -22, 16, 0], y: [0, 22, -16, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          />
        </>
      )}

      {/* ── Floating particles ──────────────────────────────────── */}
      <AnimatePresence mode="sync">
        {particles.map((p) => (
          <motion.div
            key={`${activeMood}-p${p.id}`}
            style={{
              position: "absolute",
              left: `${p.x}%`, top: `${p.y}%`,
              width: p.size, height: p.size,
              background: p.color, borderRadius: "50%",
              opacity: 0, pointerEvents: "none",
            }}
            animate={{
              opacity: [0, 0.65, 0.35, 0.65, 0],
              scale: [0.8, 1.3, 0.9, 1.2, 0.8],
              y: [0, -(28 + p.size * 4), -(12 + p.size * 2), -(38 + p.size * 5), 0],
              x: [0, p.id % 2 === 0 ? 10 : -10, p.id % 2 === 0 ? -5 : 5, 0],
            }}
            transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </AnimatePresence>

      {/* ── Sunlight rays — happy only ──────────────────────────── */}
      <AnimatePresence>
        {activeMood === "happy" && (
          <>
            {[0, 55, 110, 165].map((angle, i) => (
              <motion.div
                key={`ray-${i}`}
                style={{
                  position: "absolute", width: 2, height: "50vh",
                  top: "3%", left: "50%", transformOrigin: "top center",
                  rotate: angle,
                  background: "linear-gradient(to bottom,rgba(251,191,36,0.4),transparent)",
                  pointerEvents: "none",
                }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: [0, 0.55, 0], scaleY: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 1.1, ease: "easeInOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* ── Breathing mist — sad only ───────────────────────────── */}
      <AnimatePresence>
        {activeMood === "sad" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.15, 0.06, 0.15, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at 50% 65%,rgba(129,140,248,0.22),transparent 65%)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Soft edge vignette ──────────────────────────────────── */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,0.06) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
