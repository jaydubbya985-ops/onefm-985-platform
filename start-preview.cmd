@echo off
cd /d "%~dp0"
set "ELECTRON_RUN_AS_NODE=1"
set "KIMI_EXE=C:\Users\jaydu\AppData\Local\Programs\kimi-desktop\Kimi.exe"
"%KIMI_EXE%" "%~dp0node_modules\vite\bin\vite.js" preview --host --port 4180 --strictPort
