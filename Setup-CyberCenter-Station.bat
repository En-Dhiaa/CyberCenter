@echo off
chcp 65001 > nul
title CyberCenter Station Client Setup Wizard
cls
echo ========================================================================
echo   ⚡ CYBERCENTER - GAMING STATION ONBOARDING & SETUP WIZARD ⚡
echo ========================================================================
echo.
echo يرجى تشغيل هذا الملف كمسؤول (Run as Administrator) في جهاز اللاعب/العميل.
echo.
set /p ServerUrl="أدخل عنوان السيرفر (افتراضي: http://localhost:5000): "
if "%ServerUrl%"=="" set ServerUrl=http://localhost:5000

set /p StationNumber="أدخل رقم المحطة (مثال: 1): "
if "%StationNumber%"=="" set StationNumber=1

echo.
echo [INFO] تثبيت وربط المحطة رقم %StationNumber% مع السيرفر: %ServerUrl%...
powershell -ExecutionPolicy Bypass -File "deployment\client\Install-CyberCenterStation.ps1" -ServerUrl "%ServerUrl%" -StationNumber %StationNumber%

echo.
echo ========================================================================
echo   ✔ تم تثبيت وربط المحطة بنجاح!
echo ========================================================================
pause
