@echo off
echo =======================================================
echo  CampusConnect - One-Click Environment Setup Script
echo  Medi-Caps University - B.Tech Project
echo =======================================================
echo.

echo [1/3] Setting up Backend Server...
cd server
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend npm install failed!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo [2/3] Initializing Database & Seeding Demo Accounts...
call npx prisma generate
call npx prisma db push
call npx ts-node-dev prisma/seed.ts
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Database setup or seeding failed!
    pause
    exit /b %ERRORLEVEL%
)

cd ..

echo.
echo [3/3] Setting up Frontend Client...
cd client
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend npm install failed!
    pause
    exit /b %ERRORLEVEL%
)

cd ..

echo.
echo =======================================================
echo  CampusConnect Setup Completed Successfully!
echo  Run start.bat to launch both servers.
echo =======================================================
pause
