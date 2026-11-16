@echo off
cd /d "%~dp0"
echo ====================================================
echo    AI Smart Trip Planner Master - Starting Server
echo ====================================================
echo.
echo Initializing database and starting local web server...
echo Serving at: http://localhost:5000
echo.

where node >nul 2>nul
if %errorlevel% equ 0 (
    echo Starting with Node.js engine...
    start http://localhost:5000
    node server.js
    goto done
)

echo Node.js not detected in PATH. Opening standalone browser mode...
start open_app.html

:done
pause
