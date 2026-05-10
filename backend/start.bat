@echo off
echo Starting MindEase AI Backend...
echo.
echo API Docs will be available at: http://127.0.0.1:8000/docs
echo Health check:                  http://127.0.0.1:8000/health
echo Mood analysis endpoint:        http://127.0.0.1:8000/analyze-mood
echo.
uvicorn app:app --reload --host 127.0.0.1 --port 8000
