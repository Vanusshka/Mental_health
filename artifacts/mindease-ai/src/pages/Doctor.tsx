import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Brain, Plus, X, TrendingUp, TrendingDown, AlertTriangle, FileText, Activity, Heart, ChevronRight, Home, Download, RefreshCw, Stethoscope, Clock } from "lucide-react";
import { getPatientsByDoctor, getCheckinsByPatient, createPatient, updatePatientNotes, getPatientSessions } from "@/services/supabaseService";
import type { Patient, EmotionalCheckin, PatientSession } from "@/lib/database.types";
import { useAuth } from "@/contexts/AuthContext";
import { usePatientSession } from "@/contexts/PatientSessionContext";
import { downloadPatientReport } from "@/utils/downloadReport";

const TREND_COLOR = { improving:"#10b981", stable:"#06b6d4", declining:"#f87171", critical:"#ef4444" };
const TREND_ICON = { improving:TrendingUp, stable:Activity, declining:TrendingDown, critical:AlertTriangle };

function computeTrend(records: EmotionalCheckin[]): "improving"|"stable"|"declining"|"critical" {
  if (!records.length) return "stable";
  const latest = records[records.length - 1];
  if (latest.assessment_level === "elevated" && latest.wellness_score < 45) return "critical";
  if (records.length < 2) return latest.assessment_level === "elevated" ? "declining" : "stable";
  const half = Math.ceil(records.length / 2);
  const recentAvg = records.slice(half).reduce((s,r)=>s+r.wellness_score,0)/(records.length-half);
  const olderAvg  = records.slice(0,half).reduce((s,r)=>s+r.wellness_score,0)/half;
  const delta = recentAvg - olderAvg;
  if (delta > 6) return "improving";
  if (delta < -6) return "declining";
  return "stable";
}

function AddPatientModal({ onAdd, onClose, doctorId }: {
  onAdd: (p: Patient) => void;
  onClose: () => void;
  doctorId: string;
}) {
  const [form, setForm] = useState<{ name: string; age: string; condition: string; notes: string }>({ name:"", age:"", condition:"", notes:"" });
  const [loading, setLoading] = useState(false);
  const inp: React.CSSProperties = { width:"100%", padding:"0.6rem 0.9rem", borderRadius:10, border:"1px solid #e5e7eb", fontSize:"0.9rem", outline:"none", marginTop:"0.3rem", boxSizing:"border-box", fontFamily:"inherit" };
  async function submit() {
    if (!form.name || !form.condition) return;
    setLoading(true);
    const p = await createPatient({ doctor_id: doctorId, name: form.name, age: parseInt(form.age)||undefined, condition: form.condition, notes: form.notes });
    setLoading(false);
    if (p) onAdd(p);
    else alert("Could not save patient. Check Supabase connection.");
    onClose();
  }
  const fields: [string, keyof typeof form, string][] = [
    ["Patient Name *","name","text"],
    ["Age","age","number"],
    ["Condition *","condition","text"],
    ["Initial Notes","notes","text"],
  ];
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem"}}>
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} style={{background:"white",borderRadius:24,padding:"2rem",width:"100%",maxWidth:440,boxShadow:"0 24px 64px rgba(0,0,0,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <h2 style={{fontSize:"1.2rem",fontWeight:700}}>Add New Patient</h2>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><X size={20} /></button>
        </div>
        {fields.map(([label, key, type]) => (
          <div key={key} style={{marginBottom:"1rem"}}>
            <label style={{fontSize:"0.8rem",fontWeight:600,color:"#374151"}}>{label}</label>
            <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={label} style={inp} />
          </div>
        ))}
        <button onClick={submit} disabled={loading} style={{width:"100%",padding:"0.8rem",borderRadius:12,background:"linear-gradient(135deg,#0ea5e9,#06b6d4)",color:"white",border:"none",fontWeight:700,fontSize:"0.95rem",cursor:"pointer",marginTop:"0.5rem",opacity:loading?0.7:1}}>
          {loading ? "Saving to Supabase..." : "Add Patient"}
        </button>
      </motion.div>
    </div>
  );
}

