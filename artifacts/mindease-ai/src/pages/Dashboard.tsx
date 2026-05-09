import { useRef } from "react";
import { Link } from "wouter";
import { motion, useInView } from "framer-motion";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, AreaChart, Area
} from "recharts";
import { Brain, Sparkles, TrendingUp, MessageCircle, Download, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

const metrics = [
  { label: "Stress Level", value: 68, color: "#a78bfa", icon: "⚡", description: "Elevated — consider a short break" },
  { label: "Anxiety", value: 52, color: "#67e8f9", icon: "🌊", description: "Moderate — breathing exercises help" },
  { label: "Burnout Risk", value: 41, color: "#86efac", icon: "🔋", description: "Low — you're managing well" },
  { label: "Emotional Stability", value: 78, color: "#fbbf24", icon: "⚖️", description: "Good — steady ground today" },
  { label: "Sleep Wellness", value: 63, color: "#f9a8d4", icon: "🌙", description: "Fair — aim for 7+ hours tonight" },
  { label: "Motivation", value: 71, color: "#6ee7b7", icon: "🚀", description: "Good — channel it into priorities" },
  { label: "Social Wellness", value: 85, color: "#c4b5fd", icon: "💬", description: "Strong — connection is thriving" },
];

const weeklyData = [
  { day: "Mon", stability: 58, anxiety: 65, stress: 72 },
  { day: "Tue", stability: 62, anxiety: 60, stress: 68 },
  { day: "Wed", stability: 55, anxiety: 70, stress: 75 },
  { day: "Thu", stability: 70, anxiety: 55, stress: 62 },
  { day: "Fri", stability: 74, anxiety: 50, stress: 64 },
  { day: "Sat", stability: 80, anxiety: 42, stress: 55 },
  { day: "Sun", stability: 78, anxiety: 52, stress: 68 },
];

const aiInsights = [
  { text: "Stress levels appear elevated due to recurring mentions of exhaustion and poor sleep consistency over the past 4 days.", icon: TrendingUp },
  { text: "Your emotional stability has improved significantly since Wednesday — social engagement appears to be a key factor in this lift.", icon: Sparkles },
  { text: "Sleep quality remains the most impactful lever for your wellbeing. Even 30 minutes of earlier sleep could shift multiple indicators.", icon: Brain },
];

const timeline = [
  { day: "Mon", mood: "Anxious", color: "bg-cyan-400" },
  { day: "Tue", mood: "Neutral", color: "bg-blue-400" },
  { day: "Wed", mood: "Low", color: "bg-indigo-400" },
  { day: "Thu", mood: "Neutral", color: "bg-teal-400" },
  { day: "Fri", mood: "Happy", color: "bg-yellow-400" },
  { day: "Sat", mood: "Happy", color: "bg-orange-400" },
  { day: "Sun", mood: "Neutral", color: "bg-blue-400" },
];

function MetricCard({ metric, delay }: { metric: typeof metrics[0]; delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const data = [{ name: metric.label, value: metric.value, fill: metric.color }];
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.6 }}
      className="p-5 rounded-2xl bg-card border border-border hover:shadow-lg hover:border-primary/20 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-2">
        <p className="text-xs font-medium text-muted-foreground">{metric.label}</p>
        <span className="text-lg">{metric.icon}</span>
      </div>
      <div className="h-20 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="100%"
            innerRadius="60%"
            outerRadius="100%"
            startAngle={180}
            endAngle={0}
            data={data}
          >
            <RadialBar dataKey="value" background={{ fill: "hsl(var(--muted))" }} />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-center -mt-2">
        <p className="text-2xl font-bold" style={{ color: metric.color }}>{metric.value}%</p>
      </div>
      <p className="text-xs text-muted-foreground text-center mt-1">{metric.description}</p>
    </motion.div>
  );
}

function WellnessScoreRing({ score }: { score: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div ref={ref} className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
        <motion.circle
          cx="60" cy="60" r="54"
          fill="none"
          stroke="url(#scoreGrad)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={isInView ? { strokeDashoffset: offset } : {}}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        />
        <defs>
          <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
        </defs>
      </svg>
      <div className="text-center">
        <motion.p
          className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
        >
          {score}
        </motion.p>
        <p className="text-xs text-muted-foreground">/ 100</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <PageTransition>
      <div className="container mx-auto max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 text-sm text-muted-foreground mb-2"
            >
              <Calendar size={14} />
              <span>May 9, 2026</span>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-4xl font-semibold tracking-tight"
            >
              Your Emotional Wellness Report
            </motion.h1>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col items-center"
          >
            <WellnessScoreRing score={74} />
            <p className="text-xs text-muted-foreground mt-1 font-medium">Wellness Score</p>
          </motion.div>
        </div>

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-10">
          {metrics.map((m, i) => (
            <MetricCard key={m.label} metric={m} delay={i * 0.07} />
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Weekly Trend Chart */}
          <div className="md:col-span-2 p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Weekly Emotional Trends
            </h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 12, fontSize: 12 }}
                />
                <Line type="monotone" dataKey="stability" stroke="#a78bfa" strokeWidth={2.5} dot={{ fill: "#a78bfa", r: 4 }} name="Stability" />
                <Line type="monotone" dataKey="anxiety" stroke="#67e8f9" strokeWidth={2.5} dot={{ fill: "#67e8f9", r: 4 }} name="Anxiety" />
                <Line type="monotone" dataKey="stress" stroke="#f9a8d4" strokeWidth={2.5} dot={{ fill: "#f9a8d4", r: 4 }} strokeDasharray="5 3" name="Stress" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Emotional Timeline */}
          <div className="p-6 rounded-2xl bg-card border border-border">
            <h2 className="text-base font-semibold mb-4">This Week's Mood</h2>
            <div className="space-y-3">
              {timeline.map((item, i) => (
                <motion.div
                  key={item.day}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center gap-3"
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${item.color} flex-shrink-0`} />
                  <div className="flex-1">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${item.color}`}
                        initial={{ width: 0 }}
                        animate={{ width: `${65 + Math.sin(i) * 25}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium">{item.day}</p>
                    <p className="text-xs text-muted-foreground">{item.mood}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Insights */}
        <div className="mb-8">
          <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
            <Sparkles size={16} className="text-primary" />
            AI-Generated Insights
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {aiInsights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
                className="glass-card rounded-2xl p-5"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                    <insight.icon size={16} />
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{insight.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 flex-wrap">
          <Button
            className="rounded-full gap-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90"
            data-testid="button-generate-report"
          >
            <Download size={15} /> Generate Report
          </Button>
          <Link href="/chat">
            <Button variant="outline" className="rounded-full gap-2" data-testid="button-talk-to-ai">
              <MessageCircle size={15} /> Talk to AI
            </Button>
          </Link>
          <Link href="/session-summary">
            <Button variant="ghost" className="rounded-full gap-2" data-testid="button-view-summary">
              View Session Summary
            </Button>
          </Link>
        </div>
      </div>
    </PageTransition>
  );
}
