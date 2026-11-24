# CampusConnect — Cloud Deployment Guide

This guide walks you through deploying **CampusConnect** to production using **Vercel** (Frontend), **Render** (Backend), and **Neon PostgreSQL** (Cloud Database).

---

## 1. Database Deployment (Neon PostgreSQL)

1. Go to [Neon.tech](https://neon.tech) and sign up for a free account.
2. Click **Create Project**, name it `campusconnect-db`, and choose the region closest to you.
3. In the dashboard, copy the **PostgreSQL Connection String**. It will look like:
   ```env
   postgresql://campusconnect_owner:your_password@ep-cool-sample.us-east-2.aws.neon.tech/campusconnect?sslmode=require
   ```
4. In your local terminal or CI/CD pipeline, run Prisma push against the Neon database:
   ```bash
   cd server
   # Set DATABASE_URL to your Neon connection string
   npx prisma db push --schema=prisma/schema.postgres.prisma
   npx ts-node prisma/seed.ts
   ```

---

## 2. Backend Deployment (Render.com)

1. Sign up or log in to [Render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository containing `CampusConnect`.
4. Configure the Web Service settings:
   - **Name:** `campusconnect-api`
   - **Root Directory:** `server`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm run start`
   - **Plan:** Free
5. Add the following **Environment Variables** in Render:
   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `DATABASE_URL` | *(Your Neon PostgreSQL connection string)* |
   | `JWT_SECRET` | *(A secure 64-character random string)* |
   | `JWT_EXPIRES_IN` | `7d` |
   | `CLIENT_URL` | *(Your Vercel frontend URL, e.g., `https://campusconnect.vercel.app`)* |
6. Click **Deploy Web Service**.
7. Once deployed, note down your Render backend URL (e.g. `https://campusconnect-api.onrender.com`).

---

## 3. Frontend Deployment (Vercel)

1. Sign up or log in to [Vercel](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository.
4. Configure Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
5. Add the **Environment Variable**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://campusconnect-api.onrender.com/api` |
6. Click **Deploy**.
7. Once deployment finishes, copy your live Vercel URL and update `CLIENT_URL` in your Render backend settings to allow CORS requests.

---

## 4. Production Smoke Testing

1. Open your live Vercel URL.
2. Use the **One-Click Demo Helper** on the login screen to sign in as:
   - Student (`student@test.com`)
   - Senior (`senior@test.com`)
   - Placement Admin (`admin@test.com`)
   - System Admin (`superadmin@test.com`)
3. Verify that:
   - Placement statistics and charts render smoothly.
   - Company directory displays filters and detail modal.
   - Senior Connect displays multi-round interview breakdowns.
   - Questions can be asked by students and answered by seniors.
   - Bookmarks and in-app notifications persist in the database.
