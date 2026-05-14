/**
 * Landing Page — MANAS
 * Uses landingpage.jpg as background.
 * Shows MANAS title + tagline centered, Get Started button at bottom.
 * Fully responsive for mobile and desktop.
 */

import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowRight } from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div style={{ minHeight: "100dvh", width: "100%", position: "relative", overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>

      {/* Full-screen background image */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <img
          src="/landingpage.jpg"
          alt="MANAS"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center center" }}
        />
        {/* Gradient overlay — darker at top/bottom for text readability */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.05) 35%, rgba(0,0,0,0.05) 60%, rgba(0,0,0,0.35) 100%)",
        }} />
      </div>

      {/* ── Center content — MANAS title + tagline ── */}
      <div style={{
        position: "relative",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        padding: "0 1.5rem",
        marginTop: "-8vh", // shift slightly above center
      }}>
        {/* MANAS title */}
        <motion.h1
          initial={{ opacity: 0, y: -20, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.1, duration: 0.9, ease: EASE }}
          style={{
            fontSize: "clamp(3.5rem, 12vw, 7rem)",
            fontWeight: 900,
            letterSpacing: "0.12em",
            color: "white",
            textShadow: "0 4px 32px rgba(0,0,0,0.35), 0 1px 4px rgba(0,0,0,0.5)",
            lineHeight: 1,
            marginBottom: "0.6rem",
            fontFamily: "'Poppins', sans-serif",
          }}
        >
          MANAS
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
          style={{
            fontSize: "clamp(0.9rem, 2.5vw, 1.15rem)",
            color: "rgba(255,255,255,0.92)",
            fontWeight: 500,
            letterSpacing: "0.02em",
            textShadow: "0 2px 12px rgba(0,0,0,0.4)",
            maxWidth: 480,
            lineHeight: 1.5,
          }}
        >
          A safe space for your mental wellness and growth
        </motion.p>
      </div>

      {/* ── Bottom content — badge + button ── */}
      <div style={{
        position: "fixed",
        bottom: "clamp(1.5rem, 6vh, 4rem)",
        left: 0,
        right: 0,
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "0.85rem",
        padding: "0 1.5rem",
      }}>
        {/* Get Started Button */}
        <motion.button
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.7, ease: EASE }}
          onClick={() => navigate("/login")}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.97 }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.6rem",
            padding: "0.9rem 2.6rem",
            borderRadius: 50,
            background: "linear-gradient(135deg, rgba(255,255,255,0.95), rgba(255,248,240,0.9))",
            color: "#5c3d2e",
            border: "none",
            fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 8px 32px rgba(0,0,0,0.25), 0 2px 8px rgba(0,0,0,0.15)",
            letterSpacing: "0.02em",
            backdropFilter: "blur(12px)",
          }}
        >
          Get Started
          <ArrowRight size={17} />
        </motion.button>

        {/* Tagline below button */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.85 }}
          style={{
            fontSize: "clamp(0.65rem, 1.8vw, 0.75rem)",
            color: "rgba(255,255,255,0.65)",
            fontWeight: 500,
            textAlign: "center",
            textShadow: "0 1px 6px rgba(0,0,0,0.4)",
          }}
        >
          Your mind matters · Your feelings are valid · You are not alone
        </motion.p>
      </div>

      {/* Floating ambient particles */}
      {Array.from({ length: 10 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "fixed",
            width: 3 + (i % 3) * 2,
            height: 3 + (i % 3) * 2,
            borderRadius: "50%",
            background: ["rgba(255,255,255,0.6)", "rgba(255,220,180,0.5)", "rgba(200,180,160,0.5)"][i % 3],
            left: `${8 + (i * 8.5) % 84}%`,
            top: `${10 + (i * 11.3) % 75}%`,
            opacity: 0,
            zIndex: 5,
            pointerEvents: "none",
          }}
          animate={{ opacity: [0, 0.5, 0], y: [0, -25, -50], scale: [0.8, 1.2, 0.5] }}
          transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
