import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  Brain, Bell, TrendingUp, TrendingDown, Calendar, FileText,
  User, ChevronRight, Shield, LogIn
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

const patients = [
  {
    id: 1, name: "Arjun Verma", age: 24, lastSession: "May 7, 2026",
    mood: "improving", moodTrend: "up", condition: "Anxiety & Depression",
    sessions: 14, score: 68,
    history: [
      { week: "W1", score: 35 }, { week: "W2", score: 40 }, { week: "W3", score: 38 },
      { week: "W4", score: 50 }, { week: "W5", score: 55 }, { week: "W6", score: 62 },
      { week: "W7", score: 68 }, { week: "W8", score: 72 },
    ],
    insight: "Arjun has shown consistent improvement in anxiety management. His sleep patterns have stabilized and he reports fewer intrusive thoughts. Continued CBT and journaling exercises are recommended.",
    pastSessions: [
      { date: "May 7", mood: "Neutral", notes: "Discussed sleep hygiene. Patient practiced 4-7-8 breathing." },
      { date: "Apr 30", mood: "Low", notes: "Explored cognitive distortions around work performance." },
      { date: "Apr 23", mood: "Anxious", notes: "Introduced mindfulness techniques for exam stress." },
    ],
  },
  {
    id: 2, name: "Priya Nair", age: 31, lastSession: "May 8, 2026",
    mood: "stable", moodTrend: "neutral", condition: "Burnout",
    sessions: 6, score: 54,
    history: [
      { week: "W1", score: 45 }, { week: "W2", score: 48 }, { week: "W3", score: 50 },
      { week: "W4", score: 52 }, { week: "W5", score: 51 }, { week: "W6", score: 54 },
    ],
    insight: "Priya is in the early recovery phase of burnout. She has begun setting healthier work boundaries. Key focus areas remain sleep quality and reducing self-critical thought patterns.",
    pastSessions: [
      { date: "May 8", mood: "Neutral", notes: "Discussed boundary-setting at work. Assigned limit-setting homework." },
      { date: "May 1", mood: "Exhausted", notes: "Validated emotional exhaustion. Discussed rest as a form of productivity." },
      { date: "Apr 24", mood: "Overwhelmed", notes: "Created priority matrix to reduce decision fatigue." },
    ],
  },
  {
    id: 3, name: "Rohan Das", age: 19, lastSession: "May 6, 2026",
    mood: "needs attention", moodTrend: "down", condition: "Social Anxiety",
    sessions: 9, score: 41,
    history: [
      { week: "W1", score: 55 }, { week: "W2", score: 50 }, { week: "W3", score: 52 },
      { week: "W4", score: 46 }, { week: "W5", score: 44 }, { week: "W6", score: 41 },
    ],
    insight: "Rohan's scores have declined in recent weeks, coinciding with increased social demands during college events. Early intervention recommended. Consider exposure therapy to build confidence in group settings.",
    pastSessions: [
      { date: "May 6", mood: "Anxious", notes: "Patient reports avoidance of group activities. Social hierarchy fears explored." },
      { date: "Apr 29", mood: "Low", notes: "Discussed negative self-talk patterns in social contexts." },
      { date: "Apr 22", mood: "Neutral", notes: "Role-play exercises for initiating conversations." },
    ],
  },
  {
    id: 4, name: "Sana Khan", age: 27, lastSession: "May 8, 2026",
    mood: "improving", moodTrend: "up", condition: "Grief & Loss",
    sessions: 11, score: 61,
    history: [
      { week: "W1", score: 30 }, { week: "W2", score: 32 }, { week: "W3", score: 38 },
      { week: "W4", score: 44 }, { week: "W5", score: 50 }, { week: "W6", score: 58 }, { week: "W7", score: 61 },
    ],
    insight: "Sana continues to process grief in a healthy and structured manner. She has developed a meaningful support network and shows growing resilience. Continued processing of loss with meaning-making exercises.",
    pastSessions: [
      { date: "May 8", mood: "Neutral", notes: "Meaning-making exercise: letters to lost loved one. Strong emotional release." },
      { date: "May 1", mood: "Low", notes: "Grief wave exercise. Identified triggers and coping strategies." },
      { date: "Apr 24", mood: "Sad", notes: "Explored continuing bonds theory. Discussed memory keeping." },
    ],
  },
  {
    id: 5, name: "Dev Sharma", age: 35, lastSession: "May 5, 2026",
    mood: "stable", moodTrend: "neutral", condition: "Work-Life Balance",
    sessions: 4, score: 72,
    history: [
      { week: "W1", score: 65 }, { week: "W2", score: 68 }, { week: "W3", score: 70 }, { week: "W4", score: 72 },
    ],
    insight: "Dev is responding well to structured time-blocking and value-alignment exercises. He reports improved sense of control and family quality time. Low risk — maintenance sessions recommended quarterly.",
    pastSessions: [
      { date: "May 5", mood: "Positive", notes: "Reviewed weekly time blocks. Celebrated successful family boundary." },
      { date: "Apr 28", mood: "Neutral", notes: "Values clarification exercise. Identified top 3 life priorities." },
      { date: "Apr 21", mood: "Stressed", notes: "Discussed digital boundary strategies at work." },
    ],
  },
];

