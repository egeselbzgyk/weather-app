@echo off
echo Starting Weather App in development mode...

REM Start PocketBase in a new window
echo Starting PocketBase...
start "PocketBase" cmd /c "cd pocketbase && pocketbase serve"

REM Wait for PocketBase to start
echo Waiting for PocketBase to start...
timeout /t 5 /nobreak

REM Start backend in a new window
echo Starting backend service...
start "Backend" cmd /c "cd backend && npm run dev"

REM Wait for backend to start
timeout /t 3 /nobreak

REM Start collector service in a new window
echo Starting collector service...
start "Collector Service" cmd /c "cd collector-service && npm run dev"

REM Wait for collector service to start
timeout /t 3 /nobreak

REM Start frontend
echo Starting frontend...
cd frontend
npm run dev 