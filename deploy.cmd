@echo off
setlocal
set "NODE_DIR=%LOCALAPPDATA%\node-portable\node-v24.16.0-win-x64"
if exist "%NODE_DIR%\node.exe" set "PATH=%NODE_DIR%;%PATH%"
cd /d "%~dp0"
echo Building ONE FM app...
call npm.cmd run build
if errorlevel 1 (
  echo Build failed.
  exit /b 1
)
echo Deploying to Netlify...
call npx.cmd netlify deploy --prod --dir=dist
exit /b %ERRORLEVEL%
