"""
MindEase AI - FastAPI Backend Entry Point
Initializes the app, registers routes, and configures middleware.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from utils.logger import setup_logging
from services.emotion_service import load_model
from routes.mood import router as mood_router
from routes.health import router as health_router
from routes.questionnaire import router as questionnaire_router
from routes.context_response import router as context_response_router

# Load environment variables from .env file before anything else
load_dotenv()

# Configure logging
setup_logging()


# ---------------------------------------------------------------------------
# Lifespan: runs startup / shutdown logic around the app lifecycle.
# The emotion model is loaded here so it is ready before the first request.
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    load_model()
    yield
    # --- Shutdown (add cleanup here if needed) ---


app = FastAPI(
    title="MindEase AI API",
    description="Backend API for MindEase AI - Mental Wellness Platform",
    version="1.0.0",
    lifespan=lifespan,
)

# ---------------------------------------------------------------------------
# CORS Middleware
# Allows the React frontend (running on a different port) to call this API.
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten this in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Route Registration
# ---------------------------------------------------------------------------
app.include_router(health_router, tags=["Health"])
app.include_router(mood_router, prefix="/analyze-mood", tags=["Mood Analysis"])
app.include_router(questionnaire_router, prefix="/generate-questions", tags=["Questionnaire"])
app.include_router(context_response_router, prefix="/generate-response", tags=["Context Response"])
