# 🔥 Firebase Deployment Guide

Deploying MessWalha on Firebase is a great way to get fast, free hosting for your frontend. However, since the backend uses **PostgreSQL** and **Socket.io**, we need to combine Firebase with a compatible backend solution.

---

## 1. Frontend: Firebase Hosting (Free)
Firebase Hosting is perfect for your React/Vite frontend.

### Steps:
1.  **Install Firebase CLI**:
    ```bash
    npm install -g firebase-tools
    ```
2.  **Login & Use Project**:
    ```bash
    firebase login
    firebase use messwala-f09a5
    ```
3.  **Build & Deploy**:
    ```bash
    cd frontend
    npm run build
    firebase deploy --only hosting
    ```

---

## 2. Database: PostgreSQL (Supabase / Neon)
Firebase does not provide a PostgreSQL database. 

1.  Create a free account on [Supabase](https://supabase.com/) or [Neon](https://neon.tech/).
2.  Create a project and copy the **Connection String** (PostgreSQL URL).
3.  Update your `.env` with this new `DATABASE_URL`.

---

## 3. Backend: Cloud Run (Part of Firebase ecosystem)
Since you use **Socket.io**, standard Firebase Functions are not recommended. Use **Cloud Run** or **Render**.

### Option A: Render (Easiest)
1.  Connect your GitHub repo to [Render](https://render.com/).
2.  Select "Web Service".
3.  Add your environment variables (`DATABASE_URL`, `JWT_SECRET`, etc.).

### Option B: Cloud Run (Stay on Google Cloud)
1.  Enable the Cloud Run API in your Firebase project.
2.  Deploy using the Dockerfile I provided:
    ```bash
    gcloud run deploy messwalha-backend --source .
    ```

---

## 🛠️ Deployment Checklist
- [ ] Frontend URL pointed to your custom domain in Firebase console.
- [ ] Backend URL updated in `frontend/.env` (VITE_API_URL).
- [ ] Prisma migrations run against the production DB: `npx prisma db push`.
- [ ] Razorpay Live keys added to production environment variables.

> [!IMPORTANT]
> To use **Socket.io** on Firebase Hosting, you must ensure your Backend URL in `ChatPage.tsx` points to your live Backend server (Cloud Run or Render), not localhost.