function MoodBadge({ trend, mood }: { trend: string; mood: string }) {
  const config = {
    up: { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-100 dark:bg-emerald-900/30", label: mood },
    down: { icon: TrendingDown, color: "text-rose-500", bg: "bg-rose-100 dark:bg-rose-900/30", label: mood },
    neutral: { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", label: mood },
  }[trend] || { icon: TrendingUp, color: "text-blue-500", bg: "bg-blue-100 dark:bg-blue-900/30", label: mood };

  return (
    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${config.bg} ${config.color} font-medium capitalize`}>
      <config.icon size={10} />
      {config.label}
    </span>
  );
}

function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary mx-auto flex items-center justify-center shadow-lg shadow-primary/30 mb-4">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-semibold">Doctor Access</h1>
          <p className="text-sm text-muted-foreground mt-1">Secure portal for healthcare professionals</p>
        </div>
        <div className="glass-card rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="doctor@manas.ai"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              data-testid="input-doctor-email"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30 transition-all"
              data-testid="input-doctor-password"
            />
          </div>
          <Button
            className="w-full rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 gap-2 mt-2"
            onClick={onLogin}
            data-testid="button-doctor-login"
          >
            <LogIn size={16} /> Access Dashboard
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-4">
          Demo: enter any credentials to access the portal
        </p>
      </motion.div>
    </div>
  );
}

export default function Doctor() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(patients[0]);

  if (!loggedIn) {
    return (
      <PageTransition>
        <LoginForm onLogin={() => setLoggedIn(true)} />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="container mx-auto max-w-7xl px-6 py-8">
        {/* Doctor Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
              SC
            </div>
            <div>
              <h1 className="font-semibold text-lg">Dr. Sarah Chen</h1>
              <p className="text-sm text-muted-foreground">Clinical Psychologist</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors" data-testid="button-notifications">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient List */}
          <div className="lg:col-span-1">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Patients</h2>
            <div className="space-y-2">
              {patients.map((patient) => (
                <motion.button
                  key={patient.id}
                  onClick={() => setSelectedPatient(patient)}
                  whileHover={{ x: 4 }}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedPatient.id === patient.id
                      ? "bg-primary/10 border-primary/30 shadow-sm"
                      : "bg-card border-border hover:border-primary/20"
                  }`}
                  data-testid={`patient-card-${patient.id}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center">
                        <User size={14} className="text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{patient.name}</p>
                        <p className="text-xs text-muted-foreground">Age {patient.age} · {patient.sessions} sessions</p>
                      </div>
                    </div>
                    <ChevronRight size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <MoodBadge trend={patient.moodTrend} mood={patient.mood} />
                    <p className="text-xs text-muted-foreground">{patient.lastSession}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Patient Detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedPatient.id}
              initial={{ opacity: 0, x: 20, filter: "blur(5px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(3px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-2 space-y-5"
            >
              {/* Patient header */}
              <div className="p-5 rounded-2xl bg-card border border-border">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedPatient.name}</h2>
                    <p className="text-sm text-muted-foreground">{selectedPatient.condition} · Age {selectedPatient.age}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{selectedPatient.score}</p>
                    <p className="text-xs text-muted-foreground">Wellness Score</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <MoodBadge trend={selectedPatient.moodTrend} mood={selectedPatient.mood} />
                  <span className="text-xs text-muted-foreground">Last session: {selectedPatient.lastSession}</span>
                  <span className="text-xs text-muted-foreground">{selectedPatient.sessions} total sessions</span>
                </div>
              </div>

              {/* Chart */}
              <div className="p-5 rounded-2xl bg-card border border-border">
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={15} className="text-primary" />
                  Emotional History
                </h3>
                <ResponsiveContainer width="100%" height={160}>
                  <AreaChart data={selectedPatient.history}>
                    <defs>
                      <linearGradient id="patientGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                    <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#patientGrad)" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* AI Insight */}
              <div className="p-5 rounded-2xl glass-card">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Brain size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">AI Clinical Insight</p>
                    <p className="text-sm text-foreground leading-relaxed">{selectedPatient.insight}</p>
                  </div>
                </div>
              </div>

              {/* Session Summaries */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-primary" />
                  Recent Sessions
                </h3>
                <div className="space-y-3">
                  {selectedPatient.pastSessions.map((session, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      transition={{ delay: i * 0.09, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="p-4 rounded-xl bg-card border border-border"
                      data-testid={`session-summary-${i}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Calendar size={13} className="text-muted-foreground" />
                          <span className="text-xs font-medium">{session.date}</span>
                        </div>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{session.mood}</span>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed">{session.notes}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              <Button className="rounded-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90" data-testid="button-schedule-session">
                <Calendar size={15} /> Schedule Next Session
              </Button>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  );
}
