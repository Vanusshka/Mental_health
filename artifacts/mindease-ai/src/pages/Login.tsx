/**
 * Login Page — MindEase AI
 * Dropdown role selector + credentials form → redirect to portal
 * Blends with the warm watercolor MANAS aesthetic
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Brain, ChevronDown, Eye, EyeOff, ArrowRight, Heart, Stethoscope, Building2, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/services/authService";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ROLES = [
  { id: "user",   label: "Individual User",      icon: Heart,        color: "#8b5cf6", path: "/checkin",  desc: "Personal wellness & emotional support" },
  { id: "doctor", label: "Doctor / Therapist",   icon: Stethoscope,  color: "#0ea5e9", path: "/doctor",   desc: "Patient monitoring & clinical insights" },
  { id: "org",    label: "Organization / NGO",   icon: Building2,    color: "#10b981", path: "/org",      desc: "Community wellness & workshop analytics" },
];

// Demo credentials (any input works — just needs to be non-empty)
const DEMO_HINT: Record<string, string> = {
  user:   "demo@mindease.ai",
  doctor: "doctor@mindease.ai",
  org:    "org@mindease.ai",
};

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [role, setRole]           = useState("");
  const [dropOpen, setDropOpen]   = useState(false);
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [showPass, setShowPass]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");

  const selectedRole = ROLES.find(r => r.id === role);

  function handleRoleSelect(id: string) {
    setRole(id);
    setDropOpen(false);
    setError("");
    setEmail(DEMO_HINT[id] || "");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role) { setError("Please select your role."); return; }
    if (!email.trim()) { setError("Please enter your email."); return; }
    if (!password.trim()) { setError("Please enter your password."); return; }
    setLoading(true);
    setError("");
    await new Promise(r => setTimeout(r, 700));
    login(email, role as UserRole);
    setLoading(false);
    navigate(selectedRole!.path);
  }

  const inp = {
    width: "100%",
    padding: "0.75rem 1rem",
    borderRadius: 12,
    border: "1.5px solid rgba(180,140,110,0.25)",
    background: "rgba(255,255,255,0.7)",
    fontSize: "0.9rem",
    outline: "none",
    color: "#3d2b1f",
    fontFamily: "inherit",
    boxSizing: "border-box" as const,
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background — same image blurred */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <img src="/landingpage.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(8px) brightness(1.05) saturate(0.9)", transform: "scale(1.05)" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,245,235,0.55)" }} />
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 28, scale: 0.96, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: EASE }}
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: 420,
          background: "rgba(255,252,248,0.88)",
          backdropFilter: "blur(28px) saturate(160%)",
          WebkitBackdropFilter: "blur(28px) saturate(160%)",
          borderRadius: 28,
          padding: "2.25rem 2rem",
          border: "1.5px solid rgba(200,160,120,0.25)",
          boxShadow: "0 20px 60px rgba(160,100,60,0.12), 0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.75rem" }}>
          <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#c17b5c,#8b6f47)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 16px rgba(160,82,45,0.3)" }}>
            <Brain size={22} color="white" />
          </div>
          <div>
            <p style={{ fontSize: "1.1rem", fontWeight: 800, color: "#5c3d2e", letterSpacing: "-0.02em" }}>MindEase AI</p>
            <p style={{ fontSize: "0.72rem", color: "#9c7a6a" }}>Emotional Wellness Platform</p>
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          style={{ fontSize: "1.4rem", fontWeight: 800, color: "#3d2b1f", marginBottom: "0.4rem", letterSpacing: "-0.02em" }}>
          Welcome back
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          style={{ fontSize: "0.85rem", color: "#9c7a6a", marginBottom: "1.75rem", lineHeight: 1.5 }}>
          Sign in to continue your wellness journey
        </motion.p>

        <form onSubmit={handleSubmit}>
          {/* Role Dropdown */}
          <div style={{ marginBottom: "1rem", position: "relative" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c5c4a", display: "block", marginBottom: "0.4rem" }}>
              I am a...
            </label>
            <button type="button" onClick={() => setDropOpen(o => !o)}
              style={{
                ...inp,
                display: "flex", alignItems: "center", justifyContent: "space-between",
                cursor: "pointer", border: dropOpen ? "1.5px solid #c17b5c" : inp.border,
                boxShadow: dropOpen ? "0 0 0 3px rgba(193,123,92,0.15)" : "none",
                background: "rgba(255,255,255,0.75)",
              }}>
              {selectedRole ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <selectedRole.icon size={16} color={selectedRole.color} />
                  <span style={{ fontWeight: 600, color: "#3d2b1f" }}>{selectedRole.label}</span>
                </div>
              ) : (
                <span style={{ color: "#b09080" }}>Select your role</span>
              )}
              <motion.div animate={{ rotate: dropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={16} color="#9c7a6a" />
              </motion.div>
            </button>

            <AnimatePresence>
              {dropOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: EASE }}
                  style={{
                    position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 100,
                    background: "rgba(255,252,248,0.97)", backdropFilter: "blur(20px)",
                    borderRadius: 16, border: "1.5px solid rgba(200,160,120,0.25)",
                    boxShadow: "0 12px 40px rgba(160,100,60,0.15)", overflow: "hidden",
                  }}
                >
                  {ROLES.map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <motion.button key={r.id} type="button" onClick={() => handleRoleSelect(r.id)}
                        whileHover={{ background: "rgba(193,123,92,0.08)" }}
                        style={{
                          width: "100%", display: "flex", alignItems: "center", gap: "0.75rem",
                          padding: "0.85rem 1rem", border: "none", background: role === r.id ? "rgba(193,123,92,0.1)" : "transparent",
                          cursor: "pointer", textAlign: "left",
                          borderBottom: i < ROLES.length - 1 ? "1px solid rgba(200,160,120,0.12)" : "none",
                        }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, background: r.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={16} color={r.color} />
                        </div>
                        <div>
                          <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#3d2b1f", lineHeight: 1.2 }}>{r.label}</p>
                          <p style={{ fontSize: "0.72rem", color: "#9c7a6a", marginTop: 2 }}>{r.desc}</p>
                        </div>
                        {role === r.id && <div style={{ marginLeft: "auto", width: 8, height: 8, borderRadius: "50%", background: r.color, flexShrink: 0 }} />}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Email */}
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c5c4a", display: "block", marginBottom: "0.4rem" }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com"
              style={inp}
              onFocus={e => { e.target.style.borderColor = "#c17b5c"; e.target.style.boxShadow = "0 0 0 3px rgba(193,123,92,0.15)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(180,140,110,0.25)"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c5c4a", display: "block", marginBottom: "0.4rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                style={{ ...inp, paddingRight: "2.8rem" }}
                onFocus={e => { e.target.style.borderColor = "#c17b5c"; e.target.style.boxShadow = "0 0 0 3px rgba(193,123,92,0.15)"; }}
                onBlur={e => { e.target.style.borderColor = "rgba(180,140,110,0.25)"; e.target.style.boxShadow = "none"; }}
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9c7a6a", padding: 4 }}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ fontSize: "0.8rem", color: "#c0392b", marginBottom: "1rem", padding: "0.6rem 0.9rem", background: "rgba(192,57,43,0.07)", borderRadius: 10, border: "1px solid rgba(192,57,43,0.15)" }}>
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Submit */}
          <motion.button type="submit" disabled={loading}
            whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
            whileTap={!loading ? { scale: 0.98 } : {}}
            style={{
              width: "100%", padding: "0.85rem", borderRadius: 14,
              background: selectedRole ? `linear-gradient(135deg, ${selectedRole.color}, ${selectedRole.color}cc)` : "linear-gradient(135deg,#c17b5c,#8b6f47)",
              color: "white", border: "none", fontWeight: 700, fontSize: "0.95rem",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
              boxShadow: selectedRole ? `0 6px 24px ${selectedRole.color}40` : "0 6px 24px rgba(160,82,45,0.3)",
              opacity: loading ? 0.8 : 1, transition: "all 0.2s",
            }}>
            {loading ? <><Loader2 size={17} style={{ animation: "spin 1s linear infinite" }} /> Signing in...</> : <><ArrowRight size={17} /> Sign In</>}
          </motion.button>
        </form>

        {/* Demo note */}
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
          style={{ textAlign: "center", fontSize: "0.7rem", color: "#b09080", marginTop: "1.25rem", lineHeight: 1.5 }}>
          Demo mode — enter any credentials to access the portal
        </motion.p>
      </motion.div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
