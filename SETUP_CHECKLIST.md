# ✅ Ayvlo Setup Checklist

Print this out or keep it open while setting up!

---

## 📋 Pre-Setup (Know Before You Start)

- [ ] You have **20-30 minutes** available
- [ ] You have an **internet connection**
- [ ] You have **terminal/command line** access
- [ ] You're comfortable running commands

**Difficulty**: ⭐⭐⭐ (3/5) - Moderate

---

## 🎯 Quick Setup Path

```
┌─────────────────────────────────────────────────────┐
│  START: Open Terminal                               │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  ✅ Step 1: Check Prerequisites                     │
│     • Node.js v18+                                  │
│     • pnpm                                          │
│     • PostgreSQL (or use Neon)                      │
│                                                     │
│  ⏱️ Time: 5 minutes                                 │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  ✅ Step 2: Install Dependencies                    │
│     • pnpm install                                  │
│                                                     │
│  ⏱️ Time: 3 minutes                                 │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  ✅ Step 3: Set Up Database                         │
│     • createdb ayvlo                                │
│     OR use Neon (recommended)                       │
│                                                     │
│  ⏱️ Time: 5 minutes                                 │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  ✅ Step 4: Set Up Redis                            │
│     • Sign up at upstash.com                        │
│     • Create database                               │
│     • Copy credentials                              │
│                                                     │
│  ⏱️ Time: 3 minutes                                 │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  ✅ Step 5: Configure .env.local                    │
│     • cp .env.example .env.local                    │
│     • Add DATABASE_URL                              │
│     • Add NEXTAUTH_SECRET                           │
│     • Add UPSTASH_* credentials                     │
│                                                     │
│  ⏱️ Time: 5 minutes                                 │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  ✅ Step 6: Initialize Database                     │
│     • pnpm prisma generate                          │
│     • pnpm db:push                                  │
│                                                     │
│  ⏱️ Time: 2 minutes                                 │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  ✅ Step 7: Seed Demo Data                          │
│     • pnpm db:seed                                  │
│                                                     │
│  ⏱️ Time: 1 minute                                  │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  ✅ Step 8: Start Server                            │
│     • pnpm dev                                      │
│     • Open http://localhost:3000                    │
│                                                     │
│  ⏱️ Time: 30 seconds                                │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  ✅ Step 9: Test Everything                         │
│     • Visit homepage                                │
│     • Test API with curl                            │
│     • View dashboard                                │
│                                                     │
│  ⏱️ Time: 5 minutes                                 │
└───────────────┬─────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────────────┐
│  🎉 SUCCESS!                                        │
│  Your SaaS is running!                              │
└─────────────────────────────────────────────────────┘
```

**Total Time: ~25 minutes**

---

## 📝 Detailed Checklist

### ✅ Step 1: Prerequisites

- [ ] Node.js v18 or higher installed
  ```bash
  node --version
  ```
  Expected: `v18.0.0` or higher

- [ ] pnpm installed
  ```bash
  pnpm --version
  ```
  Install if needed: `npm install -g pnpm`

- [ ] PostgreSQL installed OR Neon account ready
  ```bash
  psql --version
  ```
  OR sign up: https://neon.tech

---

### ✅ Step 2: Install Dependencies

- [ ] Navigate to project folder
  ```bash
  cd /path/to/ayvlo
  ```

- [ ] Install packages
  ```bash
  pnpm install
  ```
  Expected: `Done in X.Xs` with ~500 packages

---

### ✅ Step 3: Database Setup

**Choose ONE:**

**Option A: Local PostgreSQL** (If you have it installed)
- [ ] Create database
  ```bash
  createdb ayvlo
  ```
- [ ] Test connection
  ```bash
  psql ayvlo
  ```
- [ ] Your DATABASE_URL will be:
  ```
  postgresql://localhost:5432/ayvlo
  ```

**Option B: Neon (Recommended for beginners)** ⭐
- [ ] Sign up at https://neon.tech
- [ ] Create new project named "ayvlo"
- [ ] Copy connection string (looks like):
  ```
  postgresql://user:pass@ep-xxx.aws.neon.tech/ayvlo
  ```
- [ ] Keep this for next step!

---

### ✅ Step 4: Redis Setup

- [ ] Sign up at https://console.upstash.com
- [ ] Click "Create Database"
  - Name: `ayvlo-redis`
  - Type: Regional
  - Region: (choose closest)
- [ ] Copy **UPSTASH_REDIS_REST_URL**
- [ ] Copy **UPSTASH_REDIS_REST_TOKEN**
- [ ] Keep these for next step!

---

### ✅ Step 5: Environment Variables

- [ ] Copy example file
  ```bash
  cp .env.example .env.local
  ```

- [ ] Open `.env.local` in your editor
  ```bash
  code .env.local
  # OR: nano .env.local
  ```

- [ ] Add DATABASE_URL (from Step 3)
  ```env
  DATABASE_URL="postgresql://..."
  ```

- [ ] Generate NEXTAUTH_SECRET
  ```bash
  openssl rand -base64 32
  ```
  Copy output to:
  ```env
  NEXTAUTH_SECRET="paste-here"
  ```

