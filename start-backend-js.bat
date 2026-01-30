@echo off
echo ========================================
echo   Loan Manager - JavaScript Backend
echo ========================================
echo.
echo Starting Node.js backend server...
echo Backend will be available at: http://localhost:8080
echo.

cd /d "%~dp0backend-js"
npm start

pause
