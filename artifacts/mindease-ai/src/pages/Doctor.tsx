import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
  Brain, Bell, TrendingUp, TrendingDown, Calendar, FileText,
  ChevronRight, Shield, LogIn, Loader2, RefreshCw, AlertCircle,
  Activity, Heart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import { getAllPatientSummaries, type PatientSummary } from "@/services/firestoreService";

// ── Priority classification config ────────────────────────────────────────
const TREND_CONFIG = {
  improving: {
    label: "Improving",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/20",
    border: "border-emerald-200 dark:border-emerald-800",
    dot: "bg-emerald-400",
    icon: TrendingUp,
  },
  stable: {
    label: "Stable",
    color: "text-blue-600",
    bg: "bg-blue-50 dark:bg-blue-900/20",
    border: "border-blue-200 dark:border-blue-800",
    dot: "bg-blue-400",
    icon: Activity,
  },
  declining: {
    label: "Needs Attention",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-900/20",
    border: "border-amber-200 dark:border-amber-800",
    dot: "bg-amber-400",
    icon: TrendingDown,
  },
  critical: {
    label: "High Distress",
    color: "text-rose-600",
    bg: "bg-rose-50 dark:bg-rose-900/20",
    border: "border-rose-200 dark:border-rose-800",
    dot: "bg-rose-400",
    icon: Heart,
  },
} as const;

// ── AI wellness insight generator ──────────────────────────────────────────
function generateWellnessInsight(summary: PatientSummary): string {
  const latest = summary.latestAssessment;
  const trend = summary.trend;
  const name = summary.displayName.split(" ")[0];

  if (trend === "critical") {
    return `${name}'s recent assessments indicate elevated emotional distress patterns. Stress indicators are significantly elevated and emotional balance has declined. Early supportive intervention is recommended.`;
  }
  if (trend === "declining") {
    return `${name} shows signs of increasing emotional strain over recent sessions. Burnout risk indicators have risen and social connectivity patterns suggest some withdrawal. Monitoring and gentle support are advised.`;
  }
  if (trend === "improving") {
    return `${name} is showing positive emotional progression. Wellness scores have improved consistently and emotional balance indicators are trending upward. Current support approach appears effective.`;
  }
  // stable
  if (latest.stressIndicator > 65) {
    return `${name} maintains a stable overall state, though stress indicators remain elevated. Sleep wellness and emotional resilience patterns suggest ongoing tension that may benefit from targeted support.`;
  }
  return `${name} demonstrates stable emotional patterns across recent assessments. Wellness indicators are within a healthy range. Continued check-ins are recommended to sustain this balance.`;
}

