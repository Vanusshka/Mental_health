/**
 * MusicPlayer — Spotify mood-mapped music
 * ─────────────────────────────────────────────────────────────────────────
 * Maps each mood to a Spotify track and embeds it as a compact iframe.
 * Visible ONLY during the emotional flow (/checkin, /mood).
 * Hidden automatically on /dashboard, /session-summary, /doctor, /org, /experts.
 *
 * Happy  → Sunset Lover — Petit Biscuit
 * Neutral→ Weightless   — Marconi Union
 * Sad    → Nuvole Bianche — Ludovico Einaudi
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, ChevronDown, ChevronUp, X } from "lucide-react";
import { useMood } from "@/contexts/MoodContext";
import { useLocation } from "wouter";

// ── Spotify track IDs ──────────────────────────────────────────────────────
const SPOTIFY_TRACKS: Record<string, { id: string; title: string; artist: string }> = {
  happy: {
    id: "3WRQUvzRvBDr4AxMWhXc5E",
    title: "Sunset Lover",
    artist: "Petit Biscuit",
  },
  neutral: {
    id: "6kkwzB6hXLIONkEk9JciA6",
    title: "Weightless",
    artist: "Marconi Union",
  },
  sad: {
    id: "2VdT56BGpdqNHUgOe1j5vc",
    title: "Nuvole Bianche",
    artist: "Ludovico Einaudi",
  },
};

// Pages where the player should be hidden
const HIDDEN_PATHS = ["/dashboard", "/session-summary", "/doctor", "/org", "/experts", "/login", "/", "/role-select"];

// Mood accent colors
const MOOD_COLORS: Record<string, { accent: string; glow: string; gradient: string }> = {
  happy:   { accent: "#f97316", glow: "rgba(251,191,36,0.35)", gradient: "linear-gradient(135deg,#fbbf24,#fb923c)" },
  neutral: { accent: "#0ea5e9", glow: "rgba(56,189,248,0.30)", gradient: "linear-gradient(135deg,#38bdf8,#34d399)" },
  sad:     { accent: "#6366f1", glow: "rgba(129,140,248,0.32)", gradient: "linear-gradient(135deg,#818cf8,#93c5fd)" },
};

export default function MusicPlayer() {
  const { mood } = useMood();
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Reset dismissed state when mood changes
  const [lastMood, setLastMood] = useState(mood);
  if (mood !== lastMood) {
    setLastMood(mood);
    setDismissed(false);
  }

  // Hide on non-checkin pages or when dismissed or no mood
  const shouldHide =
    !mood ||
    dismissed ||
    HIDDEN_PATHS.some((p) => location === p) ||
    location.startsWith("/workshop");

  if (shouldHide) return null;

  const track = SPOTIFY_TRACKS[mood];
  const colors = MOOD_COLORS[mood];
  if (!track || !colors) return null;

  const embedUrl = `https://open.spotify.com/embed/track/${track.id}?utm_source=generator&theme=0&autoplay=1`;

  const moodEmoji: Record<string, string> = { happy: "😊", neutral: "😐", sad: "😔" };
  const moodLabel: Record<string, string> = { happy: "Uplifting Vibes", neutral: "Focus Ambient", sad: "Soothing Calm" };

  return (
    <AnimatePresence>
      <motion.div
        key={`player-${mood}`}
        initial={{ opacity: 0, y: 40, scale: 0.88 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 40, scale: 0.88 }}
        transition={{ type: "spring", stiffness: 260, damping: 22 }}
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 50,
          width: expanded ? 320 : "auto",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.82)",
            backdropFilter: "blur(24px) saturate(180%)",
            WebkitBackdropFilter: "blur(24px) saturate(180%)",
            borderRadius: expanded ? 20 : 50,
            border: `1px solid ${colors.accent}30`,
            boxShadow: `0 8px 32px ${colors.glow}, 0 2px 8px rgba(0,0,0,0.06)`,
            overflow: "hidden",
            transition: "border-radius 0.3s ease",
          }}
        >
          {/* ── Collapsed pill ─────────────────────────────────── */}
          {!expanded && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.6rem",
                padding: "0.55rem 0.9rem 0.55rem 0.7rem",
                cursor: "pointer",
              }}
              onClick={() => setExpanded(true)}
            >
              {/* Pulsing orb */}
              <div style={{ position: "relative", flexShrink: 0 }}>
                <motion.div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: colors.gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: `0 4px 14px ${colors.glow}`,
                  }}
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Music2 size={15} color="white" />
                </motion.div>
                {/* Ripple */}
                <motion.div
                  style={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    border: `2px solid ${colors.accent}`,
                  }}
                  animate={{ scale: [1, 1.8], opacity: [0.5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              </div>

              {/* Track info */}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827", lineHeight: 1.2, whiteSpace: "nowrap" }}>
                  {moodEmoji[mood]} {moodLabel[mood]}
                </p>
                <p style={{ fontSize: "0.68rem", color: "#6b7280", whiteSpace: "nowrap", marginTop: 1 }}>
                  {track.title} · {track.artist}
                </p>
              </div>

              {/* Expand icon */}
              <ChevronUp size={14} color="#9ca3af" style={{ flexShrink: 0 }} />
            </div>
          )}

          {/* ── Expanded Spotify embed ──────────────────────────── */}
          {expanded && (
            <div>
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0.75rem 1rem 0.5rem",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <motion.div
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: colors.gradient,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Music2 size={13} color="white" />
                  </motion.div>
                  <div>
                    <p style={{ fontSize: "0.72rem", fontWeight: 700, color: "#111827", lineHeight: 1 }}>
                      {moodEmoji[mood]} {moodLabel[mood]}
                    </p>
                    <p style={{ fontSize: "0.65rem", color: "#6b7280", marginTop: 1 }}>
                      Mood-matched music
                    </p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.25rem" }}>
                  <button
                    onClick={() => setExpanded(false)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#9ca3af" }}
                    title="Collapse"
                  >
                    <ChevronDown size={15} />
                  </button>
                  <button
                    onClick={() => setDismissed(true)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: 4, borderRadius: 6, color: "#9ca3af" }}
                    title="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Spotify iframe */}
              <div style={{ padding: "0 0.75rem 0.75rem" }}>
                <iframe
                  key={track.id}
                  src={embedUrl}
                  width="100%"
                  height="80"
                  frameBorder="0"
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  style={{
                    borderRadius: 12,
                    display: "block",
                    border: "none",
                  }}
                  title={`${track.title} by ${track.artist}`}
                />
                <p style={{ fontSize: "0.62rem", color: "#9ca3af", textAlign: "center", marginTop: "0.4rem" }}>
                  Requires Spotify account · Opens in Spotify app
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
