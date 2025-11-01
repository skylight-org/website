@echo off
setlocal EnableDelayedExpansion

echo [INFO] Sky Light - Starting development servers...
echo.

REM Check for Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed. Please install Node.js 18 or higher.
    exit /b 1
)

echo [OK] Node.js detected
node -v

REM Check for npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] npm is not installed. Please install npm.
    exit /b 1
)

echo [OK] npm detected
npm -v

REM Check if dependencies are installed
set NEEDS_INSTALL=0

if not exist "node_modules\" (
    echo [WARN] Root dependencies not found
    set NEEDS_INSTALL=1
)

if not exist "packages\shared-types\node_modules\" (
    echo [WARN] Shared types dependencies not found
    set NEEDS_INSTALL=1
)

if not exist "apps\backend\node_modules\" (
    echo [WARN] Backend dependencies not found
    set NEEDS_INSTALL=1
)

if not exist "apps\frontend\node_modules\" (
    echo [WARN] Frontend dependencies not found
    set NEEDS_INSTALL=1
)

REM Install dependencies if needed
if !NEEDS_INSTALL! EQU 1 (
    echo [INFO] Installing dependencies...
    call npm install
    if !ERRORLEVEL! NEQ 0 (
        echo [ERROR] Failed to install dependencies
        exit /b 1
    )
    echo [OK] Dependencies installed successfully
) else (
    echo [OK] All dependencies are installed
)

echo.
echo [INFO] Starting backend and frontend servers...
echo [INFO] Backend: http://localhost:3000
echo [INFO] Frontend: http://localhost:5173
echo.
echo [WARN] Press Ctrl+C to stop all servers
echo.

REM Run both servers concurrently
npm run dev

