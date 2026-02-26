@echo off
setlocal
echo 🔥 MessWalha Google/Firebase Deployment 
echo =======================================

:: Step 1: Check Login
echo 🔑 Checking Firebase status...
call npx firebase login:list --non-interactive > nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: You are not logged in to Firebase.
    echo 💡 WHY "SITE NOT FOUND"? This happens when no files are uploaded yet.
    echo 🚀 ACTION REQUIRED:
    echo 1. Look at your other terminal window.
    echo 2. Type "n" and press Enter for the "Gemini" question.
    echo 3. Complete the login in your browser.
    echo 4. Run this script again!
    echo.
    pause
    exit /b %errorlevel%
)

:: Step 2: Backend Build
echo 📦 Building Backend (TSC)...
cd backend
call npm install
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Backend build failed.
    echo.
    pause
    exit /b %errorlevel%
)
cd ..

:: Step 3: Frontend Build
echo 📦 Building Frontend (Vite)...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Frontend build failed.
    echo Please check the error messages above.
    echo.
    pause
    exit /b %errorlevel%
)
cd ..

:: Step 4: Deployment
echo 🚀 Uploading files to Google (messwala-f09a5)...
call npx firebase deploy --only hosting,functions --project messwala-f09a5

if %errorlevel% neq 0 (
    echo.
    echo ❌ ERROR: Deployment failed.
    echo.
    echo 💡 TROUBLESHOOTING:
    echo 1. Ensure you have "Started" Hosting in the Firebase Console:
    echo    https://console.firebase.google.com/project/messwala-f09a5/hosting
    echo 2. Try running this command manually: npx firebase deploy --only hosting
    echo.
    pause
    exit /b %errorlevel%
)

echo.
echo ✅ SUCCESS! Your website is live! 🎉
echo 🔗 URL: https://messwala-f09a5.web.app
echo.
pause
