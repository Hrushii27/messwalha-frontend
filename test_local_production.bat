@echo off
setlocal
echo 🧪 MessWalha Local Production Test (DOUBLE-FIX MODE)
echo ===================================================

:: Step 1: Clean build
echo 📦 1. Generating production build...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Build failed. 
    echo Please check if you have any open "npm run dev" terminals and close them.
    echo.
    pause
    exit /b %errorlevel%
)
cd ..

:: Step 2: Try standard preview
echo.
echo 🚀 2. Starting Preview Server on http://127.0.0.1:4173
echo.
echo 💡 ACTION: Keep this window open and try opening http://127.0.0.1:4173
echo.
cd frontend
call npx vite preview --port 4173 --host 127.0.0.1

if %errorlevel% neq 0 (
    echo.
    echo ⚠️ Standard preview failed. Trying alternative (npx serve)...
    echo.
    call npx serve dist -l 4173
)

pause
