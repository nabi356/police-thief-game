@echo off
echo ===================================================
echo     PUBLISHING POLICE & THIEF GAME TO THE INTERNET
echo ===================================================
echo.
cd /d "%~dp0police_thief_game"

echo [1/3] Ensuring backend dependencies are installed...
call npm install express cors socket.io localtunnel --no-audit

echo.
echo [2/3] Starting the Local Node.js Game Server...
start "Backend Server" cmd /k "node server.js"

echo.
echo [3/3] Generating your Public Tunnel Link...
echo ===================================================
echo   Copy the HTTPS link below and send it to your 
echo   friends to play instantly on any PC!
echo ===================================================
call npx localtunnel --port 3001

pause
