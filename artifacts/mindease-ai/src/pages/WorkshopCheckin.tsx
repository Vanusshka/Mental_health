import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRoute } from "wouter";
import { CheckCircle } from "lucide-react";
import { getWorkshopById, addWorkshopParticipant } from "@/services/supabaseService";
import type { Workshop } from "@/lib/database.types";

export default function WorkshopCheckin() {
  const [, params] = useRoute("/workshop/:id");
  const workshopId = params?.id || "";
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [mood, setMood] = useState("");
  const [stress, setStress] = useState(5);
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (workshopId) getWorkshopById(workshopId).then(setWorkshop);
  }, [workshopId]);

  async function submit() {
    if (!mood) return;
    setLoading(true);
    const ok = await addWorkshopParticipant(workshopId, mood as "happy"|"neutral"|"sad", stress);
    setLoading(false);
    if (ok) setDone(true);
    else alert("Could not submit. Please try again.");
  }

  if (done) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f0fdf4,#ecfeff)", padding: "1rem" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: "center", background: "white", borderRadius: 24, padding: "3rem 2rem", maxWidth: 400, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
        <CheckCircle size={56} color="#10b981" style={{ margin: "0 auto 1rem" }} />
        <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Check-in Complete!</h2>
        <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>Your emotional wellness has been recorded anonymously. Thank you!</p>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#f0fdf4,#ecfeff)", padding: "1rem" }}>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: "white", borderRadius: 24, padding: "2rem", maxWidth: 420, width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, marginBottom: "0.25rem" }}>{workshop?.workshop_name || "Wellness Check-in"}</h1>
          <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>How are you feeling right now?</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1.5rem" }}>
          {[["happy","😊","Happy","#10b981"],["neutral","😐","Neutral","#06b6d4"],["sad","😔","Stressed","#f87171"]].map(([id,emoji,label,color]) => (
            <motion.div key={id} whileHover={{ y: -4 }} whileTap={{ scale: 0.97 }} onClick={() => setMood(id)} style={{ textAlign: "center", padding: "1.25rem 0.5rem", borderRadius: 16, cursor: "pointer", border: mood===id ? `2px solid ${color}` : "1.5px solid #e5e7eb", background: mood===id ? color+"12" : "white", transition: "all 0.2s" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.4rem" }}>{emoji}</div>
              <p style={{ fontSize: "0.8rem", fontWeight: 700, color: mood===id ? color : "#374151" }}>{label}</p>
            </motion.div>
          ))}
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#374151", display: "block", marginBottom: "0.5rem" }}>Stress Level: {stress}/10</label>
          <input type="range" min={1} max={10} value={stress} onChange={e => setStress(Number(e.target.value))} style={{ width: "100%", accentColor: "#10b981" }} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.7rem", color: "#9ca3af", marginTop: "0.25rem" }}><span>Low</span><span>High</span></div>
        </div>
        <button onClick={submit} disabled={!mood || loading} style={{ width: "100%", padding: "0.9rem", borderRadius: 12, background: mood ? "linear-gradient(135deg,#10b981,#059669)" : "#e5e7eb", color: mood ? "white" : "#9ca3af", border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: mood ? "pointer" : "not-allowed" }}>
          {loading ? "Submitting..." : "Submit Check-in"}
        </button>
        <p style={{ textAlign: "center", fontSize: "0.72rem", color: "#9ca3af", marginTop: "0.75rem" }}>Your response is completely anonymous · Saved to Supabase</p>
      </motion.div>
    </div>
  );
}
