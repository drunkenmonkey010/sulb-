@echo off
REM Frontend Quick Start Script for Windows

echo.
echo ============================================
echo  SULB Insights AI - Frontend Setup
echo ============================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed!
    echo Download from: https://nodejs.org/
    pause
    exit /b 1
)

echo Node version:
node --version
echo.

echo Installing dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Error: npm install failed
    pause
    exit /b 1
)

echo.
echo ============================================
echo  Starting development server...
echo ============================================
echo.
echo Open your browser to: http://localhost:5173
echo.
echo Make sure backend is running:
echo   python main.py (on another terminal)
echo.

call npm run dev
