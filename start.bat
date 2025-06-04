@echo off
:waitForNode
where node >nul 2>&1
if errorlevel 1 (
  echo Waiting for Node.js to be available...
  timeout /t 3 >nul
  goto waitForNode
)

REM Change to your Node.js project directory
cd /d "C:\Users\Admin\Desktop\sweldomo-automation"

REM Start the app
echo Running automation...
call npm start
