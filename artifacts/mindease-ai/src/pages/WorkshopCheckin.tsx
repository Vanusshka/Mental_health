/**
 * WorkshopCheckin — QR scan landing page
 * Works with or without Supabase connection.
 * Stores workshop_id in URL → passes to full assessment flow.
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRoute, useLocation } from "wouter";
import { Brain, ArrowRight, Loader2 } from "lucide-react";
import { getWorkshopById } from "@/services/supabaseService";
import type { Workshop } from "@/lib/database.types";

export default function WorkshopCheckin() {
  const [, params] = useRoute("/workshop/:id");
  const [, navigate] = useLocation();
  const workshopId = params?.id || "";
  const [workshop, setWorkshop] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!workshopId) { setLoading(false); return; }
    // Try to load workshop details — show page regardless (QR is valid if ID exists)
    getWorkshopById(workshopId)
      .then(w => { if (w) setWorkshop(w); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [workshopId]);

  function startAssessment() {
    navigate(`/checkin?workshop_id=${workshopId}`);
  }

  if (!workshopId) return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#f0fdf4,#ecfeff)", padding:"1rem" }}>
      <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ textAlign:"center", background:"white", borderRadius:24, padding:"3rem 2rem", maxWidth:400, width:"100%", boxShadow:"0 20px 60px rgba(0,0,0,0.1)" }}>
        <div style={{ fontSize:"3rem", marginBottom:"1rem" }}>🔍</div>
        <h2 style={{ fontSize:"1.3rem", fontWeight:800, marginBottom:"0.5rem" }}>Invalid QR Code</h2>
        <p style={{ color:"#6b7280", fontSize:"0.88rem" }}>This QR code appears to be invalid. Please ask the organizer for a new one.</p>
      </motion.div>
    </div>
  );

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#f0fdf4,#ecfeff,#f0f9ff)", padding:"1rem" }}>
      <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6, ease:[0.22,1,0.36,1] }}
        style={{ background:"rgba(255,255,255,0.92)", backdropFilter:"blur(24px)", borderRadius:28, padding:"2.5rem 2rem", maxWidth:440, width:"100%", boxShadow:"0 24px 64px rgba(0,0,0,0.1)", border:"1px solid rgba(255,255,255,0.6)" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <div style={{ width:56, height:56, borderRadius:16, background:"linear-gradient(135deg,#10b981,#059669)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 1rem", boxShadow:"0 6px 20px rgba(16,185,129,0.3)" }}>
            <Brain size={26} color="white" />
          </div>
          <div style={{ display:"inline-flex", alignItems:"center", gap:"0.4rem", padding:"3px 12px", borderRadius:20, background:"rgba(16,185,129,0.1)", border:"1px solid rgba(16,185,129,0.2)", marginBottom:"0.75rem" }}>
            <span style={{ width:6, height:6, borderRadius:"50%", background:"#10b981", display:"inline-block" }} />
            <span style={{ fontSize:"0.72rem", fontWeight:700, color:"#10b981" }}>Workshop Check-In</span>
          </div>

          {loading ? (
            <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", marginBottom:"0.5rem" }}>
              <Loader2 size={18} color="#10b981" style={{ animation:"spin 1s linear infinite" }} />
              <span style={{ color:"#6b7280", fontSize:"0.88rem" }}>Loading...</span>
            </div>
          ) : (
            <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:"#111827", marginBottom:"0.4rem", lineHeight:1.2 }}>
              {workshop?.workshop_name || "Wellness Workshop"}
            </h1>
          )}

          {workshop?.description && (
            <p style={{ color:"#6b7280", fontSize:"0.85rem", lineHeight:1.5 }}>{workshop.description}</p>
          )}
          {workshop?.date && (
            <p style={{ color:"#9ca3af", fontSize:"0.78rem", marginTop:"0.4rem" }}>📅 {workshop.date}</p>
          )}
          <p style={{ color:"#9ca3af", fontSize:"0.72rem", marginTop:"0.35rem" }}>
            ID: {workshopId.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* What happens */}
        <div style={{ background:"rgba(16,185,129,0.05)", borderRadius:16, padding:"1.25rem", marginBottom:"1.75rem", border:"1px solid rgba(16,185,129,0.12)" }}>
          <p style={{ fontSize:"0.82rem", fontWeight:700, color:"#065f46", marginBottom:"0.75rem" }}>What happens next:</p>
          {[
            ["😊 / 😐 / 😔", "Select how you're feeling right now"],
            ["🧠", "Complete a short AI-guided emotional assessment"],
            ["📊", "Receive your personal wellness insights"],
            ["🔒", "Your data is anonymous — only aggregates are shared with the organizer"],
          ].map(([icon, text]) => (
            <div key={text as string} style={{ display:"flex", alignItems:"center", gap:"0.6rem", marginBottom:"0.5rem" }}>
              <span style={{ fontSize:"1rem", flexShrink:0 }}>{icon}</span>
              <span style={{ fontSize:"0.8rem", color:"#374151" }}>{text}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <motion.button onClick={startAssessment} whileHover={{ scale:1.02, y:-2 }} whileTap={{ scale:0.98 }}
          style={{ width:"100%", padding:"0.95rem", borderRadius:14, background:"linear-gradient(135deg,#10b981,#059669)", color:"white", border:"none", fontWeight:700, fontSize:"1rem", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem", boxShadow:"0 8px 28px rgba(16,185,129,0.35)" }}>
          Begin Emotional Assessment
          <ArrowRight size={18} />
        </motion.button>

        <p style={{ textAlign:"center", fontSize:"0.7rem", color:"#9ca3af", marginTop:"1rem" }}>
          Takes about 3–5 minutes · Completely anonymous
        </p>
      </motion.div>
      <style>{`@keyframes spin { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }`}</style>
    </div>
  );
}
