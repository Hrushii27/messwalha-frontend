@echo off
echo Starting cleaned deployment to Heroku...
git add .
git commit -m "Deployment fix: force push to resolve ref conflict" --allow-empty
echo Pushing to Heroku...
git push heroku HEAD:master --force
echo Deployment finished with exit code %errorlevel%
