# MindEase AI Backend Startup Script
Write-Host "Starting MindEase AI Backend..." -ForegroundColor Cyan
Write-Host ""
Write-Host "API Docs:        http://127.0.0.1:8000/docs" -ForegroundColor Green
Write-Host "Health check:    http://127.0.0.1:8000/health" -ForegroundColor Green
Write-Host "Mood analysis:   http://127.0.0.1:8000/analyze-mood" -ForegroundColor Green
Write-Host ""
uvicorn app:app --reload --host 127.0.0.1 --port 8000
