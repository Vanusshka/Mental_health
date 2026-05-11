"""
Workshop Routes — backed by Supabase
POST /workshops/create
GET  /workshops/{id}
POST /workshops/{id}/checkin
GET  /workshops/{id}/analytics
GET  /workshops/
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
import os, uuid

router = APIRouter()

# Try to use Supabase; fall back to in-memory for demo
try:
    from supabase import create_client
    SUPABASE_URL = os.getenv("SUPABASE_URL", "https://zykzsfqeamnowjwyukbr.supabase.co")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")
    _sb = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_KEY else None
except Exception:
    _sb = None

# In-memory fallback
_workshops: dict = {}
_participants: dict = {}

class CreateWorkshopRequest(BaseModel):
    org_name: Optional[str] = "MindEase Org"
    title: Optional[str] = None
    workshop_name: Optional[str] = None
    description: Optional[str] = ""
    date: Optional[str] = ""

class CheckinRequest(BaseModel):
    mood: str
    stress_level: int = 5

@router.post("/create")
async def create_workshop(payload: CreateWorkshopRequest):
    name = payload.workshop_name or payload.title or "Untitled Workshop"
    if _sb:
        try:
            res = _sb.table("workshops").insert({
                "workshop_name": name,
                "description": payload.description,
                "organization_name": payload.org_name,
                "date": payload.date or datetime.utcnow().strftime("%Y-%m-%d"),
            }).execute()
            w = res.data[0]
            qr_url = f"http://localhost:5173/workshop/{w['id']}"
            return {"event_id": w["id"], "title": name, "qr_url": qr_url, "checkin_url": qr_url, "message": "Created in Supabase"}
        except Exception as e:
            pass  # fall through to in-memory

    event_id = str(uuid.uuid4())[:8].upper()
    _workshops[event_id] = {"event_id": event_id, "workshop_name": name, "org_name": payload.org_name, "date": payload.date, "created_at": datetime.utcnow().isoformat(), "checkin_count": 0}
    _participants[event_id] = []
    qr_url = f"http://localhost:5173/workshop/{event_id}"
    return {"event_id": event_id, "title": name, "qr_url": qr_url, "checkin_url": qr_url, "message": "Created in memory (Supabase not configured)"}

@router.get("/{event_id}")
async def get_workshop(event_id: str):
    if _sb:
        try:
            res = _sb.table("workshops").select("*").eq("id", event_id).single().execute()
            return res.data
        except Exception:
            pass
    w = _workshops.get(event_id.upper())
    if not w: raise HTTPException(status_code=404, detail="Workshop not found")
    return w

@router.post("/{event_id}/checkin")
async def workshop_checkin(event_id: str, payload: CheckinRequest):
    if _sb:
        try:
            _sb.table("workshop_participants").insert({"workshop_id": event_id, "participant_mood": payload.mood, "stress_score": payload.stress_level}).execute()
            return {"message": "Check-in recorded in Supabase", "event_id": event_id}
        except Exception as e:
            pass
    eid = event_id.upper()
    if eid not in _workshops: raise HTTPException(status_code=404, detail="Workshop not found")
    _participants[eid].append({"mood": payload.mood, "stress_level": payload.stress_level, "timestamp": datetime.utcnow().isoformat()})
    _workshops[eid]["checkin_count"] = len(_participants[eid])
    return {"message": "Check-in recorded (in memory)", "event_id": eid}

@router.get("/{event_id}/analytics")
async def get_analytics(event_id: str):
    if _sb:
        try:
            res = _sb.table("workshop_participants").select("participant_mood,stress_score").eq("workshop_id", event_id).execute()
            checkins = res.data or []
            total = len(checkins)
            if total == 0:
                return {"event_id": event_id, "total_checkins": 0, "distribution": {}, "avg_stress": 0, "stressed_percent": 0}
            mood_counts = {"happy": 0, "neutral": 0, "sad": 0}
            stress_total = 0
            for c in checkins:
                mood_counts[c["participant_mood"]] = mood_counts.get(c["participant_mood"], 0) + 1
                stress_total += c.get("stress_score", 5)
            return {"event_id": event_id, "total_checkins": total, "distribution": {k: round(v/total*100,1) for k,v in mood_counts.items()}, "avg_stress": round(stress_total/total,1), "stressed_percent": round(mood_counts.get("sad",0)/total*100,1)}
        except Exception:
            pass
    eid = event_id.upper()
    checkins = _participants.get(eid, [])
    total = len(checkins)
    if total == 0: return {"event_id": eid, "total_checkins": 0, "distribution": {}, "avg_stress": 0, "stressed_percent": 0}
    mood_counts = {"happy": 0, "neutral": 0, "sad": 0}
    stress_total = 0
    for c in checkins:
        mood_counts[c["mood"]] = mood_counts.get(c["mood"], 0) + 1
        stress_total += c.get("stress_level", 5)
    return {"event_id": eid, "total_checkins": total, "distribution": {k: round(v/total*100,1) for k,v in mood_counts.items()}, "avg_stress": round(stress_total/total,1), "stressed_percent": round(mood_counts.get("sad",0)/total*100,1)}

@router.get("/")
async def list_workshops():
    if _sb:
        try:
            res = _sb.table("workshops").select("*").order("created_at", desc=True).execute()
            return res.data or []
        except Exception:
            pass
    return list(_workshops.values())