- [ ] Add Upstash credentials (from Step 4)
  ```env
  UPSTASH_REDIS_REST_URL="https://..."
  UPSTASH_REDIS_REST_TOKEN="..."
  ```

- [ ] Set NEXTAUTH_URL
  ```env
  NEXTAUTH_URL="http://localhost:3000"
  ```

- [ ] Save the file (`Ctrl+S` or `Cmd+S`)

**Minimum required in .env.local:**
```env
DATABASE_URL="..."
NEXTAUTH_SECRET="..."
NEXTAUTH_URL="http://localhost:3000"
UPSTASH_REDIS_REST_URL="..."
UPSTASH_REDIS_REST_TOKEN="..."
```

---

### ✅ Step 6: Initialize Database

- [ ] Generate Prisma client
  ```bash
  pnpm prisma generate
  ```
  Expected: `✔ Generated Prisma Client`

- [ ] Push schema to database
  ```bash
  pnpm db:push
  ```
  Expected: `Your database is now in sync`

**If you see errors:**
- Check DATABASE_URL is correct
- For Neon, add `?sslmode=require` at end
- Make sure PostgreSQL is running (if local)

---

### ✅ Step 7: Seed Demo Data

- [ ] Run seed script
  ```bash
  pnpm db:seed
  ```
  Expected output:
  ```
  🌱 Seeding database...
  ✅ Created demo user: demo@ayvlo.com
  ✅ Created demo organization
  ✅ Created 2 sample anomalies
  🎉 Seeding completed successfully!
  ```

---

### ✅ Step 8: Start Development Server

- [ ] Start the server
  ```bash
  pnpm dev
  ```
  Expected:
  ```
  ▲ Next.js 14.1.0
  - Local:        http://localhost:3000
  ✓ Ready in 2.5s
  ```

- [ ] Keep this terminal open!

---

### ✅ Step 9: Test the Application

**Test 1: Homepage**
- [ ] Open browser to: http://localhost:3000
- [ ] See Ayvlo landing page with gold logo
- [ ] See "Autonomous Analytics that Never Sleep"
- [ ] See three feature cards

**Test 2: API**
- [ ] Open **new terminal** (keep server running)
- [ ] Run this command:
  ```bash
  curl -X POST http://localhost:3000/api/ayvlo/ingest \
    -H "Authorization: Bearer ayvlo_test_1234567890abcdef" \
    -H "Content-Type: application/json" \
    -d '[{"metric":"revenue","value":100,"timestamp":"2025-01-15T10:00:00Z"},{"metric":"revenue","value":1000,"timestamp":"2025-01-15T11:00:00Z"}]'
  ```
- [ ] See response with `"anomaliesDetected": 1`

**Test 3: Database**
- [ ] Open **new terminal**
- [ ] Run: `pnpm db:studio`
- [ ] Browser opens to http://localhost:5555
- [ ] See Prisma Studio with your data
- [ ] Click "Anomaly" → See your detected anomaly!

---

## 🎉 Success Criteria

You've successfully set up Ayvlo if:

- ✅ Server runs without errors
- ✅ Homepage loads at localhost:3000
- ✅ API accepts events and detects anomalies
- ✅ Database has demo data
- ✅ Prisma Studio shows your tables

---

## 🆘 Troubleshooting Quick Reference

| Problem | Solution |
|---------|----------|
| Port 3000 in use | `kill -9 $(lsof -t -i:3000)` |
| Can't connect to DB | Check DATABASE_URL, restart PostgreSQL |
| Prisma errors | `pnpm prisma generate --force` |
| Redis connection fails | Verify Upstash credentials, no spaces |
| Module not found | `rm -rf node_modules && pnpm install` |
| Page not loading | Check terminal for errors, clear browser cache |

---

## 🎯 What's Next?

After successful setup:

- [ ] Read `README.md` - Learn the architecture
- [ ] Explore the dashboard
- [ ] Customize branding (change "Ayvlo" to your name)
- [ ] Set up OAuth (Google/GitHub)
- [ ] Configure Stripe (for billing)
- [ ] Deploy to Vercel

---

## 📚 Documentation Reference

- **This file** - Setup checklist
- **STEP_BY_STEP_GUIDE.md** - Detailed walkthrough
- **README.md** - Architecture & features
- **SETUP.md** - Advanced configuration
- **QUICKSTART.md** - Quick reference

---

## ⏱️ Time Breakdown

| Step | Estimated Time | Actual Time |
|------|----------------|-------------|
| 1. Prerequisites | 5 min | _____ |
| 2. Install | 3 min | _____ |
| 3. Database | 5 min | _____ |
| 4. Redis | 3 min | _____ |
| 5. Environment | 5 min | _____ |
| 6. Prisma | 2 min | _____ |
| 7. Seed | 1 min | _____ |
| 8. Start | 0.5 min | _____ |
| 9. Test | 5 min | _____ |
| **TOTAL** | **~25 min** | **_____** |

---

**Good luck! You've got this! 🚀**

Remember: If something doesn't work, check the detailed guide in `STEP_BY_STEP_GUIDE.md`
