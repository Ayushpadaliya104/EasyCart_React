@echo off
REM EasyCart Quick Start Script for Windows

echo.
echo ==========================================
echo    EasyCart - Quick Start Setup
echo ==========================================
echo.

REM Check if Node.js is installed
echo [1/5] Checking Node.js installation...
node -v >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed!
    echo Please download from: https://nodejs.org/
    pause
    exit /b 1
)
echo ✅ Node.js found: 
node -v

REM Check if npm is installed
echo.
echo [2/5] Checking npm installation...
npm -v >nul 2>&1
if errorlevel 1 (
    echo ❌ npm is not installed!
    pause
    exit /b 1
)
echo ✅ npm found:
npm -v

REM Install dependencies
echo.
echo [3/5] Installing dependencies...
echo This may take a few minutes...
call npm install
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installed successfully

REM Create .env file if it doesn't exist
echo.
echo [4/5] Checking environment configuration...
if not exist ".env" (
    echo Creating .env file...
    copy .env.example .env >nul
    echo ✅ .env file created
) else (
    echo ✅ .env file already exists
)

REM Start development server
echo.
echo [5/5] Starting development server...
echo.
echo ==========================================
echo    ✅ Setup Complete!
echo ==========================================
echo.
echo Application will open at: http://localhost:3000
echo Press Ctrl+C to stop the server
echo.
echo Demo Credentials:
echo   Email: demo@example.com
echo   Password: password123
echo.
echo ==========================================
echo.

call npm start
