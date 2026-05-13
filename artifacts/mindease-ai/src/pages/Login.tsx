/**
 * Login / Register Page — MANAS
 * Supports sign-in and registration for all roles.
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Brain, ChevronDown, Eye, EyeOff, ArrowRight, Heart, Stethoscope, Building2, Loader2, UserPlus, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import type { UserRole } from "@/services/authService";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const ROLES = [
  { id: "user",   label: "Individual User",    icon: Heart,       color: "#8b5cf6", path: "/checkin", desc: "Personal wellness & emotional support" },
  { id: "doctor", label: "Doctor / Therapist", icon: Stethoscope, color: "#0ea5e9", path: "/doctor",  desc: "Patient monitoring & clinical insights" },
  { id: "org",    label: "Organization / NGO", icon: Building2,   color: "#10b981", path: "/org",     desc: "Community wellness & workshop analytics" },
];

export default function Login() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole]             = useState("");
  const [dropOpen, setDropOpen]     = useState(false);
  const [email, setEmail]           = useState("");
  const [fullName, setFullName]     = useState("");
  const [orgName, setOrgName]       = useState("");
  const [password, setPassword]     = useState("");
  const [specialization, setSpec]   = useState("");
  const [showPass, setShowPass]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  const selectedRole = ROLES.find(r => r.id === role);

  function handleRoleSelect(id: string) {
    setRole(id); setDropOpen(false); setError("");
    setEmail(""); setPassword(""); setFullName(""); setOrgName(""); setSpec("");
  }

  function getDisplayName(): string {
    if (role === "doctor") return fullName.trim() || email.split("@")[0];
    if (role === "org")    return orgName.trim()  || email.split("@")[0];
    return fullName.trim() || email.split("@")[0];
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!role)          { setError("Please select your role."); return; }
    if (!email.trim())  { setError("Please enter your email."); return; }
    if (!password.trim()){ setError("Please enter your password."); return; }
    if (isRegister) {
      if (role === "doctor" && !fullName.trim()) { setError("Please enter your full name."); return; }
      if (role === "org"    && !orgName.trim())  { setError("Please enter your organization name."); return; }
      if (role === "user"   && !fullName.trim()) { setError("Please enter your name."); return; }
    }
    setLoading(true); setError("");
    await new Promise(r => setTimeout(r, 400));
    await login(email, role as UserRole, getDisplayName(), specialization || undefined);
    setLoading(false);
    navigate(selectedRole!.path);
  }

  const inp: React.CSSProperties = {
    width: "100%", padding: "0.75rem 1rem", borderRadius: 12,
    border: "1.5px solid rgba(180,140,110,0.25)", background: "rgba(255,255,255,0.7)",
    fontSize: "0.9rem", outline: "none", color: "#3d2b1f", fontFamily: "inherit",
    boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s",
  };
  const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "#c17b5c"; e.target.style.boxShadow = "0 0 0 3px rgba(193,123,92,0.15)";
  };
  const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = "rgba(180,140,110,0.25)"; e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "1.5rem", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "fixed", inset: 0, zIndex: 0 }}>
        <img src="/landingpage.png" alt="" style={{ width: "100%", height: "100%", objectFit: "cover", filter: "blur(8px) brightness(1.05) saturate(0.9)", transform: "scale(1.05)" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(255,245,235,0.55)" }} />
      </div>

      <motion.div initial={{ opacity: 0, y: 28, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, ease: EASE }}
        style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 440, background: "rgba(255,252,248,0.92)", backdropFilter: "blur(28px) saturate(160%)", WebkitBackdropFilter: "blur(28px) saturate(160%)", borderRadius: 28, padding: "2rem 1.75rem", border: "1.5px solid rgba(200,160,120,0.25)", boxShadow: "0 20px 60px rgba(160,100,60,0.12)" }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.5rem" }}>
          <div style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg,#c17b5c,#8b6f47)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Brain size={20} color="white" />
          </div>
          <div>
            <p style={{ fontSize: "1.05rem", fontWeight: 800, color: "#5c3d2e" }}>MANAS</p>
            <p style={{ fontSize: "0.7rem", color: "#9c7a6a" }}>Emotional Wellness Platform</p>
          </div>
        </div>

        {/* Sign in / Register toggle */}
        <div style={{ display: "flex", background: "rgba(0,0,0,0.05)", borderRadius: 12, padding: 4, marginBottom: "1.5rem" }}>
          {[false, true].map(isReg => (
            <button key={String(isReg)} type="button" onClick={() => { setIsRegister(isReg); setError(""); }}
              style={{ flex: 1, padding: "0.5rem", borderRadius: 9, border: "none", cursor: "pointer", fontWeight: 700, fontSize: "0.82rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.35rem", transition: "all 0.2s",
                background: isRegister === isReg ? "white" : "transparent",
                color: isRegister === isReg ? "#5c3d2e" : "#9c7a6a",
                boxShadow: isRegister === isReg ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
              }}>
              {isReg ? <UserPlus size={13} /> : <LogIn size={13} />}
              {isReg ? "Register" : "Sign In"}
            </button>
          ))}
        </div>

        <h1 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#3d2b1f", marginBottom: "0.3rem" }}>
          {isRegister ? "Create your account" : "Welcome back"}
        </h1>
        <p style={{ fontSize: "0.82rem", color: "#9c7a6a", marginBottom: "1.5rem" }}>
          {isRegister ? "Join MANAS and start your wellness journey" : "Sign in to continue your wellness journey"}
        </p>

        <form onSubmit={handleSubmit}>
          {/* Role Dropdown */}
          <div style={{ marginBottom: "1rem", position: "relative" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c5c4a", display: "block", marginBottom: "0.4rem" }}>I am a...</label>
            <button type="button" onClick={() => setDropOpen(o => !o)}
              style={{ ...inp, display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", border: dropOpen ? "1.5px solid #c17b5c" : inp.border as string, boxShadow: dropOpen ? "0 0 0 3px rgba(193,123,92,0.15)" : "none", background: "rgba(255,255,255,0.75)" }}>
              {selectedRole ? (
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <selectedRole.icon size={15} color={selectedRole.color} />
                  <span style={{ fontWeight: 600, color: "#3d2b1f", fontSize: "0.88rem" }}>{selectedRole.label}</span>
                </div>
              ) : <span style={{ color: "#b09080", fontSize: "0.88rem" }}>Select your role</span>}
              <motion.div animate={{ rotate: dropOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={15} color="#9c7a6a" />
              </motion.div>
            </button>
            <AnimatePresence>
              {dropOpen && (
                <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15, ease: EASE }}
                  style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 100, background: "rgba(255,252,248,0.97)", backdropFilter: "blur(20px)", borderRadius: 14, border: "1.5px solid rgba(200,160,120,0.25)", boxShadow: "0 12px 40px rgba(160,100,60,0.15)", overflow: "hidden" }}>
                  {ROLES.map((r, i) => {
                    const Icon = r.icon;
                    return (
                      <motion.button key={r.id} type="button" onClick={() => handleRoleSelect(r.id)} whileHover={{ background: "rgba(193,123,92,0.08)" }}
                        style={{ width: "100%", display: "flex", alignItems: "center", gap: "0.7rem", padding: "0.8rem 1rem", border: "none", background: role === r.id ? "rgba(193,123,92,0.1)" : "transparent", cursor: "pointer", textAlign: "left", borderBottom: i < ROLES.length - 1 ? "1px solid rgba(200,160,120,0.12)" : "none" }}>
                        <div style={{ width: 32, height: 32, borderRadius: 9, background: r.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon size={15} color={r.color} />
                        </div>
                        <div>
                          <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "#3d2b1f", lineHeight: 1.2 }}>{r.label}</p>
                          <p style={{ fontSize: "0.7rem", color: "#9c7a6a", marginTop: 1 }}>{r.desc}</p>
                        </div>
                        {role === r.id && <div style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: r.color, flexShrink: 0 }} />}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Name fields — shown on register OR always for doctor */}
          {(isRegister || role === "doctor") && role === "doctor" && (
            <div style={{ marginBottom: "0.85rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c5c4a", display: "block", marginBottom: "0.35rem" }}>Full Name *</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Dr. Your Name" style={inp} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          )}
          {(isRegister || role === "doctor") && role === "doctor" && (
            <div style={{ marginBottom: "0.85rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c5c4a", display: "block", marginBottom: "0.35rem" }}>Specialization (optional)</label>
              <input value={specialization} onChange={e => setSpec(e.target.value)} placeholder="e.g. Clinical Psychology" style={inp} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          )}
          {isRegister && role === "user" && (
            <div style={{ marginBottom: "0.85rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c5c4a", display: "block", marginBottom: "0.35rem" }}>Your Name *</label>
              <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" style={inp} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          )}
          {isRegister && role === "org" && (
            <div style={{ marginBottom: "0.85rem" }}>
              <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c5c4a", display: "block", marginBottom: "0.35rem" }}>Organization Name *</label>
              <input value={orgName} onChange={e => setOrgName(e.target.value)} placeholder="Your organization name" style={inp} onFocus={focusStyle} onBlur={blurStyle} />
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: "0.85rem" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c5c4a", display: "block", marginBottom: "0.35rem" }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" style={inp} onFocus={focusStyle} onBlur={blurStyle} />
          </div>

          {/* Password */}
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{ fontSize: "0.78rem", fontWeight: 700, color: "#7c5c4a", display: "block", marginBottom: "0.35rem" }}>Password</label>
            <div style={{ position: "relative" }}>
              <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" style={{ ...inp, paddingRight: "2.8rem" }} onFocus={focusStyle} onBlur={blurStyle} />
              <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9c7a6a", padding: 4 }}>
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                style={{ fontSize: "0.78rem", color: "#c0392b", marginBottom: "1rem", padding: "0.55rem 0.85rem", background: "rgba(192,57,43,0.07)", borderRadius: 9, border: "1px solid rgba(192,57,43,0.15)" }}>
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button type="submit" disabled={loading} whileHover={!loading ? { scale: 1.02, y: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}
            style={{ width: "100%", padding: "0.82rem", borderRadius: 13, background: selectedRole ? `linear-gradient(135deg, ${selectedRole.color}, ${selectedRole.color}cc)` : "linear-gradient(135deg,#c17b5c,#8b6f47)", color: "white", border: "none", fontWeight: 700, fontSize: "0.92rem", cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: selectedRole ? `0 6px 24px ${selectedRole.color}40` : "0 6px 24px rgba(160,82,45,0.3)", opacity: loading ? 0.8 : 1, transition: "all 0.2s" }}>
            {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> {isRegister ? "Creating account..." : "Signing in..."}</> : <><ArrowRight size={16} /> {isRegister ? "Create Account" : "Sign In"}</>}
          </motion.button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.7rem", color: "#b09080", marginTop: "1rem" }}>
          {isRegister ? "Already have an account? " : "New here? "}
          <button type="button" onClick={() => { setIsRegister(!isRegister); setError(""); }} style={{ background: "none", border: "none", cursor: "pointer", color: "#c17b5c", fontWeight: 700, fontSize: "0.7rem", textDecoration: "underline" }}>
            {isRegister ? "Sign In" : "Register"}
          </button>
        </p>
      </motion.div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
