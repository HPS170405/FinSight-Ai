@echo off
cd /d "C:\Users\Hardik\.gemini\antigravity\scratch\finsight-ai\ml_service"
call .venv\Scripts\activate.bat
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
