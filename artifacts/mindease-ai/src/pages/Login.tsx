import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Heart, Stethoscope, Building2, ArrowRight, Brain } from "lucide-react";

const ROLES = [
  { id:"user", emoji:"🌿", title:"Individual User", desc:"Personal emotional wellness, mood tracking & AI support", gradient:"linear-gradient(135deg,#8b5cf6,#6366f1)", glow:"rgba(139,92,246,0.35)", border:"#8b5cf6", path:"/checkin" },
  { id:"doctor", emoji:"🩺", title:"Doctor / Therapist", desc:"Monitor patients, add patient data, track reports & graphs", gradient:"linear-gradient(135deg,#0ea5e9,#06b6d4)", glow:"rgba(6,182,212,0.35)", border:"#06b6d4", path:"/doctor" },
  { id:"org", emoji:"🏢", title:"Organization / NGO", desc:"Community wellness analytics, workshops & anonymized insights", gradient:"linear-gradient(135deg,#10b981,#059669)", glow:"rgba(16,185,129,0.35)", border:"#10b981", path:"/org" },
];

export default function Login() {
  const [selected, setSelected] = useState(null);
  const [, navigate] = useLocation();
  const role = ROLES.find(r => r.id === selected);

  return (
    <div style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"2rem 1rem",background:"radial-gradient(ellipse at 20% 30%,#ede9fe,transparent 50%),radial-gradient(ellipse at 80% 20%,#cffafe,transparent 50%),#f8fafc"}}>
      <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} style={{textAlign:"center",marginBottom:"2.5rem"}}>
        <div style={{width:56,height:56,borderRadius:16,background:"linear-gradient(135deg,#8b5cf6,#06b6d4)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 1rem",boxShadow:"0 8px 32px rgba(139,92,246,0.3)"}}>
          <Brain size={28} color="white" />
        </div>
        <h1 style={{fontSize:"2.2rem",fontWeight:800,background:"linear-gradient(135deg,#8b5cf6,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",marginBottom:"0.5rem"}}>MindEase AI</h1>
        <p style={{color:"#6b7280"}}>Choose your experience to get started</p>
      </motion.div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(250px,1fr))",gap:"1.25rem",width:"100%",maxWidth:860,marginBottom:"2rem"}}>
        {ROLES.map((r,i) => {
          const isSel = selected === r.id;
          return (
            <motion.div key={r.id} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} whileHover={{y:-6,scale:1.02}} whileTap={{scale:0.98}} onClick={()=>setSelected(r.id)}
              style={{borderRadius:24,padding:"1.75rem",cursor:"pointer",background:isSel?"rgba(255,255,255,0.95)":"rgba(255,255,255,0.7)",backdropFilter:"blur(20px)",border:isSel?`2px solid ${r.border}`:"1.5px solid rgba(255,255,255,0.6)",boxShadow:isSel?`0 20px 60px ${r.glow}`:"0 4px 24px rgba(0,0,0,0.06)",transition:"all 0.3s",position:"relative",overflow:"hidden"}}>
              {isSel && <div style={{position:"absolute",inset:0,background:`radial-gradient(ellipse at 30% 20%,${r.glow},transparent 65%)`,pointerEvents:"none"}} />}
              {isSel && <motion.div initial={{scaleX:0}} animate={{scaleX:1}} style={{position:"absolute",bottom:0,left:0,right:0,height:4,background:r.gradient,borderRadius:"0 0 24px 24px"}} />}
              <div style={{position:"relative",zIndex:1}}>
                <div style={{fontSize:"2.5rem",marginBottom:"0.75rem"}}>{r.emoji}</div>
                <h3 style={{fontSize:"1.1rem",fontWeight:700,marginBottom:"0.5rem",color:"#111827"}}>{r.title}</h3>
                <p style={{fontSize:"0.85rem",color:"#6b7280",lineHeight:1.5}}>{r.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selected && (
        <motion.button initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} whileHover={{scale:1.04}} whileTap={{scale:0.97}} onClick={()=>navigate(role.path)}
          style={{background:role.gradient,color:"white",border:"none",borderRadius:50,padding:"0.9rem 2.5rem",fontSize:"1rem",fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:"0.5rem",boxShadow:`0 12px 40px ${role.glow}`}}>
          Enter {selected==="user"?"Wellness Portal":selected==="doctor"?"Doctor Portal":"Organization Dashboard"} <ArrowRight size={18} />
        </motion.button>
      )}
      <p style={{marginTop:"2rem",fontSize:"0.75rem",color:"#9ca3af",textAlign:"center"}}>AI-assisted emotional wellness · Not a medical diagnosis tool</p>
    </div>
  );
}
