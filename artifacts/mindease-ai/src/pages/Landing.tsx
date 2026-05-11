/**
 * Landing Page — MANAS / MANAS
 * Full-screen hero using the MANAS watercolor image.
 * "Get Started" → /login
 */

import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Heart, Sparkles, ArrowRight } from "lucide-react";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

export default function Landing() {
  const [, navigate] = useLocation();

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* ── Full-screen background image ─────────────────────── */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
        }}
      >
        <img
          src="/landingpage.png"
          alt="MANAS — Emotional Wellness"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center top",
            filter: "brightness(1.02) saturate(1.05)",
          }}
        />
        {/* Very light overlay to keep text crisp */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(255,248,240,0.15) 0%, rgba(255,245,235,0.25) 60%, rgba(255,240,225,0.45) 100%)",
          }}
        />
      </div>

      {/* ── Content — pushed to bottom so MANAS text in image is visible ── */}
      <div
        style={{
          position: "fixed",
          bottom: "8vh",
          left: 0,
          right: 0,
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "0 2rem",
        }}
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: EASE }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.4rem",
            padding: "0.35rem 1rem",
            borderRadius: 50,
            background: "rgba(255,255,255,0.55)",
            backdropFilter: "blur(12px)",
            border: "1px solid rgba(180,140,120,0.3)",
            fontSize: "0.75rem",
            fontWeight: 600,
            color: "#7c5c4a",
            marginBottom: "1.25rem",
            boxShadow: "0 2px 12px rgba(180,120,80,0.12)",
          }}
        >
          <Sparkles size={12} />
          AI-Assisted Emotional Wellness Platform
        </motion.div>

        {/* Get Started Button */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.7, ease: EASE }}
        >
          <motion.button
            onClick={() => navigate("/login")}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.97 }}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              padding: "0.85rem 2.4rem",
              borderRadius: 50,
              background: "linear-gradient(135deg, #c17b5c, #a0522d, #8b6f47)",
              color: "white",
              border: "none",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 8px 32px rgba(160,82,45,0.35), 0 2px 8px rgba(0,0,0,0.1)",
              letterSpacing: "0.02em",
            }}
          >
            <Heart size={17} />
            Get Started
            <ArrowRight size={17} />
          </motion.button>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          style={{
            marginTop: "0.85rem",
            fontSize: "0.78rem",
            color: "rgba(100,70,50,0.65)",
            fontWeight: 500,
          }}
        >
          Your mind matters · Your feelings are valid · You are not alone
        </motion.p>
      </div>

      {/* ── Floating ambient particles ────────────────────────── */}
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          style={{
            position: "fixed",
            width: 4 + (i % 3) * 2,
            height: 4 + (i % 3) * 2,
            borderRadius: "50%",
            background: ["#c9956c", "#b8a090", "#d4a574", "#c4b5a0"][i % 4],
            left: `${8 + (i * 7.5) % 84}%`,
            top: `${10 + (i * 11.3) % 75}%`,
            opacity: 0,
            zIndex: 5,
            pointerEvents: "none",
          }}
          animate={{ opacity: [0, 0.45, 0], y: [0, -30, -55], scale: [0.8, 1.2, 0.5] }}
          transition={{ duration: 4 + (i % 3), repeat: Infinity, delay: i * 0.5, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