export default function Doctor() {
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const { setActiveSession } = usePatientSession();
  const doctorId = user?.id ?? "demo-doctor";
  const doctorName = user?.display_name ?? "Dr. User";

  const [patients, setPatients] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [checkins, setCheckins] = useState<EmotionalCheckin[]>([]);
  const [sessions, setSessions] = useState<PatientSession[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  async function loadPatients() {
    setLoading(true);
    const ps = await getPatientsByDoctor(doctorId);
    setPatients(ps);
    if (ps.length > 0 && !selected) setSelected(ps[0]);
    setLoading(false);
  }

  useEffect(() => { loadPatients(); }, []);

  useEffect(() => {
    if (!selected) return;
    getCheckinsByPatient(selected.id).then(setCheckins);
    getPatientSessions(selected.id).then(setSessions);
  }, [selected]);

  // Also refresh when tab becomes visible (user returns from assessment)
  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible" && selected) {
        getCheckinsByPatient(selected.id).then(setCheckins);
        getPatientSessions(selected.id).then(setSessions);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, [selected]);

  function onPatientAdded(p: Patient) {
    setPatients(prev => [p, ...prev]);
    setSelected(p);
  }

  async function saveNote() {
    if (!noteText.trim() || !selected) return;
    await updatePatientNotes(selected.id, noteText);
    setPatients(prev => prev.map(p => p.id === selected.id ? {...p, notes: noteText} : p));
    setSelected(prev => prev ? {...prev, notes: noteText} : prev);
    setNoteText("");
  }

  function startAssessment() {
    if (!selected) return;
    // Set context so assessment knows it's doctor-initiated
    setActiveSession({
      patient_id:     selected.id,
      patient_name:   selected.name,
      doctor_id:      doctorId,
      doctor_name:    doctorName,
      session_number: checkins.length + 1,
    });
    navigate(`/checkin?patient_id=${selected.id}&doctor_id=${doctorId}`);
  }

  const trend = selected ? computeTrend(checkins) : "stable";
  const tColor = TREND_COLOR[trend] || "#06b6d4";
  const TIcon = TREND_ICON[trend] || Activity;

  const latest = checkins[checkins.length - 1];
  const avgWellness = checkins.length ? Math.round(checkins.reduce((s,c)=>s+c.wellness_score,0)/checkins.length) : 0;

  const chartData = checkins.map((c, i) => ({
    session: c.session_number ? `S${c.session_number}` : `S${i+1}`,
    score: c.wellness_score,
    stress: c.stress_score,
  }));

  const indicators = selected && latest ? [
    {label:"Emotional Balance", val:latest.emotional_balance, icon:"⚖️"},
    {label:"Stress Level",       val:latest.stress_score,     icon:"⚡"},
    {label:"Burnout Risk",       val:latest.burnout_risk,     icon:"🔋"},
    {label:"Sleep Wellness",     val:latest.sleep_wellness,   icon:"🌙"},
    {label:"Resilience",         val:latest.emotional_resilience, icon:"🛡️"},
    {label:"Social Connect",     val:latest.social_connectivity,  icon:"💬"},
  ] : [];

  const tabStyle = (t: string) => ({
    padding:"0.5rem 1.1rem", borderRadius:20, border:"none", cursor:"pointer", fontWeight:600, fontSize:"0.82rem",
    background: tab===t ? "linear-gradient(135deg,#0ea5e9,#06b6d4)" : "rgba(0,0,0,0.05)",
    color: tab===t ? "white" : "#6b7280",
  });

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f0f9ff,#ecfeff,#f0fdf4)",padding:"1.5rem"}}>
      {showAdd && <AddPatientModal onAdd={onPatientAdded} onClose={()=>setShowAdd(false)} doctorId={doctorId} />}
      <div style={{maxWidth:1200,margin:"0 auto"}}>

        {/* Header */}
        <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem",flexWrap:"wrap",gap:"1rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
            <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#0ea5e9,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(6,182,212,0.3)"}}>
              <Brain size={22} color="white" />
            </div>
            <div>
              <h1 style={{fontSize:"1.2rem",fontWeight:800,color:"#0f172a"}}>Doctor / Therapist Portal</h1>
              <p style={{fontSize:"0.78rem",color:"#6b7280"}}>MANAS · {doctorName}</p>
            </div>
          </div>
          <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
            <button onClick={()=>navigate("/")} style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.5rem 1rem",borderRadius:20,background:"rgba(0,0,0,0.05)",border:"none",fontWeight:600,cursor:"pointer",fontSize:"0.82rem",color:"#374151"}}>
              <Home size={14} /> Back to Home
            </button>
            <button onClick={loadPatients} style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.5rem 1rem",borderRadius:20,background:"rgba(6,182,212,0.1)",border:"none",fontWeight:600,cursor:"pointer",fontSize:"0.82rem",color:"#06b6d4"}}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button onClick={()=>setShowAdd(true)} style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.6rem 1.2rem",borderRadius:20,background:"linear-gradient(135deg,#0ea5e9,#06b6d4)",color:"white",border:"none",fontWeight:700,cursor:"pointer",fontSize:"0.85rem",boxShadow:"0 4px 16px rgba(6,182,212,0.3)"}}>
              <Plus size={16} /> Add Patient
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div style={{textAlign:"center",padding:"4rem",color:"#6b7280"}}>Loading patients from Supabase...</div>
        ) : (
        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"1.25rem"}}>

          {/* Patient List */}
          <div>
            <p style={{fontSize:"0.75rem",fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.75rem"}}>Patients ({patients.length})</p>
            {patients.length === 0 ? (
              <div style={{padding:"2rem",textAlign:"center",color:"#6b7280",fontSize:"0.85rem",background:"rgba(255,255,255,0.7)",borderRadius:16,border:"1px solid rgba(255,255,255,0.6)"}}>
                No patients yet.<br/>Click "Add Patient" to get started.
              </div>
            ) : (
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              {patients.map(pt => {
                const ptCheckins = pt.id === selected?.id ? checkins : [];
                const ptTrend = computeTrend(ptCheckins);
                const tc = TREND_COLOR[ptTrend]||"#06b6d4";
                const isSel = selected?.id===pt.id;
                const ptLatest = ptCheckins[ptCheckins.length-1];
                return (
                  <motion.div key={pt.id} whileHover={{x:3}} onClick={()=>setSelected(pt)} style={{padding:"0.9rem 1rem",borderRadius:14,cursor:"pointer",background:isSel?"rgba(14,165,233,0.1)":"rgba(255,255,255,0.7)",border:isSel?"1.5px solid #0ea5e9":"1px solid rgba(255,255,255,0.6)",backdropFilter:"blur(12px)",transition:"all 0.2s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <p style={{fontWeight:700,fontSize:"0.9rem",color:"#111827"}}>{pt.name}</p>
                        <p style={{fontSize:"0.75rem",color:"#6b7280"}}>{pt.condition} · {pt.id===selected?.id?checkins.length:0} sessions</p>
                      </div>
                      <ChevronRight size={14} color="#9ca3af" />
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"0.5rem"}}>
                      <span style={{fontSize:"0.7rem",fontWeight:700,padding:"2px 8px",borderRadius:20,background:tc+"18",color:tc,border:`1px solid ${tc}30`}}>{ptTrend}</span>
                      {ptLatest && <span style={{fontSize:"0.8rem",fontWeight:800,color:ptLatest.wellness_score>=65?"#10b981":ptLatest.wellness_score>=45?"#fb923c":"#f87171"}}>{ptLatest.wellness_score}/100</span>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            )}
          </div>

          {/* Patient Detail */}
          {selected ? (
          <AnimatePresence mode="wait">
            <motion.div key={selected.id} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} style={{display:"flex",flexDirection:"column",gap:"1rem"}}>

              {/* Patient Header */}
              <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderRadius:20,padding:"1.25rem",border:"1px solid rgba(255,255,255,0.6)",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"0.5rem"}}>
                  <div>
                    <h2 style={{fontSize:"1.3rem",fontWeight:800,color:"#0f172a"}}>{selected.name}</h2>
                    <p style={{fontSize:"0.82rem",color:"#6b7280"}}>
                      {selected.age ? `Age ${selected.age} · ` : ""}{selected.condition} · {checkins.length} sessions
                    </p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:"2rem",fontWeight:900,color:tColor,lineHeight:1}}>{avgWellness || "—"}</p>
                    <p style={{fontSize:"0.72rem",color:"#6b7280"}}>Avg Wellness</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:"0.5rem",marginTop:"0.75rem",flexWrap:"wrap",alignItems:"center"}}>
                  <span style={{display:"flex",alignItems:"center",gap:"0.3rem",fontSize:"0.75rem",fontWeight:700,padding:"4px 10px",borderRadius:20,background:tColor+"18",color:tColor,border:`1px solid ${tColor}30`}}>
                    <TIcon size={11} /> {trend}
                  </span>
                  {/* Start Assessment button — uses PatientSessionContext */}
                  <button
                    onClick={startAssessment}
                    style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:"5px 14px",borderRadius:20,background:"linear-gradient(135deg,#8b5cf6,#6366f1)",color:"white",border:"none",fontWeight:700,cursor:"pointer",fontSize:"0.78rem",boxShadow:"0 3px 12px rgba(139,92,246,0.3)"}}>
                    🧠 Start Assessment
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                {["overview","timeline","chart","notes","report"].map(t=>(
                  <button key={t} onClick={()=>setTab(t)} style={tabStyle(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>

              {/* Overview */}
              {tab==="overview" && (
                checkins.length === 0 ? (
                  <div style={{padding:"2rem",textAlign:"center",color:"#6b7280",background:"rgba(255,255,255,0.7)",borderRadius:16,border:"1px solid rgba(255,255,255,0.6)"}}>
                    No sessions yet. Click <strong>Start Diagnosis</strong> to begin the first session.
                  </div>
                ) : (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"0.75rem"}}>
                  {indicators.map(ind => {
                    const c = ind.val>=65?"#10b981":ind.val>=45?"#fb923c":"#f87171";
                    return (
                      <motion.div key={ind.label} whileHover={{y:-3}} style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(16px)",borderRadius:16,padding:"1rem",textAlign:"center",border:"1px solid rgba(255,255,255,0.6)"}}>
                        <div style={{fontSize:"1.4rem",marginBottom:"0.3rem"}}>{ind.icon}</div>
                        <p style={{fontSize:"1.4rem",fontWeight:800,color:c,lineHeight:1}}>{ind.val}%</p>
                        <p style={{fontSize:"0.7rem",color:"#6b7280",marginTop:"0.2rem",lineHeight:1.3}}>{ind.label}</p>
                        <div style={{height:4,borderRadius:4,background:"#f3f4f6",marginTop:"0.5rem",overflow:"hidden"}}>
                          <motion.div initial={{width:0}} animate={{width:`${ind.val}%`}} transition={{duration:0.8,ease:"easeOut"}} style={{height:"100%",background:c,borderRadius:4}} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
                )
              )}

              {/* Timeline — session history with AI summaries */}
              {tab==="timeline" && (
                <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderRadius:20,padding:"1.25rem",border:"1px solid rgba(255,255,255,0.6)"}}>
                  <p style={{fontWeight:700,fontSize:"0.9rem",marginBottom:"0.25rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><Clock size={15} color="#8b5cf6" /> Session Timeline</p>
                  <p style={{fontSize:"0.75rem",color:"#6b7280",marginBottom:"1rem"}}>Complete emotional assessment history for {selected.name}</p>
                  {sessions.length === 0 ? (
                    <div style={{textAlign:"center",padding:"2rem",color:"#6b7280",fontSize:"0.85rem"}}>
                      No sessions recorded yet. Click <strong>Start Assessment</strong> to begin Session 1.
                    </div>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:"0.75rem"}}>
                      {sessions.map((s, i) => {
                        const moodEmoji = s.mood === "happy" ? "😊" : s.mood === "sad" ? "😔" : "😐";
                        const levelColor = s.assessment_level === "elevated" ? "#f87171" : s.assessment_level === "moderate" ? "#fb923c" : "#10b981";
                        const wColor = s.wellness_score >= 65 ? "#10b981" : s.wellness_score >= 45 ? "#fb923c" : "#f87171";
                        const dateStr = new Date(s.created_at).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
                        return (
                          <motion.div key={s.id} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.06}}
                            style={{borderRadius:14,padding:"1rem",background:"rgba(0,0,0,0.025)",border:`1px solid ${levelColor}25`,position:"relative",overflow:"hidden"}}>
                            {/* Session number badge */}
                            <div style={{position:"absolute",top:0,right:0,background:`linear-gradient(135deg,#8b5cf6,#6366f1)`,color:"white",fontSize:"0.65rem",fontWeight:800,padding:"3px 10px",borderRadius:"0 14px 0 10px"}}>
                              Session {s.session_number}
                            </div>
                            <div style={{display:"flex",alignItems:"flex-start",gap:"0.75rem"}}>
                              <span style={{fontSize:"1.6rem",flexShrink:0}}>{moodEmoji}</span>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{display:"flex",alignItems:"center",gap:"0.5rem",flexWrap:"wrap",marginBottom:"0.4rem"}}>
                                  <span style={{fontSize:"0.8rem",fontWeight:700,color:"#111827",textTransform:"capitalize"}}>{s.dominant_emotion ?? s.mood}</span>
                                  <span style={{fontSize:"0.68rem",fontWeight:700,padding:"2px 8px",borderRadius:20,background:levelColor+"18",color:levelColor,border:`1px solid ${levelColor}30`}}>{s.assessment_level}</span>
                                  <span style={{fontSize:"0.68rem",fontWeight:800,color:wColor}}>Wellness: {s.wellness_score}/100</span>
                                  <span style={{fontSize:"0.68rem",color:"#9ca3af",marginLeft:"auto"}}>{dateStr}</span>
                                </div>
                                {/* AI Analysis */}
                                {s.ai_analysis && (
                                  <div style={{background:"rgba(139,92,246,0.06)",borderRadius:10,padding:"0.6rem 0.75rem",marginBottom:"0.4rem",border:"1px solid rgba(139,92,246,0.12)"}}>
                                    <p style={{fontSize:"0.72rem",color:"#374151",lineHeight:1.6}}>
                                      <span style={{fontWeight:700,color:"#8b5cf6"}}>🧠 AI Analysis: </span>{s.ai_analysis}
                                    </p>
                                  </div>
                                )}
                                {/* Stress bar */}
                                <div style={{display:"flex",alignItems:"center",gap:"0.5rem"}}>
                                  <span style={{fontSize:"0.68rem",color:"#6b7280",flexShrink:0}}>Stress {s.stress_score}%</span>
                                  <div style={{flex:1,height:4,borderRadius:4,background:"#f3f4f6",overflow:"hidden"}}>
                                    <motion.div initial={{width:0}} animate={{width:`${s.stress_score}%`}} transition={{duration:0.7,delay:i*0.06}}
                                      style={{height:"100%",background:s.stress_score>65?"#f87171":s.stress_score>40?"#fb923c":"#10b981",borderRadius:4}} />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Chart */}
              {tab==="chart" && (
                <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderRadius:20,padding:"1.25rem",border:"1px solid rgba(255,255,255,0.6)"}}>
                  <p style={{fontWeight:700,fontSize:"0.9rem",marginBottom:"0.25rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><TrendingUp size={15} color="#0ea5e9" /> Emotional Wellness Progression</p>
                  <p style={{fontSize:"0.75rem",color:"#6b7280",marginBottom:"1rem"}}>Real session-by-session data from Supabase</p>
                  {chartData.length < 2 ? (
                    <div style={{textAlign:"center",padding:"2rem",color:"#6b7280",fontSize:"0.85rem"}}>
                      Need at least 2 sessions to show trend. Current: {chartData.length} session(s).
                    </div>
                  ) : (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.25}/><stop offset="95%" stopColor="#f87171" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="session" tick={{fontSize:11}} axisLine={false} tickLine={false} />
                      <YAxis domain={[0,100]} tick={{fontSize:11}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.08)"}} />
                      <Area type="monotone" dataKey="score" stroke="#0ea5e9" fill="url(#wg)" strokeWidth={2.5} dot={{fill:"#0ea5e9",r:4}} name="Wellness Score" />
                      <Area type="monotone" dataKey="stress" stroke="#f87171" fill="url(#sg)" strokeWidth={2} strokeDasharray="5 3" dot={{fill:"#f87171",r:3}} name="Stress Level" />
                    </AreaChart>
                  </ResponsiveContainer>
                  )}
                </div>
              )}

              {/* Notes */}
              {tab==="notes" && (
                <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderRadius:20,padding:"1.25rem",border:"1px solid rgba(255,255,255,0.6)"}}>
                  <p style={{fontWeight:700,fontSize:"0.9rem",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><FileText size={15} color="#0ea5e9" /> Session Notes</p>
                  <div style={{background:"#f8fafc",borderRadius:12,padding:"1rem",marginBottom:"1rem",fontSize:"0.88rem",color:"#374151",lineHeight:1.6,minHeight:60}}>
                    {selected.notes || "No notes yet."}
                  </div>
                  <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Add session note..." rows={3}
                    style={{width:"100%",padding:"0.75rem",borderRadius:12,border:"1px solid #e5e7eb",fontSize:"0.88rem",resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}} />
                  <button onClick={saveNote} style={{marginTop:"0.75rem",padding:"0.6rem 1.5rem",borderRadius:20,background:"linear-gradient(135deg,#0ea5e9,#06b6d4)",color:"white",border:"none",fontWeight:700,cursor:"pointer",fontSize:"0.85rem"}}>
                    Save Note
                  </button>
                </div>
              )}

              {/* Report */}
              {tab==="report" && (
                <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderRadius:20,padding:"1.25rem",border:"1px solid rgba(255,255,255,0.6)"}}>
                  <p style={{fontWeight:700,fontSize:"0.9rem",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><Brain size={15} color="#0ea5e9" /> AI-Generated Patient Report</p>
                  <div style={{background:"linear-gradient(135deg,rgba(14,165,233,0.06),rgba(6,182,212,0.06))",borderRadius:14,padding:"1rem",border:"1px solid rgba(14,165,233,0.15)",marginBottom:"1rem"}}>
                    <p style={{fontSize:"0.88rem",color:"#374151",lineHeight:1.7}}>
                      <strong>{selected.name}</strong> ({selected.condition}) has completed <strong>{checkins.length} sessions</strong> with an average wellness score of <strong style={{color:tColor}}>{avgWellness}/100</strong>.
                      Emotional trend is <strong style={{color:tColor}}>{trend}</strong>.
                      {trend==="declining" ? " ⚠️ Immediate attention recommended." : trend==="improving" ? " ✅ Patient is responding positively." : " 📊 Patient is maintaining a stable baseline."}
                      {latest ? ` Latest: Stress ${latest.stress_score}% · Burnout ${latest.burnout_risk}% · Sleep ${latest.sleep_wellness}%.` : ""}
                    </p>
                  </div>
                  <button
                    onClick={() => downloadPatientReport({
                      patientName: selected.name,
                      condition: selected.condition ?? "Not specified",
                      sessions: checkins.length,
                      avgWellness,
                      trend,
                      latestMood: latest?.mood ?? "neutral",
                      stressLevel: latest?.stress_score ?? 0,
                      burnoutRisk: latest?.burnout_risk ?? 0,
                      notes: selected.notes ?? "",
                      doctorName,
                      date: new Date().toLocaleDateString("en-IN", {day:"numeric",month:"long",year:"numeric"}),
                      sessionHistory: chartData,
                    })}
                    style={{padding:"0.6rem 1.5rem",borderRadius:20,background:"linear-gradient(135deg,#0ea5e9,#06b6d4)",color:"white",border:"none",fontWeight:700,cursor:"pointer",fontSize:"0.85rem",display:"flex",alignItems:"center",gap:"0.4rem"}}>
                    <Download size={14} /> Download Patient Report
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
          ) : (
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",color:"#6b7280",fontSize:"0.9rem"}}>
              Select a patient to view details
            </div>
          )}
        </div>
        )}
      </div>
    </div>
  );
}
