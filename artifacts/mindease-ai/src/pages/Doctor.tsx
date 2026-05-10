import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Brain, Plus, X, TrendingUp, TrendingDown, AlertTriangle, FileText, Users, Activity, Heart, ChevronRight } from "lucide-react";

const INITIAL_PATIENTS = [
  { id:1, name:"Priya Sharma", age:24, condition:"Anxiety", sessions:8, score:62, trend:"improving", stress:58, burnout:45, sleep:65, resilience:70, social:60, notes:"Responding well to CBT. Sleep improving.", history:[{s:"S1",score:45,stress:75},{s:"S2",score:50,stress:70},{s:"S3",score:55,stress:65},{s:"S4",score:58,stress:62},{s:"S5",score:62,stress:58}] },
  { id:2, name:"Arjun Mehta", age:31, condition:"Burnout", sessions:5, score:41, trend:"declining", stress:78, burnout:82, sleep:38, resilience:35, social:30, notes:"High workload stress. Needs urgent support.", history:[{s:"S1",score:55,stress:60},{s:"S2",score:52,stress:65},{s:"S3",score:48,stress:70},{s:"S4",score:44,stress:75},{s:"S5",score:41,stress:78}] },
  { id:3, name:"Sneha Reddy", age:19, condition:"Depression", sessions:12, score:55, trend:"stable", stress:52, burnout:48, sleep:58, resilience:55, social:50, notes:"Stable. Continue weekly check-ins.", history:[{s:"S1",score:40,stress:70},{s:"S2",score:45,stress:65},{s:"S3",score:50,stress:60},{s:"S4",score:53,stress:55},{s:"S5",score:55,stress:52}] },
];

const TREND_COLOR = { improving:"#10b981", stable:"#06b6d4", declining:"#f87171", critical:"#ef4444" };
const TREND_ICON = { improving:TrendingUp, stable:Activity, declining:TrendingDown, critical:AlertTriangle };

function AddPatientModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ name:"", age:"", condition:"", notes:"" });
  function submit() {
    if (!form.name || !form.condition) return;
    onAdd({ id: Date.now(), name:form.name, age:parseInt(form.age)||25, condition:form.condition, sessions:1, score:60, trend:"stable", stress:50, burnout:40, sleep:60, resilience:60, social:60, notes:form.notes, history:[{s:"S1",score:60,stress:50}] });
    onClose();
  }
  const inp = { width:"100%", padding:"0.6rem 0.9rem", borderRadius:10, border:"1px solid #e5e7eb", fontSize:"0.9rem", outline:"none", marginTop:"0.3rem", boxSizing:"border-box" };
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:"1rem"}}>
      <motion.div initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} style={{background:"white",borderRadius:24,padding:"2rem",width:"100%",maxWidth:440,boxShadow:"0 24px 64px rgba(0,0,0,0.15)"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1.5rem"}}>
          <h2 style={{fontSize:"1.2rem",fontWeight:700}}>Add New Patient</h2>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer"}}><X size={20} /></button>
        </div>
        {[["Patient Name","name","text"],["Age","age","number"],["Condition","condition","text"],["Initial Notes","notes","text"]].map(([label,key,type]) => (
          <div key={key} style={{marginBottom:"1rem"}}>
            <label style={{fontSize:"0.8rem",fontWeight:600,color:"#374151"}}>{label}</label>
            <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})} placeholder={label} style={inp} />
          </div>
        ))}
        <button onClick={submit} style={{width:"100%",padding:"0.8rem",borderRadius:12,background:"linear-gradient(135deg,#0ea5e9,#06b6d4)",color:"white",border:"none",fontWeight:700,fontSize:"0.95rem",cursor:"pointer",marginTop:"0.5rem"}}>
          Add Patient
        </button>
      </motion.div>
    </div>
  );
}

