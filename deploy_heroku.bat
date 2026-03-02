@echo off
echo Starting backend deployment to Heroku...
git add .
git commit -m "Implement Menus and Reviews functionality"
git push heroku main:master
echo Deployment finished with exit code %errorlevel%
