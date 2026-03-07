@echo off
cd frontend
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%
call npx firebase deploy --only hosting --project messwala-f09a5 --non-interactive
