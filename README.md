# Employee Attendance Management System

A full-stack, production-ready Employee Attendance Management System built with **Next.js 14**, **Tailwind CSS**, **CockroachDB** (Prisma ORM), **Resend** email OTP, and **SheetJS** Excel exports.

---

## 🚀 Free Deployment Stack

| Service | Free Tier | Credit Card Required? |
|---|---|---|
| **Vercel** | Hobby plan (unlimited deploys) | ❌ No |
| **CockroachDB** | Serverless Basic (10 GiB) | ❌ No |
| **Resend** | 3,000 emails/month | ❌ No |

---

## 📋 Prerequisites

- Node.js 18+
- npm 9+
- Git

---

## 🛠 Step-by-Step Deployment Guide

### Step 1: Set Up CockroachDB (Free, No Credit Card)

1. Go to [cockroachlabs.com](https://cockroachlabs.com) and click **Get Started Free**
2. Sign up using your GitHub or Google account (no credit card needed)
3. Create a new **Serverless** cluster, select your nearest region
4. Once created, click **Connect** → **Connection String**
5. Copy the connection string — it looks like:
   ```
   postgresql://user:password@free-tier.gcp-us-east1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full
   ```
6. Save this as your `DATABASE_URL`

### Step 2: Set Up Resend (Free Email, No Credit Card)

1. Go to [resend.com](https://resend.com) and create a free account
2. Navigate to **API Keys** → **Create API Key**
3. Copy the key (starts with `re_...`)
4. Save this as your `RESEND_API_KEY`
5. (Optional but recommended) Verify a custom domain for production use. For testing, Resend provides a default sending domain.

### Step 3: Clone & Configure Locally

```bash
git clone <your-repo-url>
cd klaw_attendance
npm install
```

Create your `.env.local` file:

```bash
cp .env.example .env.local
```

Fill in your `.env.local`:

```env
# CockroachDB connection string
DATABASE_URL="postgresql://user:password@host:26257/defaultdb?sslmode=verify-full"

# A random 32+ character secret for JWT signing
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET="your-super-secret-jwt-key-here-minimum-32-chars"

# Resend API key from resend.com
RESEND_API_KEY="re_your_resend_api_key_here"

# Comma-separated list of authorized admin email addresses
ADMIN_EMAILS="admin@yourdomain.com,another@yourdomain.com"

# From email address for OTP emails (must be verified in Resend)
RESEND_FROM_EMAIL="Attendance System <noreply@yourdomain.com>"

# Your deployment URL (update after Vercel deployment)
NEXTAUTH_URL="http://localhost:3000"
```

### Step 4: Initialize Database

```bash
# Push schema to CockroachDB
npx prisma db push

# (Optional) Open Prisma Studio to view your data
npx prisma studio
```

### Step 5: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## ☁️ Deploy to Vercel (Free)

### Option A: Vercel CLI

```bash
npm install -g vercel
vercel
```

### Option B: GitHub Integration (Recommended)

1. Push your code to a GitHub repository
2. Go to [vercel.com](https://vercel.com) and click **Add New Project**
3. Import your GitHub repository
4. Vercel auto-detects Next.js — no configuration needed

### Setting Environment Variables on Vercel

1. In your Vercel project dashboard, go to **Settings** → **Environment Variables**
2. Add each variable from your `.env.local`:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `RESEND_API_KEY`
   - `ADMIN_EMAILS`
   - `RESEND_FROM_EMAIL`
   - `NEXTAUTH_URL` (set to your Vercel deployment URL: `https://your-project.vercel.app`)
3. Click **Save** and redeploy

### After Deployment

Run database migrations:
```bash
# From your local machine with DATABASE_URL set
npx prisma db push
```

---

## 🔐 Security Notes

- **JWT Secret**: Must be at least 32 random characters. Generate with:
  ```bash
  node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
  ```
- **Admin OTP**: Each login generates a new unique OTP, valid for 10 minutes, single-use only
- **No hardcoded credentials** anywhere in the codebase
- All passwords are bcrypt-hashed with cost factor 12

---

## 📁 Project Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Global styles
│   ├── (auth)/
│   │   ├── login/              # Employee login
│   │   ├── register/           # Employee registration
│   │   └── admin/              # Admin OTP login
│   ├── employee/
│   │   └── dashboard/          # Employee dashboard
│   ├── admin/
│   │   └── dashboard/          # Admin dashboard
│   └── api/
│       ├── auth/               # Auth endpoints
│       ├── attendance/         # Attendance endpoints
│       ├── employees/          # Employee CRUD
│       └── export/             # Excel export
├── components/
│   ├── ui/                     # Reusable UI primitives
│   ├── admin/                  # Admin components
│   └── employee/               # Employee components
└── lib/
    ├── prisma.ts               # Prisma client
    ├── auth.ts                 # JWT helpers
    ├── email.ts                # Resend utilities
    └── export.ts               # SheetJS utilities
```

---

## 🎯 Features

### Employee Portal
- Secure registration with employee details
- Daily check-in with timestamp
- Personal attendance history
- Monthly attendance percentage

### Admin Panel
- Dynamic OTP-based login (no static passwords)
- Real-time attendance dashboard
- Interactive charts (day-wise, city-wise, team-wise, agency-wise)
- Searchable/filterable employee table
- Excel exports (daily, weekly, monthly)

---

## 📊 Excel Export Formats

| Report | Content |
|---|---|
| **Day-wise** | All attendance records for a selected date |
| **Weekly** | 7-day attendance summary per employee |
| **Monthly** | Full month attendance with present/absent/half-day counts |

---

## 🐛 Troubleshooting

**`Error: SSL SYSCALL error`** — Ensure your CockroachDB connection string includes `?sslmode=verify-full`

**`Error: OTP email not sent`** — Verify your Resend API key and that your FROM email is verified in Resend dashboard

**`Prisma Client not generated`** — Run `npx prisma generate` after any schema changes

**`JWT_SECRET missing`** — Ensure all environment variables are set in both `.env.local` and Vercel dashboard
