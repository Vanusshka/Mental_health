import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Building2, Plus, QrCode, BarChart3, Users, TrendingUp, AlertTriangle, Brain, Shield, X, RefreshCw, Home, Download } from "lucide-react";
import { createWorkshop, getWorkshops, getWorkshopAnalytics, getOrgAnalytics, addWorkshopParticipant, type WorkshopAnalytics } from "@/services/supabaseService";
import type { Workshop } from "@/lib/database.types";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { downloadOrgReport } from "@/utils/downloadReport";

const COLORS = { happy: "#10b981", neutral: "#06b6d4", sad: "#f87171" };

function CreateWorkshopModal({ onCreated, onClose, orgId }) {
  const [form, setForm] = useState({ workshop_name: "", description: "", date: "" });
  const [loading, setLoading] = useState(false);
  const inp = { width: "100%", padding: "0.6rem 0.9rem", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: "0.9rem", outline: "none", marginTop: "0.3rem", boxSizing: "border-box", fontFamily: "inherit" };

  async function submit() {
    if (!form.workshop_name) return;
    setLoading(true);
    const w = await createWorkshop({ ...form, organization_id: orgId, organization_name: "MANAS Org" });
    setLoading(false);
    if (w) onCreated(w);
    else alert("Could not create workshop. Check Supabase connection.");
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: "white", borderRadius: 24, padding: "2rem", width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Create Workshop / Event</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>
        {[["Workshop Title *", "workshop_name"], ["Description", "description"], ["Date (YYYY-MM-DD)", "date"]].map(([label, key]) => (
          <div key={key} style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>{label}</label>
            <input value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={label} style={inp} />
          </div>
        ))}
        <button onClick={submit} disabled={loading} style={{ width: "100%", padding: "0.8rem", borderRadius: 12, background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", marginTop: "0.5rem", opacity: loading ? 0.7 : 1 }}>
          {loading ? "Creating..." : "Create & Generate QR Code"}
        </button>
      </motion.div>
    </div>
  );
}

function QRModal({ workshop, onClose }) {
  const [analytics, setAnalytics] = useState<WorkshopAnalytics | null>(null);

  async function refresh() {
    const a = await getWorkshopAnalytics(workshop.id);
    setAnalytics(a);
  }

  useEffect(() => { refresh(); const t = setInterval(refresh, 5000); return () => clearInterval(t); }, [workshop.id]);

  const qrUrl = `${window.location.origin}/workshop/${workshop.id}`;
  const dist = analytics?.distribution || { happy: 0, neutral: 0, sad: 0 };
  const pieData = [
    { name: "Happy", value: dist.happy, color: COLORS.happy },
    { name: "Neutral", value: dist.neutral, color: COLORS.neutral },
    { name: "Stressed", value: dist.sad, color: COLORS.sad },
  ].filter(d => d.value > 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", overflowY: "auto" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: "white", borderRadius: 24, padding: "2rem", width: "100%", maxWidth: 520, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{workshop.workshop_name}</h2>
            <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>ID: {workshop.id.slice(0, 8).toUpperCase()}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem", padding: "1.5rem", background: "#f8fafc", borderRadius: 16, border: "1px solid #e5e7eb" }}>
          <QRCodeSVG value={qrUrl} size={180} level="H" includeMargin />
          <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#374151", fontWeight: 600 }}>Scan to check in emotional wellness</p>
          <p style={{ fontSize: "0.72rem", color: "#6b7280", marginTop: "0.25rem", wordBreak: "break-all", textAlign: "center" }}>{qrUrl}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.95rem", fontWeight: 700 }}>Live Analytics</h3>
          <button onClick={refresh} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "#10b981", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>
        {analytics && analytics.total_checkins > 0 ? (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              {[["Total Check-ins", analytics.total_checkins, "#8b5cf6"], ["Avg Stress", analytics.avg_stress + "/10", "#f87171"], ["Stressed %", analytics.stressed_percent + "%", "#fb923c"]].map(([l, v, c]) => (
                <div key={l} style={{ textAlign: "center", padding: "0.75rem", background: "#f8fafc", borderRadius: 12, border: "1px solid #e5e7eb" }}>
                  <p style={{ fontSize: "1.3rem", fontWeight: 800, color: c }}>{v}</p>
                  <p style={{ fontSize: "0.7rem", color: "#6b7280" }}>{l}</p>
                </div>
              ))}
            </div>
            {pieData.length > 0 && (
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <PieChart width={120} height={120}>
                  <Pie data={pieData} cx={55} cy={55} innerRadius={30} outerRadius={52} paddingAngle={3} dataKey="value">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                </PieChart>
                <div style={{ flex: 1 }}>
                  {pieData.map(d => (
                    <div key={d.name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                        <span style={{ fontSize: "0.82rem", color: "#374151" }}>{d.name}</span>
                      </div>
                      <span style={{ fontSize: "0.82rem", fontWeight: 700, color: d.color }}>{d.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "1.5rem", background: "#f8fafc", borderRadius: 12, color: "#6b7280", fontSize: "0.88rem" }}>
            <QrCode size={32} style={{ margin: "0 auto 0.5rem", opacity: 0.4 }} />
            Waiting for participants to scan and check in...
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function OrgPortal() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [activeQR, setActiveQR] = useState<Workshop | null>(null);
  const [loading, setLoading] = useState(true);

  const orgId = user?.id ?? "demo-org";

  async function loadData() {
    setLoading(true);
    const [ws, an] = await Promise.all([getWorkshops(orgId), getOrgAnalytics()]);
    setWorkshops(ws);
    setAnalytics(an);
    setLoading(false);
  }

  useEffect(() => { loadData(); }, []);

  function onCreated(w: Workshop) {
    setWorkshops(prev => [w, ...prev]);
    setShowCreate(false);
    setActiveQR(w);
  }

  const trendData = analytics?.trend_data || Array.from({ length: 6 }, (_, i) => ({ week: `W${i+1}`, happy: 0, neutral: 0, stressed: 0 }));
  const pieData = analytics ? [
    { name: "Positive", value: analytics.happy_pct, color: "#10b981" },
    { name: "Neutral",  value: analytics.neutral_pct, color: "#06b6d4" },
    { name: "Stressed", value: analytics.sad_pct, color: "#f87171" },
  ].filter(d => d.value > 0) : [];

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0fdf4,#ecfeff,#f0f9ff)", padding: "1.5rem" }}>
      {showCreate && <CreateWorkshopModal onCreated={onCreated} onClose={() => setShowCreate(false)} orgId={orgId} />}
      {activeQR && <QRModal workshop={activeQR} onClose={() => setActiveQR(null)} />}

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: "linear-gradient(135deg,#10b981,#059669)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Building2 size={22} color="white" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.2rem", fontWeight: 800 }}>Organization / NGO Portal</h1>
              <p style={{ fontSize: "0.78rem", color: "#6b7280" }}>MANAS · Real-time Community Wellness Analytics</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: 20, background: "rgba(0,0,0,0.05)", border: "none", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem", color: "#374151" }}>
              <Home size={14} /> Back to Home
            </button>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", fontWeight: 600, padding: "0.4rem 0.9rem", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Shield size={11} /> Anonymized Data Only
            </span>
            <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1.2rem", borderRadius: 20, background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
              <Plus size={16} /> Create Workshop
            </button>
            <button onClick={loadData} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1rem", borderRadius: 20, background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.2)", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem" }}>
              <RefreshCw size={13} /> Refresh
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {[
            [analytics?.total?.toString() ?? "0", "Total Check-ins", "#8b5cf6", "Live from Supabase"],
            [analytics ? `${analytics.avg_wellness}/100` : "—", "Avg Wellness Score", "#10b981", analytics ? `Stress avg: ${analytics.avg_stress}/10` : "No data yet"],
            [analytics ? `${analytics.sad_pct}%` : "—", "High-Stress Members", "#f87171", "Sad mood responses"],
            [workshops.length.toString(), "Workshops Created", "#06b6d4", `${workshops.filter(w => w.checkin_count > 0).length} with check-ins`],
          ].map(([v, l, c, s]) => (
            <motion.div key={l} whileHover={{ y: -3 }} style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderRadius: 16, padding: "1.1rem", border: "1px solid rgba(255,255,255,0.6)", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
              <p style={{ fontSize: "1.6rem", fontWeight: 800, color: c, lineHeight: 1 }}>{v}</p>
              <p style={{ fontSize: "0.78rem", color: "#374151", fontWeight: 600, marginTop: "0.25rem" }}>{l}</p>
              <p style={{ fontSize: "0.7rem", color: "#6b7280", marginTop: "0.15rem" }}>{s}</p>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem", marginBottom: "1.25rem" }}>
          {/* Trend Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderRadius: 20, padding: "1.25rem", border: "1px solid rgba(255,255,255,0.6)" }}>
            <p style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "0.25rem", display: "flex", alignItems: "center", gap: "0.4rem" }}><TrendingUp size={15} color="#10b981" /> 6-Week Wellness Trend</p>
            <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: "1rem" }}>Real data from Supabase emotional_checkins</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gh" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/><stop offset="95%" stopColor="#10b981" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/><stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/></linearGradient>
                  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.25}/><stop offset="95%" stopColor="#f87171" stopOpacity={0}/></linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="week" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12 }} />
                <Area type="monotone" dataKey="happy" stroke="#10b981" fill="url(#gh)" strokeWidth={2.5} name="Positive %" />
                <Area type="monotone" dataKey="neutral" stroke="#06b6d4" fill="url(#gn)" strokeWidth={2} name="Neutral %" />
                <Area type="monotone" dataKey="stressed" stroke="#f87171" fill="url(#gs)" strokeWidth={2} strokeDasharray="5 3" name="Stressed %" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Workshops List */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} style={{ background: "rgba(255,255,255,0.8)", backdropFilter: "blur(20px)", borderRadius: 20, padding: "1.25rem", border: "1px solid rgba(255,255,255,0.6)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
              <p style={{ fontWeight: 700, fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.4rem" }}><QrCode size={15} color="#06b6d4" /> Workshops & QR Codes</p>
              <button onClick={() => setShowCreate(true)} style={{ fontSize: "0.72rem", color: "#10b981", background: "none", border: "none", cursor: "pointer", fontWeight: 700 }}>+ New</button>
            </div>
            {loading ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280", fontSize: "0.85rem" }}>Loading from Supabase...</div>
            ) : workshops.length === 0 ? (
              <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280", fontSize: "0.85rem" }}>No workshops yet. Create one to get started.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: 220, overflowY: "auto" }}>
                {workshops.map(w => (
                  <motion.div key={w.id} whileHover={{ x: 3 }} onClick={() => setActiveQR(w)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderRadius: 12, background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.06)", cursor: "pointer" }}>
                    <div>
                      <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827" }}>{w.workshop_name}</p>
                      <p style={{ fontSize: "0.72rem", color: "#6b7280" }}>{w.date || w.created_at?.slice(0, 10)} · {w.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: w.checkin_count > 0 ? "rgba(16,185,129,0.1)" : "rgba(6,182,212,0.1)", color: w.checkin_count > 0 ? "#10b981" : "#06b6d4" }}>
                      {w.checkin_count > 0 ? `${w.checkin_count} check-ins` : "View QR"}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* AI Impact Report */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.08))", borderRadius: 20, padding: "1.25rem", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: 12, background: "rgba(16,185,129,0.12)", flexShrink: 0 }}><Brain size={18} color="#10b981" /></div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>AI-Generated Impact Summary</p>
                <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, background: "#d1fae5", color: "#065f46", fontWeight: 600 }}>Live Data</span>
              </div>
              <p style={{ fontSize: "0.88rem", color: "#374151", lineHeight: 1.7 }}>
                {analytics && analytics.total > 0
                  ? `${analytics.total} emotional check-ins recorded. Community wellness score averages ${analytics.avg_wellness}/100. ${analytics.happy_pct}% positive, ${analytics.neutral_pct}% neutral, ${analytics.sad_pct}% high-stress. Average stress level: ${analytics.avg_stress}/10.`
                  : "No check-in data yet. Share workshop QR codes with participants to start collecting real emotional wellness data."}
              </p>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                <button onClick={() => downloadOrgReport({
                  orgName: user?.display_name ?? "Organization",
                  date: new Date().toLocaleDateString("en-IN", {day:"numeric",month:"long",year:"numeric"}),
                  totalCheckins: analytics?.total ?? 0,
                  happyPct: analytics?.happy_pct ?? 0,
                  neutralPct: analytics?.neutral_pct ?? 0,
                  stressedPct: analytics?.sad_pct ?? 0,
                  avgWellness: analytics?.avg_wellness ?? 0,
                  avgStress: analytics?.avg_stress ?? 0,
                  workshopsCount: workshops.length,
                  insights: analytics && analytics.total > 0
                    ? `${analytics.total} emotional check-ins recorded. Community wellness score averages ${analytics.avg_wellness}/100. ${analytics.happy_pct}% positive, ${analytics.neutral_pct}% neutral, ${analytics.sad_pct}% high-stress. Average stress level: ${analytics.avg_stress}/10.`
                    : "No check-in data yet.",
                })} style={{ padding: "0.5rem 1rem", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Download size={13} /> Download PDF Report
                </button>
                <button onClick={loadData} style={{ padding: "0.5rem 1rem", borderRadius: 20, background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>🔄 Refresh Data</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
