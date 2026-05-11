/**
 * MoodBackground
 * ─────────────────────────────────────────────────────────────────────────
 * Fullscreen video background that swaps based on selected mood.
 * Videos: /happy.mp4 · /neutral.mp4 · /sad.mp4
 *
 * - autoplay, loop, muted, playsInline
 * - object-cover fullscreen
 * - smooth crossfade between moods via AnimatePresence
 * - semi-transparent overlay for UI readability
 * - floating particles + gradient blobs preserved on top
 */

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMood } from "@/contexts/MoodContext";

const MOOD_VIDEOS: Record<string, string> = {
  happy:   "/happy.mp4",
  neutral: "/neutral.mp4",
  sad:     "/sad.mp4",
};

// Overlay opacity per mood — keeps UI readable while video is visible
const OVERLAY_OPACITY: Record<string, number> = {
  happy:   0.45,
  neutral: 0.50,
  sad:     0.48,
};

// Overlay tint per mood
const OVERLAY_COLOR: Record<string, string> = {
  happy:   "rgba(255,248,230,VAL)",   // warm golden tint
  neutral: "rgba(236,248,255,VAL)",   // cool blue tint
  sad:     "rgba(237,233,254,VAL)",   // soft violet tint
};

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
}

function generateParticles(color1: string, color2: string, count = 22): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 6 + 2,
    duration: Math.random() * 14 + 10,
    delay: Math.random() * 6,
    color: i % 2 === 0 ? color1 : color2,
  }));
}

const PARTICLE_COLORS: Record<string, [string, string]> = {
  happy:   ["#fbbf24", "#fb923c"],
  neutral: ["#38bdf8", "#34d399"],
  sad:     ["#818cf8", "#93c5fd"],
};

// Video element that auto-plays when mounted
function VideoLayer({ src, opacity }: { src: string; opacity: number }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.load();
    v.play().catch(() => {});
  }, [src]);

  return (
    <video
      ref={ref}
      key={src}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "cover",
        opacity,
        willChange: "opacity",
      }}
    />
  );
}

export default function MoodBackground() {
  const { mood, theme } = useMood();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (mood && PARTICLE_COLORS[mood]) {
      const [c1, c2] = PARTICLE_COLORS[mood];
      setParticles(generateParticles(c1, c2, 22));
    } else {
      setParticles([]);
    }
  }, [mood]);

  const videoSrc = mood ? MOOD_VIDEOS[mood] : null;
  const overlayOpacity = mood ? OVERLAY_OPACITY[mood] : 0.6;
  const overlayColor = mood
    ? OVERLAY_COLOR[mood].replace("VAL", String(overlayOpacity))
    : `rgba(248,246,255,0.60)`;

  // Default gradient when no mood selected
  const defaultGradient =
    "radial-gradient(ellipse at 20% 30%,#f3f0ff 0%,transparent 55%),radial-gradient(ellipse at 80% 20%,#e8f4fd 0%,transparent 50%),linear-gradient(145deg,#f8f6ff 0%,#f0f4ff 100%)";

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: -10,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {/* ── Default gradient base (always present) ─────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: defaultGradient,
        }}
      />

      {/* ── Video layer with crossfade ──────────────────────────── */}
      <AnimatePresence mode="crossfade">
        {videoSrc && (
          <motion.div
            key={videoSrc}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0 }}
          >
            <VideoLayer src={videoSrc} opacity={0.55} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mood-tinted overlay for readability ────────────────── */}
      <motion.div
        animate={{ background: overlayColor }}
        transition={{ duration: 1.4, ease: "easeInOut" }}
        style={{ position: "absolute", inset: 0 }}
      />

      {/* ── Animated gradient blobs on top ─────────────────────── */}
      <motion.div
        style={{
          position: "absolute",
          width: "55vw",
          height: "55vw",
          top: "-15%",
          left: "-15%",
          borderRadius: "50%",
          filter: "blur(80px)",
          opacity: 0.22,
          pointerEvents: "none",
        }}
        animate={{
          background: theme
            ? `radial-gradient(circle,${theme.bg1},transparent 70%)`
            : "radial-gradient(circle,#f3f0ff,transparent 70%)",
          x: [0, 30, -15, 0],
          y: [0, -20, 18, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{
          position: "absolute",
          width: "42vw",
          height: "42vw",
          bottom: "-12%",
          right: "-10%",
          borderRadius: "50%",
          filter: "blur(80px)",
          opacity: 0.20,
          pointerEvents: "none",
        }}
        animate={{
          background: theme
            ? `radial-gradient(circle,${theme.bg2},transparent 70%)`
            : "radial-gradient(circle,#e8f4fd,transparent 70%)",
          x: [0, -25, 18, 0],
          y: [0, 25, -18, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* ── Floating particles ──────────────────────────────────── */}
      <AnimatePresence mode="sync">
        {particles.map((p) => (
          <motion.div
            key={`${mood}-p${p.id}`}
            style={{
              position: "absolute",
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: "50%",
              opacity: 0,
              pointerEvents: "none",
            }}
            animate={{
              opacity: [0, 0.6, 0.3, 0.6, 0],
              scale: [0.8, 1.3, 0.9, 1.2, 0.8],
              y: [0, -(30 + p.size * 4), -(15 + p.size * 2), -(40 + p.size * 5), 0],
              x: [0, p.id % 2 === 0 ? 12 : -12, p.id % 2 === 0 ? -6 : 6, 0],
            }}
            transition={{
              duration: p.duration,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </AnimatePresence>

      {/* ── Sunlight rays for happy mood ───────────────────────── */}
      <AnimatePresence>
        {mood === "happy" && (
          <>
            {[0, 60, 120, 180].map((angle, i) => (
              <motion.div
                key={`ray-${i}`}
                style={{
                  position: "absolute",
                  width: 2,
                  height: "45vh",
                  top: "5%",
                  left: "50%",
                  transformOrigin: "top center",
                  rotate: angle,
                  background: "linear-gradient(to bottom,rgba(251,191,36,0.35),transparent)",
                  pointerEvents: "none",
                }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: [0, 0.5, 0], scaleY: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 1.2, ease: "easeInOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* ── Breathing mist for sad mood ────────────────────────── */}
      <AnimatePresence>
        {mood === "sad" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.18, 0.08, 0.18, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              background: "radial-gradient(ellipse at 50% 60%,rgba(129,140,248,0.25),transparent 65%)",
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      {/* ── Soft vignette ──────────────────────────────────────── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse at center,transparent 55%,rgba(0,0,0,0.08) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
