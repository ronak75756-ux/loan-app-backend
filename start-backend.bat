@echo off
echo ========================================
echo   Loan Manager - Backend Server
echo ========================================
echo.
echo Starting Spring Boot backend with Maven...
echo Backend will be available at: http://localhost:8080
echo.
echo NOTE: First run will download dependencies (one-time setup)
echo This may take 2-3 minutes...
echo.

cd /d "%~dp0backend"
mvnw.cmd spring-boot:run

pause
