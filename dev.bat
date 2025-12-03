@echo off
chcp 936 >nul 2>&1
title JackyRoom Dev Mode
cd /d %~dp0

echo ========================================
echo   JackyRoom Development Mode
echo   Auto restart on file changes
echo ========================================
echo.

if not exist "node_modules\nodemon" (
    echo [Install] Installing nodemon...
    call npm install nodemon --save-dev
)

echo.
echo [Start] Starting server with nodemon...
echo [Tip] Server will auto-restart when files change
echo [Tip] Press Ctrl+C to stop server
echo.
echo Visit: http://localhost:3000
echo.

call npm run dev

pause
