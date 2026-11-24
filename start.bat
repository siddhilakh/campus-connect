@echo off
echo =======================================================
echo  Launching CampusConnect Full-Stack Application
echo  Backend:  http://localhost:5000
echo  Frontend: http://localhost:5173
echo =======================================================
echo.

echo Starting Backend Server in a new window...
start "CampusConnect Server (Port 5000)" cmd /k "cd server && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Vite Client in a new window...
start "CampusConnect Client (Port 5173)" cmd /k "cd client && npm run dev"

echo.
echo Applications launched! Open your browser to http://localhost:5173
