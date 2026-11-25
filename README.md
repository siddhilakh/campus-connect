# CampusConnect — Centralized Student Opportunity and Career Enhancement Platform

<div align="center">

![CampusConnect Banner](https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=80)

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma_ORM-5.22-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_Cloud-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://neon.tech/)

**Centralized campus placement intelligence, senior-junior interview rounds sharing, and training & placement cell moderation portal.**


</div>

---

## 🎯 Executive Overview & Problem Statement

Placement information at most universities is scattered across unstructured WhatsApp groups, informal hearsay, and outdated spreadsheets. Juniors often prepare blind without verified insights into visiting companies, eligibility cutoffs, compensation brackets, or specific round-by-round interview patterns.

**CampusConnect** solves this by establishing a unified institutional platform providing:
1. **Verified Placement Intelligence:** Official batch statistics (placed students count, average CTC, highest package in LPA, recruiting companies) with interactive Recharts data visualizations.
2. **Visiting Company Directory:** Complete database of recruiters (Microsoft, Amazon, TCS, Infosys, Accenture, Cisco) with tier categorizations, allowed branches, CGPA cutoffs, and package brackets.
3. **Senior Connect & Interview Breakdown:** Searchable interview stories with 5-faceted filters (company, batch, role, difficulty, interview type), verified badges, helpful voting, bookmarking, and dedicated round-by-round detail pages (`/senior-connect/experiences/:id`).
4. **Ask a Senior & 1-on-1 Mentorship:** Interactive **Ask a Senior** Q&A hub plus a full Senior Mentorship workflow where students send requests and seniors accept or decline with response notes.
5. **Administrative Controls & Moderation:** Training & Placement Cell controls to verify placement offers, manage recruiters, and review/moderate student-submitted interview experiences.
6. **Placement Readiness Tracker:** Track progress across Aptitude, DSA, Core CS, Communication, and Resume Preparation with an overall readiness score.
7. **Placement Application Tracker:** Manage personal campus applications through Interested, Applied, Assessment, Interview, Selected, and Rejected with drag-and-drop Kanban, Table view, summary KPI cards, slide-over detail drawer, and upcoming interview reminders.
8. **Practice Zone:** Interactive quizzes across Aptitude, Technical MCQ, SQL, and DSA with difficulty levels, instant explanations, and accuracy scoring.
9. **Placement Analytics:** Multi-chart analytics (package distribution, batch trends, company-wise selections, and role-wise statistics) computed from database records.
10. **Multi-Tenant Foundation:** College-aware database isolation so additional institutions can be onboarded seamlessly.

---

## ⚡ Predefined Demo Accounts

The application features an **in-app One-Click Demo Helper** on the login screen for instant evaluation:

| Role | Email | Password | Persona & Focus | Default Route |
|---|---|---|---|---|
| **Student / Junior** | `student@test.com` | `student123` | Aarav Sharma (3rd Year B.Tech CSE) | `/student-dashboard` |
| **Senior / Alumni** | `senior@test.com` | `senior123` | Priya Mehta (Microsoft Azure SDE-1, ₹44 LPA) | `/senior-dashboard` |
| **Placement Admin** | `admin@test.com` | `admin123` | Dr. Rajesh Verma (Training & Placement Cell) | `/admin/manage-placements` |
| **System Admin** | `superadmin@test.com` | `superadmin123` | Institutional IT & ERP Administrator | `/admin/system` |

*All passwords are encrypted in the database with `bcryptjs` (10 salt rounds) and secured using JWT authentication.*

---

## 🏗️ Architecture & Technology Stack

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                           │
│  React 18 + Vite + TypeScript + Tailwind CSS + Recharts     │
└──────────────────────────────┬──────────────────────────────┘
                               │ JSON REST API (JWT Bearer)
