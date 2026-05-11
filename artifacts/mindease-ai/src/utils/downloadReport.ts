/**
 * PDF Report Generator — uses browser print API (no extra deps)
 * Generates a styled HTML report and triggers print-to-PDF.
 */

export interface UserReportData {
  name: string;
  date: string;
  mood: string;
  wellnessScore: number;
  stressScore: number;
  emotionalBalance: number;
  burnoutRisk: number;
  sleepWellness: number;
  resilience: number;
  socialConnectivity: number;
  dominantEmotion: string;
  reflection?: string;
  insights: string[];
}

export interface PatientReportData {
  patientName: string;
  condition: string;
  sessions: number;
  avgWellness: number;
  trend: string;
  latestMood: string;
  stressLevel: number;
  burnoutRisk: number;
  notes: string;
  doctorName: string;
  date: string;
  sessionHistory: { session: string; score: number; stress: number }[];
}

export interface OrgReportData {
  orgName: string;
  date: string;
  totalCheckins: number;
  happyPct: number;
  neutralPct: number;
  stressedPct: number;
  avgWellness: number;
  avgStress: number;
  workshopsCount: number;
  insights: string;
}

function printHTML(html: string, title: string) {
  const win = window.open("", "_blank", "width=800,height=900");
  if (!win) { alert("Please allow popups to download the report."); return; }
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 500);
}

const BASE_STYLE = `
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 2rem; color: #1a1a2e; background: #fff; }
  h1 { font-size: 1.8rem; font-weight: 800; margin-bottom: 0.25rem; }
  h2 { font-size: 1.1rem; font-weight: 700; margin: 1.5rem 0 0.75rem; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.4rem; }
  .badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: 700; margin-right: 6px; }
  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin: 1rem 0; }
  .card { background: #f8fafc; border-radius: 12px; padding: 1rem; border: 1px solid #e5e7eb; text-align: center; }
  .card .val { font-size: 1.6rem; font-weight: 800; }
  .card .lbl { font-size: 0.72rem; color: #6b7280; margin-top: 4px; }
  .note { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 0.75rem 1rem; font-size: 0.82rem; color: #166534; margin-top: 1rem; }
  .disclaimer { font-size: 0.72rem; color: #9ca3af; margin-top: 2rem; border-top: 1px solid #e5e7eb; padding-top: 1rem; }
  @media print { body { padding: 1rem; } button { display: none; } }
`;

export function downloadUserReport(data: UserReportData) {
  const moodColor = data.mood === "happy" ? "#10b981" : data.mood === "sad" ? "#6366f1" : "#0ea5e9";
  const html = `<!DOCTYPE html><html><head><title>MANAS — Wellness Report</title><style>${BASE_STYLE}</style></head><body>
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#8b5cf6,#06b6d4);display:flex;align-items:center;justify-content:center;">
        <span style="color:white;font-size:1.4rem;">🧠</span>
      </div>
      <div>
        <h1 style="margin:0;background:linear-gradient(135deg,#8b5cf6,#06b6d4);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">MANAS</h1>
        <p style="margin:0;font-size:0.82rem;color:#6b7280;">Personal Emotional Wellness Report</p>
      </div>
    </div>
    <p style="color:#6b7280;font-size:0.85rem;">Generated for: <strong>${data.name}</strong> &nbsp;|&nbsp; ${data.date}</p>
    <h2>Emotional State Summary</h2>
    <p>Mood: <span class="badge" style="background:${moodColor}20;color:${moodColor};">${data.mood.toUpperCase()}</span>
       Dominant Emotion: <span class="badge" style="background:#f3f4f6;color:#374151;">${data.dominantEmotion}</span></p>
    <div class="grid">
      <div class="card"><div class="val" style="color:${moodColor}">${data.wellnessScore}/100</div><div class="lbl">Wellness Score</div></div>
      <div class="card"><div class="val" style="color:${data.stressScore > 60 ? '#f87171' : '#10b981'}">${data.stressScore}%</div><div class="lbl">Stress Level</div></div>
      <div class="card"><div class="val" style="color:#0ea5e9">${data.emotionalBalance}%</div><div class="lbl">Emotional Balance</div></div>
      <div class="card"><div class="val" style="color:${data.burnoutRisk > 60 ? '#f87171' : '#10b981'}">${data.burnoutRisk}%</div><div class="lbl">Burnout Risk</div></div>
      <div class="card"><div class="val" style="color:#8b5cf6">${data.sleepWellness}%</div><div class="lbl">Sleep Wellness</div></div>
      <div class="card"><div class="val" style="color:#10b981">${data.socialConnectivity}%</div><div class="lbl">Social Connectivity</div></div>
    </div>
    ${data.reflection ? `<h2>Your Reflection</h2><p style="background:#f8fafc;border-radius:10px;padding:1rem;font-size:0.88rem;line-height:1.7;">${data.reflection}</p>` : ""}
    <h2>Personalised Wellness Insights</h2>
    <ul style="padding-left:1.2rem;">${data.insights.map(i => `<li style="margin-bottom:0.5rem;font-size:0.88rem;line-height:1.6;">${i}</li>`).join("")}</ul>
    <div class="note">✅ This report is for personal wellness reflection only. It is not a clinical diagnosis.</div>
    <div class="disclaimer">MANAS · AI-assisted emotional wellness infrastructure · Not a medical diagnosis tool · ${data.date}</div>
  </body></html>`;
  printHTML(html, "MANAS Wellness Report");
}

