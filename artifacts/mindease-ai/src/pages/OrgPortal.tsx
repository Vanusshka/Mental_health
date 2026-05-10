import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import { Building2, Plus, QrCode, BarChart3, Users, TrendingUp, AlertTriangle, Brain, Shield, X, RefreshCw, CheckCircle } from "lucide-react";

const API = "http://127.0.0.1:8000";

const COLORS = { happy: "#10b981", neutral: "#06b6d4", sad: "#f87171" };

function CreateWorkshopModal({ onCreated, onClose }) {
  const [form, setForm] = useState({ org_name: "MindEase Org", title: "", description: "", date: "" });
  const [loading, setLoading] = useState(false);
  const inp = { width: "100%", padding: "0.6rem 0.9rem", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: "0.9rem", outline: "none", marginTop: "0.3rem", boxSizing: "border-box", fontFamily: "inherit" };

  async function submit() {
    if (!form.title) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/workshops/create`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await res.json();
      onCreated(data);
    } catch { alert("Backend not reachable. Make sure backend is running on port 8000."); }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: "white", borderRadius: 24, padding: "2rem", width: "100%", maxWidth: 440, boxShadow: "0 24px 64px rgba(0,0,0,0.15)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>Create Workshop / Event</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>
        {[["Workshop Title *", "title", "text"], ["Organization Name", "org_name", "text"], ["Description", "description", "text"], ["Date (YYYY-MM-DD)", "date", "text"]].map(([label, key, type]) => (
          <div key={key} style={{ marginBottom: "1rem" }}>
            <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#374151" }}>{label}</label>
            <input type={type} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={label} style={inp} />
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
  const [analytics, setAnalytics] = useState(null);

  async function refresh() {
    try {
      const res = await fetch(`${API}/workshops/${workshop.event_id}/analytics`);
      setAnalytics(await res.json());
    } catch {}
  }

  useEffect(() => { refresh(); const t = setInterval(refresh, 5000); return () => clearInterval(t); }, [workshop.event_id]);

  const dist = analytics?.distribution || {};
  const pieData = [
    { name: "Happy", value: dist.happy || 0, color: COLORS.happy },
    { name: "Neutral", value: dist.neutral || 0, color: COLORS.neutral },
    { name: "Stressed", value: dist.sad || 0, color: COLORS.sad },
  ].filter(d => d.value > 0);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem", overflowY: "auto" }}>
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: "white", borderRadius: 24, padding: "2rem", width: "100%", maxWidth: 560, boxShadow: "0 24px 64px rgba(0,0,0,0.2)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700 }}>{workshop.title}</h2>
            <p style={{ fontSize: "0.8rem", color: "#6b7280" }}>Event ID: {workshop.event_id}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>

        {/* QR Code */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.5rem", padding: "1.5rem", background: "#f8fafc", borderRadius: 16, border: "1px solid #e5e7eb" }}>
          <QRCodeSVG value={workshop.qr_url} size={180} level="H" includeMargin />
          <p style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#374151", fontWeight: 600 }}>Scan to check in your emotional wellness</p>
          <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>{workshop.qr_url}</p>
        </div>

        {/* Live Analytics */}
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
  const [workshops, setWorkshops] = useState([
    { event_id: "DEMO01", title: "Stress Management 101", org_name: "MindEase Org", date: "2026-05-12", checkin_count: 84, qr_url: "http://localhost:5173/workshop/DEMO01" },
    { event_id: "DEMO02", title: "Mindfulness Basics", org_name: "MindEase Org", date: "2026-05-15", checkin_count: 61, qr_url: "http://localhost:5173/workshop/DEMO02" },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [activeQR, setActiveQR] = useState(null);

  const trendData = [
    { week: "W1", happy: 28, neutral: 52, stressed: 20 },
    { week: "W2", happy: 31, neutral: 49, stressed: 20 },
    { week: "W3", happy: 35, neutral: 47, stressed: 18 },
    { week: "W4", happy: 38, neutral: 46, stressed: 16 },
    { week: "W5", happy: 42, neutral: 44, stressed: 14 },
    { week: "W6", happy: 45, neutral: 43, stressed: 12 },
  ];

  function onCreated(data) {
    setWorkshops(prev => [data, ...prev]);
    setShowCreate(false);
    setActiveQR(data);
  }

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#f0fdf4,#ecfeff,#f0f9ff)", padding: "1.5rem" }}>
      {showCreate && <CreateWorkshopModal onCreated={onCreated} onClose={() => setShowCreate(false)} />}
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
              <p style={{ fontSize: "0.78rem", color: "#6b7280" }}>MindEase AI · Community Wellness Analytics</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.75rem", fontWeight: 600, padding: "0.4rem 0.9rem", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
              <Shield size={11} /> Anonymized Data Only
            </span>
            <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.6rem 1.2rem", borderRadius: 20, background: "linear-gradient(135deg,#10b981,#059669)", color: "white", border: "none", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}>
              <Plus size={16} /> Create Workshop
            </button>
          </div>
        </motion.div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: "1rem", marginBottom: "1.5rem" }}>
          {[["1,284", "Total Participants", "#8b5cf6", "↑ 12% this month"], ["71/100", "Avg Wellness Score", "#10b981", "↑ from 64"], ["154", "High-Stress Members", "#f87171", "12% of total"], [workshops.length.toString(), "Workshops Created", "#06b6d4", `${workshops.filter(w => w.checkin_count > 0).length} with check-ins`]].map(([v, l, c, s]) => (
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
            <p style={{ fontSize: "0.72rem", color: "#6b7280", marginBottom: "1rem" }}>Community emotional distribution over time</p>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="gh" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gn" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} /><stop offset="95%" stopColor="#06b6d4" stopOpacity={0} /></linearGradient>
                  <linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.25} /><stop offset="95%" stopColor="#f87171" stopOpacity={0} /></linearGradient>
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
            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", maxHeight: 220, overflowY: "auto" }}>
              {workshops.map(w => (
                <motion.div key={w.event_id} whileHover={{ x: 3 }} onClick={() => setActiveQR(w)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", borderRadius: 12, background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.06)", cursor: "pointer" }}>
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 700, color: "#111827" }}>{w.title}</p>
                    <p style={{ fontSize: "0.72rem", color: "#6b7280" }}>{w.date} · ID: {w.event_id}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.72rem", fontWeight: 700, padding: "3px 8px", borderRadius: 20, background: w.checkin_count > 0 ? "rgba(16,185,129,0.1)" : "rgba(6,182,212,0.1)", color: w.checkin_count > 0 ? "#10b981" : "#06b6d4" }}>
                      {w.checkin_count > 0 ? `${w.checkin_count} check-ins` : "View QR"}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* AI Impact Report */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} style={{ background: "linear-gradient(135deg,rgba(16,185,129,0.08),rgba(6,182,212,0.08))", borderRadius: 20, padding: "1.25rem", border: "1px solid rgba(16,185,129,0.2)" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{ padding: "0.6rem", borderRadius: 12, background: "rgba(16,185,129,0.12)", flexShrink: 0 }}><Brain size={18} color="#10b981" /></div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
                <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>AI-Generated Impact Report — May 2026</p>
                <span style={{ fontSize: "0.7rem", padding: "2px 8px", borderRadius: 20, background: "#d1fae5", color: "#065f46", fontWeight: 600 }}>Auto-generated</span>
              </div>
              <p style={{ fontSize: "0.88rem", color: "#374151", lineHeight: 1.7 }}>
                Community emotional wellness improved by <strong>18.4%</strong> over 6 weeks. High-stress indicators dropped from <strong>20% → 12%</strong> following workshops. Burnout risk in the Engineering cohort remains elevated. Overall participation is up <strong>34%</strong> vs last quarter.
              </p>
              <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
                <button style={{ padding: "0.5rem 1rem", borderRadius: 20, background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>📄 Export PDF</button>
                <button style={{ padding: "0.5rem 1rem", borderRadius: 20, background: "rgba(6,182,212,0.1)", color: "#06b6d4", border: "1px solid rgba(6,182,212,0.3)", fontWeight: 700, cursor: "pointer", fontSize: "0.8rem" }}>📊 Full Analytics</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