export default function Doctor() {
  const [patients, setPatients] = useState(INITIAL_PATIENTS);
  const [selected, setSelected] = useState(INITIAL_PATIENTS[0]);
  const [showAdd, setShowAdd] = useState(false);
  const [noteText, setNoteText] = useState("");
  const [tab, setTab] = useState("overview");

  function addPatient(p) { setPatients(prev=>[...prev,p]); setSelected(p); }
  function saveNote() {
    if (!noteText.trim()) return;
    setPatients(prev=>prev.map(p=>p.id===selected.id?{...p,notes:noteText}:p));
    setSelected(prev=>({...prev,notes:noteText}));
    setNoteText("");
  }

  const p = patients.find(x=>x.id===selected.id) || selected;
  const TIcon = TREND_ICON[p.trend] || Activity;
  const tColor = TREND_COLOR[p.trend] || "#06b6d4";

  const indicators = [
    {label:"Emotional Balance",val:p.score,icon:"⚖️"},
    {label:"Stress Level",val:p.stress,icon:"⚡"},
    {label:"Burnout Risk",val:p.burnout,icon:"🔋"},
    {label:"Sleep Wellness",val:p.sleep,icon:"🌙"},
    {label:"Resilience",val:p.resilience,icon:"🛡️"},
    {label:"Social Connect",val:p.social,icon:"💬"},
  ];

  const tabStyle = (t) => ({
    padding:"0.5rem 1.1rem", borderRadius:20, border:"none", cursor:"pointer", fontWeight:600, fontSize:"0.82rem",
    background: tab===t ? "linear-gradient(135deg,#0ea5e9,#06b6d4)" : "rgba(0,0,0,0.05)",
    color: tab===t ? "white" : "#6b7280",
  });

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#f0f9ff,#ecfeff,#f0fdf4)",padding:"1.5rem"}}>
      {showAdd && <AddPatientModal onAdd={addPatient} onClose={()=>setShowAdd(false)} />}
      <div style={{maxWidth:1200,margin:"0 auto"}}>

        {/* Header */}
        <motion.div initial={{opacity:0,y:-16}} animate={{opacity:1,y:0}} style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"1.5rem",flexWrap:"wrap",gap:"1rem"}}>
          <div style={{display:"flex",alignItems:"center",gap:"0.75rem"}}>
            <div style={{width:44,height:44,borderRadius:12,background:"linear-gradient(135deg,#0ea5e9,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 4px 16px rgba(6,182,212,0.3)"}}>
              <Brain size={22} color="white" />
            </div>
            <div>
              <h1 style={{fontSize:"1.2rem",fontWeight:800,color:"#0f172a"}}>Doctor / Therapist Portal</h1>
              <p style={{fontSize:"0.78rem",color:"#6b7280"}}>MindEase AI · Patient Wellness Monitoring</p>
            </div>
          </div>
          <button onClick={()=>setShowAdd(true)} style={{display:"flex",alignItems:"center",gap:"0.4rem",padding:"0.6rem 1.2rem",borderRadius:20,background:"linear-gradient(135deg,#0ea5e9,#06b6d4)",color:"white",border:"none",fontWeight:700,cursor:"pointer",fontSize:"0.85rem",boxShadow:"0 4px 16px rgba(6,182,212,0.3)"}}>
            <Plus size={16} /> Add Patient
          </button>
        </motion.div>

        <div style={{display:"grid",gridTemplateColumns:"280px 1fr",gap:"1.25rem"}}>

          {/* Patient List */}
          <div>
            <p style={{fontSize:"0.75rem",fontWeight:700,color:"#6b7280",textTransform:"uppercase",letterSpacing:"0.05em",marginBottom:"0.75rem"}}>Patients ({patients.length})</p>
            <div style={{display:"flex",flexDirection:"column",gap:"0.5rem"}}>
              {patients.map(pt => {
                const tc = TREND_COLOR[pt.trend]||"#06b6d4";
                const isSel = selected.id===pt.id;
                return (
                  <motion.div key={pt.id} whileHover={{x:3}} onClick={()=>setSelected(pt)} style={{padding:"0.9rem 1rem",borderRadius:14,cursor:"pointer",background:isSel?"rgba(14,165,233,0.1)":"rgba(255,255,255,0.7)",border:isSel?"1.5px solid #0ea5e9":"1px solid rgba(255,255,255,0.6)",backdropFilter:"blur(12px)",transition:"all 0.2s"}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <p style={{fontWeight:700,fontSize:"0.9rem",color:"#111827"}}>{pt.name}</p>
                        <p style={{fontSize:"0.75rem",color:"#6b7280"}}>{pt.condition} · {pt.sessions} sessions</p>
                      </div>
                      <ChevronRight size={14} color="#9ca3af" />
                    </div>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:"0.5rem"}}>
                      <span style={{fontSize:"0.7rem",fontWeight:700,padding:"2px 8px",borderRadius:20,background:tc+"18",color:tc,border:`1px solid ${tc}30`}}>{pt.trend}</span>
                      <span style={{fontSize:"0.8rem",fontWeight:800,color:pt.score>=65?"#10b981":pt.score>=45?"#fb923c":"#f87171"}}>{pt.score}/100</span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Patient Detail */}
          <AnimatePresence mode="wait">
            <motion.div key={p.id} initial={{opacity:0,x:20}} animate={{opacity:1,x:0}} exit={{opacity:0,x:-20}} style={{display:"flex",flexDirection:"column",gap:"1rem"}}>

              {/* Patient Header Card */}
              <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderRadius:20,padding:"1.25rem",border:"1px solid rgba(255,255,255,0.6)",boxShadow:"0 4px 20px rgba(0,0,0,0.06)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:"0.5rem"}}>
                  <div>
                    <h2 style={{fontSize:"1.3rem",fontWeight:800,color:"#0f172a"}}>{p.name}</h2>
                    <p style={{fontSize:"0.82rem",color:"#6b7280"}}>Age {p.age} · {p.condition} · {p.sessions} sessions</p>
                  </div>
                  <div style={{textAlign:"right"}}>
                    <p style={{fontSize:"2rem",fontWeight:900,color:tColor,lineHeight:1}}>{p.score}</p>
                    <p style={{fontSize:"0.72rem",color:"#6b7280"}}>Wellness Score</p>
                  </div>
                </div>
                <div style={{display:"flex",gap:"0.5rem",marginTop:"0.75rem",flexWrap:"wrap"}}>
                  <span style={{display:"flex",alignItems:"center",gap:"0.3rem",fontSize:"0.75rem",fontWeight:700,padding:"4px 10px",borderRadius:20,background:tColor+"18",color:tColor,border:`1px solid ${tColor}30`}}>
                    <TIcon size={11} /> {p.trend}
                  </span>
                </div>
              </div>

              {/* Tabs */}
              <div style={{display:"flex",gap:"0.5rem",flexWrap:"wrap"}}>
                {["overview","chart","notes","report"].map(t=>(
                  <button key={t} onClick={()=>setTab(t)} style={tabStyle(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
                ))}
              </div>

              {/* Tab Content */}
              {tab==="overview" && (
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:"0.75rem"}}>
                  {indicators.map(ind => {
                    const c = ind.val>=65?"#10b981":ind.val>=45?"#fb923c":"#f87171";
                    return (
                      <motion.div key={ind.label} whileHover={{y:-3}} style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(16px)",borderRadius:16,padding:"1rem",textAlign:"center",border:"1px solid rgba(255,255,255,0.6)",boxShadow:"0 2px 12px rgba(0,0,0,0.05)"}}>
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
              )}

              {tab==="chart" && (
                <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderRadius:20,padding:"1.25rem",border:"1px solid rgba(255,255,255,0.6)"}}>
                  <p style={{fontWeight:700,fontSize:"0.9rem",marginBottom:"0.25rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><TrendingUp size={15} color="#0ea5e9" /> Emotional Wellness Progression</p>
                  <p style={{fontSize:"0.75rem",color:"#6b7280",marginBottom:"1rem"}}>Session-by-session wellness & stress tracking</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={p.history}>
                      <defs>
                        <linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/><stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/></linearGradient>
                        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f87171" stopOpacity={0.25}/><stop offset="95%" stopColor="#f87171" stopOpacity={0}/></linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                      <XAxis dataKey="s" tick={{fontSize:11}} axisLine={false} tickLine={false} />
                      <YAxis domain={[0,100]} tick={{fontSize:11}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{borderRadius:12,fontSize:12,border:"1px solid rgba(0,0,0,0.08)"}} />
                      <Area type="monotone" dataKey="score" stroke="#0ea5e9" fill="url(#wg)" strokeWidth={2.5} dot={{fill:"#0ea5e9",r:4}} name="Wellness Score" />
                      <Area type="monotone" dataKey="stress" stroke="#f87171" fill="url(#sg)" strokeWidth={2} strokeDasharray="5 3" dot={{fill:"#f87171",r:3}} name="Stress Level" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div style={{display:"flex",gap:"1.5rem",marginTop:"0.75rem"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}><div style={{width:12,height:3,background:"#0ea5e9",borderRadius:2}} /><span style={{fontSize:"0.72rem",color:"#6b7280"}}>Wellness</span></div>
                    <div style={{display:"flex",alignItems:"center",gap:"0.4rem"}}><div style={{width:12,height:3,background:"#f87171",borderRadius:2}} /><span style={{fontSize:"0.72rem",color:"#6b7280"}}>Stress</span></div>
                  </div>
                </div>
              )}

              {tab==="notes" && (
                <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderRadius:20,padding:"1.25rem",border:"1px solid rgba(255,255,255,0.6)"}}>
                  <p style={{fontWeight:700,fontSize:"0.9rem",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><FileText size={15} color="#0ea5e9" /> Session Notes</p>
                  <div style={{background:"#f8fafc",borderRadius:12,padding:"1rem",marginBottom:"1rem",fontSize:"0.88rem",color:"#374151",lineHeight:1.6,minHeight:60}}>
                    {p.notes || "No notes yet."}
                  </div>
                  <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} placeholder="Add new session note..." rows={3}
                    style={{width:"100%",padding:"0.75rem",borderRadius:12,border:"1px solid #e5e7eb",fontSize:"0.88rem",resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit"}} />
                  <button onClick={saveNote} style={{marginTop:"0.75rem",padding:"0.6rem 1.5rem",borderRadius:20,background:"linear-gradient(135deg,#0ea5e9,#06b6d4)",color:"white",border:"none",fontWeight:700,cursor:"pointer",fontSize:"0.85rem"}}>
                    Save Note
                  </button>
                </div>
              )}

              {tab==="report" && (
                <div style={{background:"rgba(255,255,255,0.8)",backdropFilter:"blur(20px)",borderRadius:20,padding:"1.25rem",border:"1px solid rgba(255,255,255,0.6)"}}>
                  <p style={{fontWeight:700,fontSize:"0.9rem",marginBottom:"1rem",display:"flex",alignItems:"center",gap:"0.4rem"}}><Brain size={15} color="#0ea5e9" /> AI-Generated Patient Report</p>
                  <div style={{background:"linear-gradient(135deg,rgba(14,165,233,0.06),rgba(6,182,212,0.06))",borderRadius:14,padding:"1rem",border:"1px solid rgba(14,165,233,0.15)",marginBottom:"1rem"}}>
                    <p style={{fontSize:"0.88rem",color:"#374151",lineHeight:1.7}}>
                      <strong>{p.name}</strong> ({p.condition}) has completed <strong>{p.sessions} sessions</strong> with a current wellness score of <strong style={{color:tColor}}>{p.score}/100</strong>.
                      Emotional trend is <strong style={{color:tColor}}>{p.trend}</strong>.
                      {p.trend==="declining" ? " ⚠️ Immediate attention recommended — stress and burnout indicators are elevated." : p.trend==="improving" ? " ✅ Patient is responding positively to current support approach." : " 📊 Patient is maintaining a stable emotional baseline."}
                      {" "}Stress level: <strong>{p.stress}%</strong> · Burnout risk: <strong>{p.burnout}%</strong> · Sleep wellness: <strong>{p.sleep}%</strong>.
                    </p>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
                    {[["Risk Level",p.score<50?"High":p.score<65?"Moderate":"Low",p.score<50?"#f87171":p.score<65?"#fb923c":"#10b981"],["Sessions",p.sessions,"#0ea5e9"],["Avg Stress",p.stress+"%",p.stress>65?"#f87171":"#10b981"],["Sleep",p.sleep+"%",p.sleep<50?"#f87171":"#10b981"]].map(([l,v,c])=>(
                      <div key={l} style={{background:"rgba(0,0,0,0.025)",borderRadius:12,padding:"0.75rem",border:"1px solid rgba(0,0,0,0.05)"}}>
                        <p style={{fontSize:"0.72rem",color:"#6b7280",marginBottom:"0.2rem"}}>{l}</p>
                        <p style={{fontSize:"1.1rem",fontWeight:800,color:c}}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <button style={{marginTop:"1rem",padding:"0.6rem 1.5rem",borderRadius:20,background:"rgba(14,165,233,0.1)",color:"#0ea5e9",border:"1px solid rgba(14,165,233,0.3)",fontWeight:700,cursor:"pointer",fontSize:"0.85rem"}}>
                    �� Export PDF Report
                  </button>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