export function downloadPatientReport(data: PatientReportData) {
  const tColor = data.trend === "improving" ? "#10b981" : data.trend === "declining" ? "#f87171" : data.trend === "critical" ? "#ef4444" : "#06b6d4";
  const historyRows = data.sessionHistory.map((s, i) =>
    `<tr style="background:${i%2===0?'#f8fafc':'white'}">
      <td style="padding:6px 10px;font-size:0.82rem;">${s.session}</td>
      <td style="padding:6px 10px;font-size:0.82rem;font-weight:700;color:${s.score>=65?'#10b981':s.score>=45?'#fb923c':'#f87171'}">${s.score}/100</td>
      <td style="padding:6px 10px;font-size:0.82rem;color:${s.stress>65?'#f87171':'#374151'}">${s.stress}%</td>
    </tr>`).join("");
  const html = `<!DOCTYPE html><html><head><title>Patient Report — ${data.patientName}</title><style>${BASE_STYLE}
    table{width:100%;border-collapse:collapse;margin:0.75rem 0;}th{background:#f1f5f9;padding:8px 10px;font-size:0.8rem;text-align:left;}
  </style></head><body>
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#0ea5e9,#06b6d4);display:flex;align-items:center;justify-content:center;">
        <span style="color:white;font-size:1.4rem;">🩺</span>
      </div>
      <div>
        <h1 style="margin:0;color:#0f172a;">Patient Wellness Report</h1>
        <p style="margin:0;font-size:0.82rem;color:#6b7280;">MANAS · Doctor Portal</p>
      </div>
    </div>
    <p style="color:#6b7280;font-size:0.85rem;">Doctor: <strong>${data.doctorName}</strong> &nbsp;|&nbsp; Date: ${data.date}</p>
    <h2>Patient Overview</h2>
    <p><strong>Name:</strong> ${data.patientName} &nbsp;|&nbsp; <strong>Condition:</strong> ${data.condition} &nbsp;|&nbsp; <strong>Sessions:</strong> ${data.sessions}</p>
    <div class="grid">
      <div class="card"><div class="val" style="color:#0ea5e9">${data.avgWellness}/100</div><div class="lbl">Avg Wellness</div></div>
      <div class="card"><div class="val" style="color:${tColor}">${data.trend}</div><div class="lbl">Trend</div></div>
      <div class="card"><div class="val" style="color:${data.stressLevel>65?'#f87171':'#10b981'}">${data.stressLevel}%</div><div class="lbl">Stress Level</div></div>
    </div>
    <h2>Session History</h2>
    <table><thead><tr><th>Session</th><th>Wellness Score</th><th>Stress Level</th></tr></thead><tbody>${historyRows}</tbody></table>
    <h2>Doctor Notes</h2>
    <p style="background:#f8fafc;border-radius:10px;padding:1rem;font-size:0.88rem;line-height:1.7;">${data.notes || "No notes recorded."}</p>
    <div class="note">⚕️ This report is generated from emotional wellness assessments. Not a clinical psychiatric diagnosis.</div>
    <div class="disclaimer">MANAS · Doctor Portal · ${data.date}</div>
  </body></html>`;
  printHTML(html, `Patient Report — ${data.patientName}`);
}

export function downloadOrgReport(data: OrgReportData) {
  const html = `<!DOCTYPE html><html><head><title>Organization Wellness Report</title><style>${BASE_STYLE}</style></head><body>
    <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;">
      <div style="width:48px;height:48px;border-radius:14px;background:linear-gradient(135deg,#10b981,#059669);display:flex;align-items:center;justify-content:center;">
        <span style="color:white;font-size:1.4rem;">🏢</span>
      </div>
      <div>
        <h1 style="margin:0;color:#0f172a;">Community Wellness Report</h1>
        <p style="margin:0;font-size:0.82rem;color:#6b7280;">MANAS · Organization Portal</p>
      </div>
    </div>
    <p style="color:#6b7280;font-size:0.85rem;">Organization: <strong>${data.orgName}</strong> &nbsp;|&nbsp; ${data.date}</p>
    <h2>Emotional Distribution</h2>
    <div class="grid">
      <div class="card"><div class="val" style="color:#10b981">${data.happyPct}%</div><div class="lbl">Positive</div></div>
      <div class="card"><div class="val" style="color:#06b6d4">${data.neutralPct}%</div><div class="lbl">Neutral</div></div>
      <div class="card"><div class="val" style="color:#f87171">${data.stressedPct}%</div><div class="lbl">High Stress</div></div>
      <div class="card"><div class="val" style="color:#8b5cf6">${data.totalCheckins}</div><div class="lbl">Total Check-ins</div></div>
      <div class="card"><div class="val" style="color:#0ea5e9">${data.avgWellness}/100</div><div class="lbl">Avg Wellness</div></div>
      <div class="card"><div class="val" style="color:${data.avgStress>6?'#f87171':'#10b981'}">${data.avgStress}/10</div><div class="lbl">Avg Stress</div></div>
    </div>
    <h2>AI Impact Summary</h2>
    <p style="background:#f0fdf4;border-radius:10px;padding:1rem;font-size:0.88rem;line-height:1.7;border:1px solid #bbf7d0;">${data.insights}</p>
    <div class="note">🔒 All data is anonymized. No individual personal information is included in this report.</div>
    <div class="disclaimer">MANAS · Organization Portal · Anonymized Community Data · ${data.date}</div>
  </body></html>`;
  printHTML(html, "Organization Wellness Report");
}
