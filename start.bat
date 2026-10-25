@echo off
title JS.DEPTH - JavaScript & React Mastery Platform
echo ========================================================
echo  Starting JS.DEPTH Mastery Platform with Local Qwen 2.5
echo ========================================================

:: Check if Ollama is running, if not start it
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [✓] Ollama service is already running.
) else (
    echo [!] Starting Ollama service...
    start "" "C:\Users\sk527\AppData\Local\Programs\Ollama\ollama.exe" serve
    timeout /t 3 /nobreak >nul
)

:: Start the Express Server
echo [✓] Starting Web Platform at http://localhost:3000
start http://localhost:3000
npm start
pause
