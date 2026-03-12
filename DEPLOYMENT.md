# MessWalha Deployment Guide

This document outlines the workflow for updating both the Frontend and Backend of the MessWalha project.

## Project Structure (Monorepo)
The project is organized as a monorepo for easier management:
- **Root Layer**: Contains the Backend (Node.js/Express) which is deployed to Heroku.
- **`frontend/` Folder**: Contains the Frontend (React/Vite) which is deployed to Vercel.

---

## 1. Prerequisites
- **Heroku CLI** installed and logged in (`heroku login`).
- **Git** initialized and connected to remotes.
- **Vercel Project** connected to your GitHub repository.

---

## 2. Deployment Workflow

### Step 1: Commit your changes
Always commit your changes locally first:
```bash
git add .
git commit -m "Your descriptive message"
```

### Step 2: Update the Backend (Heroku)
Push the code to Heroku's remote. This will trigger a rebuild of the server.
```bash
git push heroku main
```
**Verification**: Check logs with `heroku logs --tail -a messwalha-api-pg-360404ae0804`.

### Step 3: Update the Frontend (Vercel)
Push the code to your GitHub `origin` remote. Vercel will automatically detect the push and redeploy.
```bash
git push origin main
```
**IMPORTANT**: In your **Vercel Project Settings**, ensure the **Root Directory** is set to `frontend`.

---

## 3. Environment Variables
Ensure the following variables are set in your hosting platforms:

### Vercel (Frontend)
- `VITE_API_URL`: `https://messwalha-api-pg-360404ae0804.herokuapp.com/api`

### Heroku (Backend)
- `DATABASE_URL`: (Auto-configured by Heroku Postgres)
- `JWT_SECRET`: Your secure secret for authentication.
- `PORT`: (Managed by Heroku)

---

## 4. Troubleshooting
- **Frontend not updating?** Check Vercel project settings to ensure it points to the `frontend/` subdirectory.
- **Backend errors?** Check `heroku logs` for detailed terminal output.