┌──────────────────────────────▼──────────────────────────────┐
│                      Backend Layer                          │
│  Express.js + TypeScript + Node.js (RBAC Middleware)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Prisma ORM Client
┌──────────────────────────────▼──────────────────────────────┐
│                      Database Layer                         │
│  PostgreSQL (Neon Cloud) / SQLite (Zero-Config Local Dev)    │
└─────────────────────────────────────────────────────────────┘
```

- **Frontend:**
  - **Framework:** React 18 with Vite for ultra-fast HMR and bundle optimization
  - **Language:** TypeScript for compile-time type safety across all components and API responses
  - **Styling:** Tailwind CSS with a custom deep navy, slate, and vibrant indigo SaaS palette
  - **Charts:** Recharts (Interactive AreaChart, BarChart, and PieChart visualizations)
  - **Animations:** Framer Motion for smooth transitions, tab indicators, and micro-interactions
  - **Icons:** Lucide React
  - **Routing:** React Router DOM v6 with role-based route guards (`<ProtectedRoute />`)
- **Backend:**
  - **Runtime:** Node.js v20+ with Express.js and TypeScript
  - **Authentication:** JSON Web Tokens (JWT) with 7-day expiration
  - **Hashing:** `bcryptjs` for secure password encryption
  - **Validation:** Type-safe request payload handling
- **Database & ORM:**
  - **Prisma ORM:** 20 relational models covering colleges, users, senior profiles, companies, placements, rounds, questions, answers, bookmarks, helpful votes, readiness progress, applications, practice questions & attempts, mentorship requests, resources, notifications, moderation, and audit logs.
  - **Dual Database Ready:** Zero-config local SQLite (`file:./dev.db`) for immediate offline evaluation, plus production PostgreSQL schema (`schema.postgres.prisma`) ready for Neon.tech.

---

## 📁 Repository Directory Structure

```
CampusConnect/
├── client/                          # React + TypeScript Frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts            # Centralized API client with JWT interception
│   │   ├── components/
│   │   │   ├── ConfirmationModal.tsx # Safety confirm dialogs for deletes
│   │   │   ├── DemoAccountHelper.tsx # 1-Click demo account selector
│   │   │   ├── Navbar.tsx           # Global top navigation & notifications bell
│   │   │   ├── NotificationModal.tsx # In-app notification tray with mark-as-read
│   │   │   └── Sidebar.tsx          # Responsive navigation sidebar with active states
│   │   ├── context/
│   │   │   └── AuthContext.tsx      # Global auth context & role redirect logic
│   │   ├── pages/
│   │   │   ├── AnalyticsPage.tsx          # Package, trend, company & role charts
│   │   │   ├── ApplicationTrackerPage.tsx # Drag-and-drop Kanban & Table tracker
│   │   │   ├── CompaniesPage.tsx          # Filterable company directory & criteria modals
│   │   │   ├── ExperienceDetailPage.tsx   # Dedicated full-round interview breakdown page
│   │   │   ├── HelpFaqPage.tsx            # Searchable Help Center & FAQ
│   │   │   ├── Login.tsx                  # Split-screen SaaS login page
│   │   │   ├── PlacementAdminDashboard.tsx # Offer verification & moderation queue
│   │   │   ├── PracticeZonePage.tsx       # Aptitude, Tech MCQ, SQL & DSA quizzes
│   │   │   ├── ProfilePage.tsx            # Profile settings & saved bookmarks
│   │   │   ├── ReadinessPage.tsx          # 5-pillar placement readiness tracker
│   │   │   ├── ResourcesPage.tsx          # Curated DSA, System Design, and Core CS sheets
│   │   │   ├── SeniorConnectPage.tsx      # Experiences, Mentors & Ask a Senior hub
│   │   │   ├── SeniorDashboard.tsx        # Senior profile, mentorship & Q&A inbox
│   │   │   ├── StudentDashboard.tsx       # KPI summary, charts, reminders & offers
│   │   │   └── SystemAdminDashboard.tsx   # User RBAC modifier & college settings
│   │   ├── types/
│   │   │   └── index.ts             # TypeScript interfaces for all data models
│   │   ├── App.tsx                  # Application routes & guards
│   │   └── main.tsx                 # React DOM mount point
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── server/                          # Express + TypeScript Backend
│   ├── prisma/
│   │   ├── schema.prisma            # Prisma schema (SQLite local dev / PostgreSQL prod)
│   │   ├── schema.postgres.prisma   # PostgreSQL schema for cloud deployment
│   │   └── seed.ts                  # Comprehensive demo seed data
│   ├── src/
│   │   ├── lib/
│   │   │   └── prisma.ts            # Prisma client singleton
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts   # JWT verification & RBAC permission guards
│   │   ├── routes/
│   │   │   ├── admin.routes.ts        # User management, moderation, college settings
│   │   │   ├── applications.routes.ts # Placement application tracker CRUD
│   │   │   ├── auth.routes.ts         # Login, session verification, profile update
│   │   │   ├── companies.routes.ts    # Recruiter CRUD and criteria endpoints
│   │   │   ├── experiences.routes.ts  # Experience CRUD, filters, helpful & bookmarks
│   │   │   ├── mentorship.routes.ts   # Senior mentorship request & response endpoints
│   │   │   ├── notifications.routes.ts # In-app notification management
│   │   │   ├── placements.routes.ts   # Placement stats, analytics & verified records
│   │   │   ├── practice.routes.ts     # Practice Zone questions & attempt scoring
│   │   │   ├── questions.routes.ts    # Student-senior Q&A discussion threads
│   │   │   ├── readiness.routes.ts    # Placement readiness progress endpoints
│   │   │   ├── resources.routes.ts    # Preparation roadmaps and cheat sheets
│   │   │   └── seniors.routes.ts      # Senior directory & mentorship profiles
│   │   ├── test/
│   │   │   └── smoke.test.ts          # 27-point automated integration test suite
│   │   └── index.ts                 # Express application entry point
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   └── .env
├── deployment-guide.md              # Cloud deployment manual (Vercel + Render + Neon)
├── project-documentation.md         # SRS technical requirements traceability
├── vercel.json                      # Vercel deployment configuration
├── render.yaml                      # Render deployment configuration
├── setup.bat                        # Windows 1-click install & database seed script
├── start.bat                        # Windows 1-click launch script
└── README.md                        # Documentation
```

---

## 🚀 Quick Start Guide (Run Locally)

### Prerequisites
- [Node.js](https://nodejs.org/) v18.0 or higher
- Windows, macOS, or Linux

### Method 1: Automated 1-Click Launch (Windows)
1. Double-click `setup.bat` to automatically install all dependencies and seed the database.
2. Double-click `start.bat` to launch both backend and frontend servers in separate terminal windows.
3. Open [http://localhost:5173/](http://localhost:5173/) in your web browser.

---

### Method 2: Manual Terminal Setup

#### Step 1: Initialize the Backend Server
```bash
cd server

