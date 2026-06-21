@echo off
echo =============================================
echo   HireSense AI - Starting Frontend (Vite)
echo =============================================
cd /d "%~dp0frontend"
echo Starting React app on http://localhost:3000 ...
npm run dev
pause
