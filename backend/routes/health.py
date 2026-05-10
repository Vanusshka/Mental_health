"""
Health Check Route
------------------
GET /health  →  confirms the API is running.
"""

from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Simple liveness probe used by load balancers / monitoring tools."""
    return {
        "status": "ok",
        "service": "MindEase AI API",
        "timestamp": datetime.utcnow().isoformat() + "Z",
    }
