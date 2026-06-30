# MANAS — AI-Assisted Emotional Wellness Platform

> *A safe space for your mental wellness and growth.*

MANAS is a full-stack emotional wellness platform with three distinct portals — Individual Users, Doctors/Therapists, and Organizations/NGOs — powered by AI emotional assessment, Supabase data persistence, and an immersive adaptive UI.

---

## 🌐 Live Demo

| Service | URL |
|---|---|
| Frontend (Vercel) | Deploy via Vercel — see [Deployment](#deployment) |
| Backend (Render) | Deploy via Render — see [Deployment](#deployment) |

---

## ✨ Features

### 👤 Individual User Portal
- Mood-adaptive UI (Happy / Neutral / Sad) with video backgrounds
- AI-powered emotional assessment (PHQ-9 / GAD-7 inspired questions for sad mood)
- Happy flow: **Acknowledge → Savor → Anchor → Reward**
- Neutral flow: **Validate → Check-in → Nudge → Insight**
- Sad flow: Structured clinical-inspired questionnaire → nuanced AI analysis
- Gemini-powered final wellness report (6 outcome levels, not just "elevated distress")
- Mood-matched ambient music (Web Audio API)
- Personal wellness dashboard with 7-day trend charts (real Supabase data)
- PDF report download
- Expert recommendations (Hyderabad-based therapists)

### 🩺 Doctor / Therapist Portal
- Register with full name + specialization
- Add and manage patients (saved to Supabase `patients` table)
- **Start Assessment** → redirects to full emotional assessment linked to that patient
- Session timeline: Session 1, Session 2, Session 3... with AI analysis per session
- Trend chart: wellness score + stress level across sessions
- Session notes (saved to Supabase)
- Patient report PDF download
- Auto-refresh when returning from assessment

### 🏢 Organization / NGO Portal
- Create workshops with name, description, date
- **QR Code generation** for each workshop
- Participants scan QR → complete full emotional assessment → data saved anonymously
- Real-time analytics dashboard (no fake data):
  - Total check-ins
  - Emotional distribution (Happy / Neutral / Stressed %)
  - Average wellness score
  - 6-week trend charts
  - Workshop engagement metrics
- PDF impact report download
- Auto-refreshes every 30 seconds

---

## 🧱 Tech Stack

### Frontend
| Layer | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS v4 |
| Routing | Wouter |
| Animations | Framer Motion |
| UI Components | Radix UI + shadcn/ui |
| Charts | Recharts |
| QR Codes | qrcode.react |
| Database | Supabase (JS client) |
| Icons | Lucide React |

### Backend
| Layer | Technology |
|---|---|
| Framework | FastAPI (Python) |
| AI | Google Gemini API |
| Emotion Analysis | Rule-based fallback (no heavy ML download) |
| Deployment | Render |

---

## 📁 Project Structure

```
Mental_health/
├── artifacts/mindease-ai/          # Frontend (React + Vite)
│   ├── src/
│   │   ├── pages/                  # Landing, Login, CheckIn, Dashboard, Doctor, OrgPortal, etc.
│   │   ├── components/             # MoodBackground, AssessmentResultCard, WellnessQuestionnaire, etc.
│   │   ├── services/               # supabaseService, emotionApi, assessmentAnalysisApi, etc.
│   │   ├── contexts/               # AuthContext, MoodContext, PatientSessionContext
│   │   ├── lib/                    # supabase.ts, database.types.ts
│   │   └── utils/                  # downloadReport.ts
│   ├── public/                     # happy.mp4, neutral.mp4, sad.mp4, landingpage.jpg
│   ├── vercel.json                 # Vercel deployment config
│   └── supabase_schema.sql         # Run this in Supabase SQL Editor
├── backend/                        # FastAPI backend
│   ├── app.py                      # Main FastAPI app
│   ├── routes/                     # mood, questionnaire, context_response, workshops, assessment_analysis
│   ├── services/                   # emotion_service, gemini_service, context_response_service
│   ├── requirements.txt
│   └── render.yaml                 # Render deployment config
└── README.md
```

---

## 🚀 Local Development

### Prerequisites
- Node.js 18+ and pnpm
- Python 3.11+

### Frontend Setup
```bash
cd artifacts/mindease-ai

# Install dependencies
pnpm install

# Copy env file
copy .env.example .env
# Fill in your Supabase URL and anon key in .env

# Start dev server
npx vite --config vite.local.config.ts
# Open: http://localhost:5173
```

### Backend Setup
```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Copy env file
copy .env.example .env
# Add your GEMINI_API_KEY to .env (optional — fallback works without it)

# Start server
uvicorn app:app --reload --host 127.0.0.1 --port 8000
# API docs: http://127.0.0.1:8000/docs
```

---

## 🗄️ Database Setup (Supabase)

1. Go to [supabase.com](https://supabase.com) and create a project
2. Open **SQL Editor** and run the contents of `artifacts/mindease-ai/supabase_schema.sql`
3. This creates all required tables with RLS policies:

| Table | Purpose |
|---|---|
| `emotional_checkins` | All user emotional assessments |
| `workshops` | Workshop/event records |
| `workshop_participants` | Anonymous participant mood data |
| `patients` | Doctor-managed patient profiles |
| `patient_sessions` | Session-by-session assessment history per patient |
| `doctors` | Doctor profile (name, specialization) |

4. Copy your **Project URL** and **anon key** from Supabase Settings → API
5. Add to `artifacts/mindease-ai/.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
```

---

## 🌍 Deployment

### Frontend → Vercel
1. Go to [vercel.com](https://vercel.com) → Import `Vanusshka/Mental_health`
2. Set **Root Directory**: `artifacts/mindease-ai`
3. Set **Build Command**: `npx vite build --config vite.local.config.ts`
4. Set **Output Directory**: `dist/public`
5. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=https://zykzsfqeamnowjwyukbr.supabase.co
   VITE_SUPABASE_ANON_KEY=your_key
   VITE_BACKEND_URL=https://your-render-backend.onrender.com
   VITE_GEMINI_API_KEY=your_gemini_key (optional)
   ```
6. Deploy ✅

### Backend → Render
1. Go to [render.com](https://render.com) → New Web Service → Connect repo
2. Set **Root Directory**: `backend`
3. Set **Runtime**: Python 3
4. Set **Build Command**: `pip install -r requirements.txt`
5. Set **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
6. Add Environment Variables:
   ```
   GEMINI_API_KEY=your_gemini_key
   SUPABASE_URL=https://zykzsfqeamnowjwyukbr.supabase.co
   SUPABASE_KEY=your_key
   ```
7. Copy the Render URL → add as `VITE_BACKEND_URL` in Vercel ✅

---

## 🔑 Environment Variables

### Frontend (`artifacts/mindease-ai/.env`)
| Variable | Required | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | ✅ | Supabase anon/publishable key |
| `VITE_BACKEND_URL` | ✅ | FastAPI backend URL |
| `VITE_GEMINI_API_KEY` | Optional | Enables AI-powered questions |

### Backend (`backend/.env`)
| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Optional | Google Gemini API key |
| `SUPABASE_URL` | Optional | For workshop routes |
| `SUPABASE_KEY` | Optional | For workshop routes |

---

## 🔄 User Flows

### Individual User
```
Landing → Login → Mood Selection → Assessment Flow → Wellness Report → Dashboard
```

### Doctor
```
Login (Doctor) → Add Patient → Start Assessment → Patient completes flow → Return to Doctor Portal → View Session Timeline
```

### Organization
```
Login (Org) → Create Workshop → Generate QR → Share QR → Participants scan → Complete assessment → View live analytics
```

---

## 🎨 Emotional UI Themes

| Mood | Background | Music | Colors |
|---|---|---|---|
| 😊 Happy | `happy.mp4` (10s loop) | Uplifting ambient | Golden/Orange |
| 😐 Neutral | `neutral.mp4` (10s loop) | Focus ambient | Teal/Cyan |
| 😔 Sad | `sad.mp4` (10s loop) | Soothing calm | Violet/Indigo |

---

## 📋 Assessment Logic

### Sad Mood — PHQ-9 / GAD-7 Inspired
7 clinically-inspired questions covering:
- Interest/pleasure in activities
- Feeling down or hopeless
- Sleep issues
- Fatigue/energy
- Anxiety/nervousness
- Uncontrollable worry
- Daily functional impact

**Outcome levels** (NOT just "elevated distress"):
- `positive` · `reflective` · `mild` · `recovering` · `moderate` · `elevated`

### Happy Mood
**Acknowledge → Savor → Anchor → Reward**

### Neutral Mood
**Validate → Check-in → Nudge → Insight**

---

## 📄 License

MIT — Built for educational and wellness support purposes.

> ⚠️ MANAS is an AI-assisted wellness tool, not a clinical diagnostic system. For serious mental health concerns, please consult a qualified professional.
