import { useState } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from "recharts";
import {
  Brain, Download, ChevronDown, Heart, Moon, Lightbulb,
  Target, Wind, BookOpen, Calendar, Sparkles, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

const sessionData = [
  { min: "0", score: 45 }, { min: "10", score: 42 }, { min: "20", score: 50 },
  { min: "30", score: 58 }, { min: "40", score: 65 }, { min: "50", score: 70 }, { min: "60", score: 74 },
];

const keyConcerns = [
  {
    title: "Sleep Disruption", icon: Moon,
    detail: "Patient reports difficulty falling asleep for the past 3 weeks. Racing thoughts at bedtime are the primary reported trigger. Sleep onset latency is approximately 90 minutes.",
    color: "from-blue-500 to-indigo-500",
  },
  {
    title: "Work-Related Stress", icon: Target,
    detail: "High-pressure deadlines and fear of underperformance are recurring themes. Patient describes a persistent 'Sunday dread' phenomenon. Performance anxiety appears to be tied to childhood achievement expectations.",
    color: "from-violet-500 to-purple-600",
  },
  {
    title: "Social Withdrawal", icon: Heart,
    detail: "Gradual retreat from social engagements noted over the past month. Patient attributes this to exhaustion rather than disinterest in connection. Maintaining existing relationships has felt effortful.",
    color: "from-rose-500 to-pink-500",
  },
];

const recommendations = [
  { icon: Wind,     title: "Breathing Practice", desc: "10 minutes of box breathing before bed to reduce sleep onset anxiety.",          color: "from-cyan-400 to-sky-500"    },
  { icon: BookOpen, title: "Journaling",          desc: "5-minute 'brain dump' journaling to offload mental load before sleep.",          color: "from-violet-400 to-purple-500" },
  { icon: Moon,     title: "Sleep Hygiene",       desc: "Consistent sleep/wake times, no screens 45 minutes before bed.",                color: "from-blue-400 to-indigo-500"  },
  { icon: Lightbulb,title: "Cognitive Reframe",   desc: "Replace 'I must not fail' with 'I am learning and growing every day.'",         color: "from-amber-400 to-orange-500" },
];

const aiObservations = [
  "Throughout this session, emotional tone shifted markedly from defensive and guarded in the first 20 minutes to reflective and open by the midpoint — a sign of growing therapeutic trust. The patient's language showed reduced catastrophizing compared to previous sessions.",
  "Recurring references to external validation and fear of disappointing others suggest a deeper pattern of conditional self-worth. This is a productive area for future sessions. The patient demonstrated good insight when this pattern was named explicitly.",
];

export default function SessionSummary() {
  const [openConcern, setOpenConcern] = useState<number | null>(null);

  return (
    <PageTransition>
      <div className="container mx-auto max-w-4xl px-6 py-12">

        {/* ── Header ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(5px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.65, ease: EASE }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
            <Calendar size={14} />
            <span>Session Date: May 9, 2026</span>
            <span className="text-border">·</span>
            <span>Duration: 60 minutes</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">Session Summary</h1>
          <p className="text-muted-foreground">AI-generated report based on your emotional wellness assessment</p>
        </motion.div>

        {/* ── Emotional Arc Card ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
          transition={{ delay: 0.1, duration: 0.7, ease: EASE }}
          className="p-6 rounded-2xl bg-card border border-border mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              Emotional Arc This Session
            </h2>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">+29pts</p>
              <p className="text-xs text-muted-foreground">Emotional lift</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <AreaChart data={sessionData}>
              <defs>
                <linearGradient id="arcGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="min" tickFormatter={(v) => `${v}m`} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis domain={[30, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }} formatter={(v) => [`${v} / 100`, "Emotional State"]} />
              <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fill="url(#arcGrad)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2 text-center">Started at 45/100 · Ended at 74/100</p>
        </motion.div>

        {/* ── Key Concerns — stagger slide-in ──────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.18, duration: 0.6, ease: EASE }}
          className="mb-6"
        >
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Target size={16} className="text-primary" />
            Key Concerns Identified
          </h2>
          <motion.div
            className="space-y-3"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1, delayChildren: 0.25 } } }}
          >
            {keyConcerns.map((concern, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden:  { opacity: 0, x: -18, filter: "blur(3px)" },
                  visible: { opacity: 1, x: 0,   filter: "blur(0px)", transition: { duration: 0.5, ease: EASE } },
                }}
                className="rounded-2xl bg-card border border-border overflow-hidden cursor-pointer hover:border-primary/20 transition-colors duration-200"
                onClick={() => setOpenConcern(openConcern === i ? null : i)}
                data-testid={`concern-card-${i}`}
              >
                <div className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-gradient-to-br ${concern.color} shadow-md`}>
                      <concern.icon size={16} className="text-white" />
                    </div>
                    <h3 className="font-medium text-sm">{concern.title}</h3>
                  </div>
                  <motion.div animate={{ rotate: openConcern === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </motion.div>
                </div>
                <AnimatePresence initial={false}>
                  {openConcern === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{concern.detail}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── AI Observations — blur-clear ──────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.28, duration: 0.6, ease: EASE }}
          className="mb-6"
        >
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Brain size={16} className="text-primary" />
            AI Observations
          </h2>
          <motion.div
            className="space-y-4"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12, delayChildren: 0.35 } } }}
          >
            {aiObservations.map((obs, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden:  { opacity: 0, y: 14, filter: "blur(3px)" },
                  visible: { opacity: 1, y: 0,  filter: "blur(0px)", transition: { duration: 0.55, ease: EASE } },
                }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0 mt-0.5">
                    <Sparkles size={14} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{obs}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Recommendations — stagger float-up ───────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.35, duration: 0.6, ease: EASE }}
          className="mb-10"
        >
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb size={16} className="text-primary" />
            Wellness Recommendations
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.42 } } }}
          >
            {recommendations.map((rec, i) => (
              <motion.div
                key={i}
                variants={{
                  hidden:  { opacity: 0, y: 18, scale: 0.97, filter: "blur(3px)" },
                  visible: { opacity: 1, y: 0,  scale: 1,    filter: "blur(0px)", transition: { duration: 0.55, ease: EASE } },
                }}
                whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.08)", transition: { duration: 0.22 } }}
                className="p-5 rounded-2xl bg-card border border-border hover:border-primary/20 transition-colors duration-200"
                data-testid={`recommendation-card-${i}`}
              >
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${rec.color} w-fit mb-3 shadow-md`}>
                  <rec.icon size={16} className="text-white" />
                </div>
                <h3 className="font-medium text-sm mb-1">{rec.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── Actions ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ delay: 0.55, duration: 0.5, ease: EASE }}
          className="flex flex-wrap gap-3"
        >
          <Button className="rounded-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90" data-testid="button-download-report">
            <Download size={15} /> Download Report
          </Button>
          <Link href="/checkin">
            <Button variant="outline" className="rounded-full gap-2" data-testid="button-new-session">
              <RefreshCw size={15} /> New Assessment
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="ghost" className="rounded-full" data-testid="button-view-dashboard">
              View Dashboard
            </Button>
          </Link>
        </motion.div>
      </div>
    </PageTransition>
  );
}