# Install backend dependencies
npm install

# Initialize database schema & seed realistic demo data
npm run db:setup

# Start backend server in development mode
npm run dev
```
> The API server will be active at: `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)

#### Step 2: Initialize the Frontend Client
Open a new terminal window:
```bash
cd client

# Install frontend dependencies
npm install

# Launch Vite development server
npm run dev
```
> Open your browser and navigate to: **`http://localhost:5173/`**

---

## 🧪 Automated Test Suite Verification

CampusConnect includes an automated integration test suite (`server/src/test/smoke.test.ts`) covering all 27 core system invariants:

```bash
cd server
npx ts-node-dev src/test/smoke.test.ts
```

**Results:**
```text
=======================================================
 Running CampusConnect Automated Verification Suite
=======================================================
[PASS] College record initialized for Medi-Caps University
[PASS] User student@test.com exists in database
[PASS] User student@test.com has role STUDENT
[PASS] Password for student@test.com hashes & verifies successfully with bcrypt
[PASS] User senior@test.com exists in database
[PASS] User senior@test.com has role SENIOR
[PASS] Password for senior@test.com hashes & verifies successfully with bcrypt
[PASS] User admin@test.com exists in database
[PASS] User admin@test.com has role PLACEMENT_ADMIN
[PASS] Password for admin@test.com hashes & verifies successfully with bcrypt
[PASS] User superadmin@test.com exists in database
[PASS] User superadmin@test.com has role SYSTEM_ADMIN
[PASS] Password for superadmin@test.com hashes & verifies successfully with bcrypt
[PASS] JWT auth token issues and verifies payload
[PASS] Placement statistics record present with highest package ₹44 LPA
[PASS] Visiting companies seeded (found: 6)
[PASS] Verified placement records exist (found: 8)
[PASS] Interview experiences found (found: 2)
[PASS] Microsoft experience has all 4 detailed interview rounds
[PASS] Student-senior Q&A questions present (found: 2)
[PASS] Senior reply present on student discussion thread
[PASS] Curated preparation resources available (found: 14)
[PASS] In-app notifications seeded across demo accounts (found: 8)
[PASS] Placement Readiness Progress seeded for student
[PASS] Placement applications seeded across pipeline stages (found: 5)
[PASS] Practice Zone questions seeded across 4 categories (found: 12)
[PASS] Senior mentorship requests seeded (found: 2)
=======================================================
 Verification Completed: 27/27 Tests Passed!
=======================================================
```

---

## 🌐 Production Cloud Deployment

Detailed step-by-step instructions are documented in [`deployment-guide.md`](./deployment-guide.md):

1. **Database:** Deploy PostgreSQL in 60 seconds on [Neon.tech](https://neon.tech) and copy your connection string.
2. **Backend:** Deploy `server/` to [Render.com](https://render.com) Web Service with environment variable `DATABASE_URL`.
3. **Frontend:** Deploy `client/` to [Vercel](https://vercel.com) with environment variable `VITE_API_URL=https://your-render-app.onrender.com/api`.

---

## 📄 License

MIT License. Developed for CampusConnect.
