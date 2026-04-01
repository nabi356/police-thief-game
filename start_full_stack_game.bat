@echo off
echo ===================================================
echo     STARTING POLICE & THIEF FULL-STACK GAME
echo ===================================================
echo.

:: Safely navigate to the game directory relative to this script
cd /d "%~dp0police_thief_game"

echo [1/2] Installing necessary server dependencies...
call npm install express cors socket.io --no-audit

echo [2/2] Starting Node.js Backend Server...
:: Using cmd /k to keep the window open if node crashes, so you can see errors!
start "Police & Thief Backend" cmd /k "node server.js"

echo.
echo Launching the Arcade Game UI in your default browser...
start http://localhost:3001

echo ===================================================
echo   Server is running on port 3001 in a new window.
echo   You can close this script window now, but keep 
echo   the Node backend window open while playing!
echo ===================================================
pause
