@echo off
echo ========================================
echo   Loan Manager - Frontend Server
echo ========================================
echo.

echo Starting React frontend...
echo Frontend will be available at: http://localhost:3000
echo.

cd /d "%~dp0frontend"
npm start

pause
