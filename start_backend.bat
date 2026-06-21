@echo off
echo =============================================
echo   HireSense AI - Starting Backend (Flask)
echo =============================================
cd /d "%~dp0backend"
echo Starting Flask API on http://localhost:5000 ...
python app.py
pause
