import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMood } from "@/contexts/MoodContext";

// Map mood → public video path
const MOOD_VIDEOS: Record<string, string> = {
  happy:   "/happy.mp4",
  neutral: "/neutral.mp4",
  sad:     "/sad.mp4",
};

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
  delay: number;
  color: string;
  shape: "circle" | "diamond";
}

function generateParticles(color1: string, color2: string, count = 28): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 7 + 2,
    duration: Math.random() * 14 + 10,
    delay: Math.random() * 6,
    color: i % 3 === 0 ? color1 : i % 3 === 1 ? color2 : `${color1}99`,
    shape: Math.random() > 0.7 ? "diamond" : "circle",
  }));
}

export default function MoodBackground() {
  const { mood, theme } = useMood();
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (theme) {
      setParticles(generateParticles(theme.particle1, theme.particle2, 28));
    } else {
      setParticles([]);
    }
  }, [mood, theme]);

  const defaultGradient =
    "radial-gradient(ellipse at 20% 30%, #f3f0ff 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, #e8f4fd 0%, transparent 50%), linear-gradient(145deg, #f8f6ff 0%, #f0f4ff 100%)";

  // Resolve video src — null when no mood selected
  const videoSrc = mood ? MOOD_VIDEOS[mood] ?? null : null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">

      {/* ── Mood video layer — renders behind gradient blobs ─────── */}
      {/* Key on videoSrc forces React to unmount/remount the <video>  */}
      {/* element when the mood changes, triggering fresh autoplay.    */}
      <AnimatePresence mode="sync">
        {videoSrc && (
          <motion.div
            key={videoSrc}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.4, ease: "easeInOut" }}
          >
            <video
              key={videoSrc}
              src={videoSrc}
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ opacity: 0.35 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      {/* Animated gradient base */}
      <motion.div
        className="absolute inset-0"
        animate={{
          background: theme ? theme.gradientCSS : defaultGradient,
        }}
        transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
      />

      {/* Blob 1 — top left */}
      <motion.div
        className="absolute rounded-full blur-[80px]"
        style={{ width: "55vw", height: "55vw", top: "-15%", left: "-15%", opacity: 0.32 }}
        animate={{
          background: theme
            ? `radial-gradient(circle, ${theme.bg1}, transparent 70%)`
            : "radial-gradient(circle, #f3f0ff, transparent 70%)",
          x: [0, 35, -15, 0],
          y: [0, -25, 20, 0],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Blob 2 — bottom right */}
      <motion.div
        className="absolute rounded-full blur-[80px]"
        style={{ width: "45vw", height: "45vw", bottom: "-12%", right: "-10%", opacity: 0.32 }}
        animate={{
          background: theme
            ? `radial-gradient(circle, ${theme.bg2}, transparent 70%)`
            : "radial-gradient(circle, #e8f4fd, transparent 70%)",
          x: [0, -30, 20, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Blob 3 — center */}
      <motion.div
        className="absolute rounded-full blur-[100px]"
        style={{ width: "38vw", height: "38vw", top: "35%", left: "28%", opacity: 0.3 }}
        animate={{
          background: theme
            ? `radial-gradient(circle, ${theme.bg3}, transparent 70%)`
            : "radial-gradient(circle, #f0f4ff, transparent 70%)",
          x: [0, 25, -20, 10, 0],
          y: [0, -20, 25, -10, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />

      {/* Shimmer rays — happy only */}
      <AnimatePresence>
        {mood === "happy" && (
          <>
            {[0, 60, 120].map((angle, i) => (
              <motion.div
                key={`ray-${i}`}
                className="absolute pointer-events-none"
                style={{
                  width: "2px",
                  height: "40vh",
                  top: "10%",
                  left: "50%",
                  transformOrigin: "top center",
                  rotate: angle,
                  background: "linear-gradient(to bottom, #fbbf2440, transparent)",
                }}
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{ opacity: [0, 0.4, 0], scaleY: [0, 1, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4, repeat: Infinity, delay: i * 1.5, ease: "easeInOut" }}
              />
            ))}
          </>
        )}
      </AnimatePresence>

      {/* Floating particles */}
      <AnimatePresence mode="sync">
        {particles.map((p) => (
          <motion.div
            key={`${mood}-p${p.id}`}
            className="absolute"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              background: p.color,
              borderRadius: p.shape === "circle" ? "50%" : "3px",
              rotate: p.shape === "diamond" ? 45 : 0,
              opacity: 0,
            }}
            animate={{
              opacity: [0, 0.65, 0.35, 0.65, 0],
              scale: [0.8, 1.2, 0.9, 1.1, 0.8],
              y: [0, -(30 + p.size * 4), -(10 + p.size * 2), -(40 + p.size * 5), 0],
              x: [0, p.id % 2 === 0 ? 15 : -15, p.id % 2 === 0 ? -8 : 8, 0],
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

      {/* Soft vignette overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 60%, rgba(255,255,255,0.08) 100%)",
        }}
      />
    </div>
  );
}
