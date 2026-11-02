@echo off
chcp 65001 > nul
title CyberCenter Suite Master Launcher
cls
echo ========================================================================
echo   ⚡ CYBERCENTER - CENTRAL MANAGEMENT & FLEET CONTROL LAUNCHER ⚡
echo ========================================================================
echo.
echo [1/2] Starting Central Backend Server & Web Dashboard...
echo [2/2] Opening Browser at http://localhost:3000...
echo.

start "" "CyberCenter-Launcher.exe"

exit
