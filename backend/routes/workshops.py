"""
Workshop / Events Route
POST /workshops/create   - create a workshop, returns event_id + QR data
GET  /workshops/{id}     - get workshop details
POST /workshops/{id}/checkin - user submits mood for a workshop
GET  /workshops/{id}/analytics - get aggregated anonymous analytics
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import uuid

router = APIRouter()

# In-memory store (replace with DB in production)
_workshops = {}
_checkins = {}

class CreateWorkshopRequest(BaseModel):
    org_name: str
    title: str
    description: Optional[str] = ""
    date: Optional[str] = ""

class CheckinRequest(BaseModel):
    mood: str          # happy / neutral / sad
    stress_level: int  # 1-10
    anonymous_id: Optional[str] = None

@router.post("/create")
async def create_workshop(payload: CreateWorkshopRequest):
    event_id = str(uuid.uuid4())[:8].upper()
    _workshops[event_id] = {
        "event_id": event_id,
        "org_name": payload.org_name,
        "title": payload.title,
        "description": payload.description,
        "date": payload.date or datetime.utcnow().strftime("%Y-%m-%d"),
        "created_at": datetime.utcnow().isoformat(),
        "checkin_count": 0,
    }
    _checkins[event_id] = []
    qr_url = f"http://localhost:5173/workshop/{event_id}"
    return {
        "event_id": event_id,
        "title": payload.title,
        "qr_url": qr_url,
        "checkin_url": qr_url,
        "message": "Workshop created successfully"
    }

@router.get("/{event_id}")
async def get_workshop(event_id: str):
    w = _workshops.get(event_id.upper())
    if not w:
        raise HTTPException(status_code=404, detail="Workshop not found")
    return w

@router.post("/{event_id}/checkin")
async def workshop_checkin(event_id: str, payload: CheckinRequest):
    eid = event_id.upper()
    if eid not in _workshops:
        raise HTTPException(status_code=404, detail="Workshop not found")
    _checkins[eid].append({
        "mood": payload.mood,
        "stress_level": payload.stress_level,
        "timestamp": datetime.utcnow().isoformat(),
    })
    _workshops[eid]["checkin_count"] = len(_checkins[eid])
    return {"message": "Check-in recorded", "event_id": eid}

@router.get("/{event_id}/analytics")
async def get_analytics(event_id: str):
    eid = event_id.upper()
    if eid not in _workshops:
        raise HTTPException(status_code=404, detail="Workshop not found")
    checkins = _checkins[eid]
    total = len(checkins)
    if total == 0:
        return {"event_id": eid, "total_checkins": 0, "distribution": {}, "avg_stress": 0}
    mood_counts = {"happy": 0, "neutral": 0, "sad": 0}
    stress_total = 0
    for c in checkins:
        mood_counts[c["mood"]] = mood_counts.get(c["mood"], 0) + 1
        stress_total += c.get("stress_level", 5)
    distribution = {k: round(v / total * 100, 1) for k, v in mood_counts.items()}
    return {
        "event_id": eid,
        "workshop": _workshops[eid],
        "total_checkins": total,
        "distribution": distribution,
        "avg_stress": round(stress_total / total, 1),
        "stressed_percent": round(mood_counts.get("sad", 0) / total * 100, 1),
    }

@router.get("/")
async def list_workshops():
    return list(_workshops.values())
