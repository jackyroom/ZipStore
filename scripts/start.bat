@echo off
chcp 936 >nul 2>&1
title JackyRoom Controller
cd /d %~dp0\..

echo Checking Environment...

if not exist "server.js" (
    echo Building Core...
    node tools\setup_core.js
)

if exist "tools\install_features.js" (
    echo Installing Features...
    node tools\install_features.js
)

if not exist "node_modules" (
    echo Installing Dependencies...
    call npm install
)

echo.
echo Starting Server...
echo Please open: http://localhost:3000
echo.

node server.js
pause