// ── Build chart history from assessments ──────────────────────────────────
function buildChartHistory(summary: PatientSummary) {
  return summary.allAssessments
    .slice(0, 8)
    .reverse()
    .map((a, i) => ({
      session: `S${i + 1}`,
      score: a.wellnessScore ?? 58,
      stress: a.stressIndicator ?? 52,
    }));
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

// ── Doctor header sub-component ───────────────────────────────────────────
function DoctorHeader() {
  return (
    <div className="flex items-center justify-between mb-8">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold shadow-md shadow-primary/20">
          SC
        </div>
        <div>
          <h1 className="font-semibold text-lg">Dr. Sarah Chen</h1>
          <p className="text-sm text-muted-foreground">Wellness Monitoring Portal</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-muted-foreground hover:text-primary transition-colors" data-testid="button-notifications">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
        </button>
      </div>
    </div>
  );
}

export default function Doctor() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!loggedIn) return;
    setIsLoading(true);
    setLoadError(null);
    getAllPatientSummaries()
      .then((summaries) => {
        setPatients(summaries);
        if (summaries.length > 0) setSelectedPatient(summaries[0]);
      })
      .catch((err) => {
        // Always log the full error so the Firebase index URL is visible
        // in DevTools → Console if needed for debugging.
        console.error("[MANAS Doctor] Firestore query error:", err);

        const msg = String(err?.message ?? err ?? "").toLowerCase();

        // Suppress the amber banner for all Firestore infrastructure errors:
        //   - index not yet ready / requires an index
        //   - permission denied
        //   - missing or insufficient permissions
        //   - quota exceeded
        const isInfraError =
          msg.includes("index") ||
          msg.includes("permission") ||
          msg.includes("missing") ||
          msg.includes("quota") ||
          msg.includes("insufficient");

        if (!isInfraError) {
          // Only show the amber banner for genuinely unexpected errors
          setLoadError(String(err?.message ?? "An unexpected error occurred."));
        }
        // In all cases: patients stays [] → graceful empty state renders
      })
      .finally(() => setIsLoading(false));
  }, [loggedIn]);

  if (!loggedIn) {
    return (
      <PageTransition>
        <LoginForm onLogin={() => setLoggedIn(true)} />
      </PageTransition>
    );
  }

  // ── Loading ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-5">
          <motion.div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/25"
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Brain size={24} className="text-white" />
          </motion.div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-primary/50"
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
              />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">Loading patient wellness data…</p>
        </div>
      </PageTransition>
    );
  }

  // ── Error (soft — never blocks the portal) ──────────────────────────
  // loadError is only set for unexpected errors, not permission/index issues.
  // It renders as an inline banner inside the empty state, not a full-screen block.

  // ── No patients yet — premium onboarding empty state ───────────────
  if (patients.length === 0) {
    return (
      <PageTransition>
        <div className="container mx-auto max-w-7xl px-6 py-8">
          <DoctorHeader />

          {/* Soft error banner — only shown for unexpected errors */}
          {loadError && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 border border-amber-200 px-5 py-3.5"
            >
              <AlertCircle size={15} className="text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-semibold text-amber-700 mb-0.5">Data sync notice</p>
                <p className="text-[11px] text-amber-600 leading-relaxed">{loadError}</p>
              </div>
              <button
                onClick={() => { setLoadError(null); setLoggedIn(false); }}
                className="ml-auto text-[11px] text-amber-600 hover:text-amber-800 underline flex-shrink-0"
              >
                Retry
              </button>
            </motion.div>
          )}

          {/* Premium empty state */}
          <motion.div
            initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            {/* Animated orb */}
            <div className="relative flex items-center justify-center mb-8">
              {[1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-primary/15"
                  style={{ width: 60 + i * 36, height: 60 + i * 36 }}
                  animate={{ scale: [1, 1.08, 1], opacity: [0.4, 0.15, 0.4] }}
                  transition={{ duration: 3.5, repeat: Infinity, delay: i * 0.8, ease: "easeInOut" }}
                />
              ))}
              <motion.div
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary/20 to-secondary/15 flex items-center justify-center"
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-4xl select-none">🌿</span>
              </motion.div>
            </div>

            {/* Headline */}
            <motion.h2
              className="text-2xl md:text-3xl font-semibold tracking-tight mb-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              No emotional wellness records yet
            </motion.h2>

            <motion.p
              className="text-muted-foreground text-sm max-w-md leading-relaxed mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Patient emotional wellness history will appear here once users complete
              their emotional assessments on MANAS. Each completed assessment is
              automatically stored and surfaced in this portal.
            </motion.p>

            {/* Onboarding steps */}
            <motion.div
              className="grid sm:grid-cols-3 gap-4 max-w-2xl w-full mb-8"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.35 } } }}
            >
              {[
                { step: "01", icon: "😊", title: "User Completes Check-In", desc: "User selects their emotional state and shares context on MANAS." },
                { step: "02", icon: "🧠", title: "AI Assessment Runs",      desc: "RoBERTa analyses emotions, Gemini generates personalised questions." },
                { step: "03", icon: "📊", title: "Data Appears Here",       desc: "Completed assessments are stored in Firestore and visible in this portal." },
              ].map((item) => (
                <motion.div
                  key={item.step}
                  variants={{
                    hidden:  { opacity: 0, y: 16, filter: "blur(4px)" },
                    visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
                  }}
                  className="rounded-2xl p-5 text-left"
                  style={{
                    background: "rgba(255,255,255,0.6)",
                    backdropFilter: "blur(16px)",
                    border: "1px solid rgba(255,255,255,0.5)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-primary/40">{item.step}</span>
                    <span className="text-xl">{item.icon}</span>
                  </div>
                  <h3 className="text-sm font-semibold mb-1.5">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Reassurance note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="rounded-2xl px-5 py-3.5 text-xs text-muted-foreground/70 leading-relaxed max-w-lg"
              style={{ background: "rgba(0,0,0,0.025)", border: "1px solid rgba(0,0,0,0.05)" }}
            >
              <strong className="text-muted-foreground/90">Note:</strong> This portal reads from Firestore in real time.
              If you've recently completed assessments and they're not appearing, ensure the Firestore
              collection group index is deployed — see <code className="font-mono text-[10px] bg-muted px-1 rounded">firestore.indexes.json</code> in the project root.
            </motion.div>
          </motion.div>
        </div>
      </PageTransition>
    );
  }

  const patient = selectedPatient ?? patients[0];
  const trendCfg = TREND_CONFIG[patient.trend];
  const insight = generateWellnessInsight(patient);
  const chartData = buildChartHistory(patient);
  const latest = patient.latestAssessment;

  return (
    <PageTransition>
      <div className="container mx-auto max-w-7xl px-6 py-8">
        <DoctorHeader />

        <div className="grid lg:grid-cols-3 gap-6">
          {/* ── Patient List ─────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Patients ({patients.length})
              </h2>
            </div>
            <motion.div
              className="space-y-2"
              initial="hidden"
              animate="visible"
              variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
            >
              {patients.map((p) => {
                const cfg = TREND_CONFIG[p.trend];
                const isSelected = selectedPatient?.uid === p.uid;
                return (
                  <motion.button
                    key={p.uid}
                    onClick={() => setSelectedPatient(p)}
                    variants={{
                      hidden:  { opacity: 0, x: -12, filter: "blur(3px)" },
                      visible: { opacity: 1, x: 0,   filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
                    }}
                    whileHover={{ x: 4, transition: { duration: 0.2 } }}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                      isSelected
                        ? "bg-primary/10 border-primary/30 shadow-sm"
                        : "bg-card border-border hover:border-primary/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {p.displayName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{p.displayName}</p>
                          <p className="text-xs text-muted-foreground">{p.sessionCount} session{p.sessionCount !== 1 ? "s" : ""}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                    </div>
                    <div className="mt-2.5 flex items-center justify-between">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                      <span className="text-xs font-semibold" style={{ color: p.avgWellnessScore >= 65 ? "#34d399" : p.avgWellnessScore >= 45 ? "#fb923c" : "#f87171" }}>
                        {p.avgWellnessScore}/100
                      </span>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          {/* ── Patient Detail ───────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={patient.uid}
              initial={{ opacity: 0, x: 20, filter: "blur(5px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, x: -20, filter: "blur(3px)" }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-2 space-y-5"
            >
              {/* Patient header */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="p-5 rounded-2xl bg-card border border-border"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="text-xl font-semibold">{patient.displayName}</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">{patient.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">{patient.avgWellnessScore}</p>
                    <p className="text-xs text-muted-foreground">Avg Wellness</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full border ${trendCfg.bg} ${trendCfg.color} ${trendCfg.border}`}>
                    <trendCfg.icon size={11} />
                    {trendCfg.label}
                  </span>
                  <span className="text-xs text-muted-foreground">{patient.sessionCount} total sessions</span>
                  <span className="text-xs text-muted-foreground capitalize">
                    Latest: {latest.dominantEmotion} · {latest.assessmentLevel}
                  </span>
                </div>
              </motion.div>

              {/* Wellness indicators */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid grid-cols-3 gap-3"
              >
                {[
                  { label: "Emotional Balance", value: latest.emotionalBalance,    icon: "⚖️" },
                  { label: "Stress Level",       value: latest.stressIndicator,    icon: "⚡" },
                  { label: "Burnout Risk",        value: latest.burnoutRisk,        icon: "🔋" },
                  { label: "Sleep Wellness",      value: latest.sleepWellness,      icon: "🌙" },
                  { label: "Resilience",          value: latest.emotionalResilience,icon: "🛡️" },
                  { label: "Social Connect.",     value: latest.socialConnectivity, icon: "💬" },
                ].map((ind, i) => {
                  const color = ind.value >= 65 ? "#34d399" : ind.value >= 45 ? "#fb923c" : "#f87171";
                  return (
                    <motion.div
                      key={ind.label}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.05 }}
                      className="p-3 rounded-xl bg-card border border-border text-center"
                    >
                      <div className="text-lg mb-1">{ind.icon}</div>
                      <p className="text-base font-bold" style={{ color }}>{ind.value}%</p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{ind.label}</p>
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Emotional trend chart */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18 }}
                className="p-5 rounded-2xl bg-card border border-border"
              >
                <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
                  <TrendingUp size={15} className="text-primary" />
                  Emotional Wellness Progression
                </h3>
                {chartData.length > 1 ? (
                  <ResponsiveContainer width="100%" height={160}>
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="wellnessGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="stressGrad2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#f87171" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="session" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} />
                      <Area type="monotone" dataKey="score"  stroke="hsl(var(--primary))" fill="url(#wellnessGrad)" strokeWidth={2.5} dot={{ fill: "hsl(var(--primary))", r: 4 }} name="Wellness" />
                      <Area type="monotone" dataKey="stress" stroke="#f87171" fill="url(#stressGrad2)" strokeWidth={2} dot={{ fill: "#f87171", r: 3 }} strokeDasharray="5 3" name="Stress" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[160px] flex items-center justify-center text-sm text-muted-foreground">
                    More sessions needed to show trend
                  </div>
                )}
              </motion.div>

              {/* AI Wellness Insight */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24 }}
                className="p-5 rounded-2xl glass-card"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <Brain size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-1.5">AI Wellness Insight</p>
                    <p className="text-sm text-foreground leading-relaxed">{insight}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-2">
                      Based on {patient.sessionCount} assessment{patient.sessionCount !== 1 ? "s" : ""}. Not a clinical diagnosis.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Assessment history */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-primary" />
                  Assessment History
                </h3>
                <motion.div
                  className="space-y-3"
                  initial="hidden"
                  animate="visible"
                  variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
                >
                  {patient.allAssessments.slice(0, 5).map((assessment, i) => {
                    const ts = assessment.timestamp as { toDate?: () => Date } | null;
                    const dateStr = ts?.toDate
                      ? ts.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                      : "Recent";
                    const moodEmoji = assessment.selectedMood === "happy" ? "😊" : assessment.selectedMood === "sad" ? "😔" : "😐";
                    const levelColor = assessment.assessmentLevel === "elevated" ? "#f87171" : assessment.assessmentLevel === "moderate" ? "#fb923c" : "#34d399";
                    return (
                      <motion.div
                        key={i}
                        variants={{
                          hidden:  { opacity: 0, y: 10, filter: "blur(3px)" },
                          visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as [number,number,number,number] } },
                        }}
                        className="p-4 rounded-xl bg-card border border-border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{moodEmoji}</span>
                            <div>
                              <span className="text-xs font-semibold capitalize text-foreground/80">{assessment.dominantEmotion}</span>
                              <span className="text-xs text-muted-foreground ml-2">· Wellness {assessment.wellnessScore}/100</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                              style={{ background: `${levelColor}15`, color: levelColor, border: `1px solid ${levelColor}30` }}
                            >
                              {assessment.assessmentLevel}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60">{dateStr}</span>
                          </div>
                        </div>
                        {assessment.reflection && (
                          <p className="text-xs text-muted-foreground leading-relaxed italic line-clamp-2">
                            "{assessment.reflection}"
                          </p>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>
              </motion.div>

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
