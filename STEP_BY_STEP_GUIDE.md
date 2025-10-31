# 🚀 Complete Setup Guide - Ayvlo SaaS

Follow this guide step-by-step on your local machine to get Ayvlo running.

---

## ✅ Step 1: Prerequisites (5 minutes)

### Check What You Have

Open your terminal and run these commands:

```bash
# Check Node.js (need v18 or higher)
node --version
# If not installed: Download from https://nodejs.org

# Check pnpm
pnpm --version
# If not installed: npm install -g pnpm

# Check PostgreSQL
psql --version
# If not installed, see below
```

### Install PostgreSQL (if needed)

**macOS:**
```bash
brew install postgresql@16
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

**OR Use Cloud Database (Easier!)**

Skip local PostgreSQL and use [Neon](https://neon.tech) (free tier):
1. Sign up at https://neon.tech
2. Create new project
3. Copy connection string (you'll use this later)

---

## 📦 Step 2: Install Project Dependencies (3 minutes)

```bash
# Navigate to the project directory
cd /path/to/ayvlo

# Install dependencies
pnpm install

# This will install ~500 packages - takes 2-3 minutes
# You should see: "Done in X.Xs"
```

---

## 🗄️ Step 3: Set Up Database (5 minutes)

### Option A: Local PostgreSQL

```bash
# Create database
createdb ayvlo

# OR if that doesn't work:
psql postgres
CREATE DATABASE ayvlo;
\q

# Test connection
psql ayvlo
# You should see: ayvlo=#
\q
```

### Option B: Cloud Database (Recommended for beginners)

1. **Go to https://neon.tech**
2. Click "Sign up" (free, no credit card)
3. Create new project called "ayvlo"
4. **Copy the connection string** - looks like:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/ayvlo
   ```
5. Keep this handy for the next step!

---

## ⚙️ Step 4: Set Up Redis (3 minutes)

We use Upstash Redis for rate limiting (required).

### Create Upstash Account

1. **Go to https://console.upstash.com**
2. Click "Sign up" (free tier, no credit card needed)
3. Click "Create Database"
   - **Name**: ayvlo-redis
   - **Type**: Regional
   - **Region**: Choose closest to you
   - Click "Create"

4. **Copy credentials:**
   - Click on your database
   - Scroll to "REST API" section
   - Copy **UPSTASH_REDIS_REST_URL**
   - Copy **UPSTASH_REDIS_REST_TOKEN**

---

## 🔐 Step 5: Configure Environment Variables (5 minutes)

### Create .env.local file

```bash
# Copy the example file
cp .env.example .env.local

# Open in your editor
nano .env.local
# OR: code .env.local (VS Code)
# OR: open .env.local (Mac TextEdit)
```

### Fill in the values

Here's what your `.env.local` should look like:

```env
# ============================================
# DATABASE (REQUIRED)
# ============================================
# Option A: Local PostgreSQL
DATABASE_URL="postgresql://localhost:5432/ayvlo"

# Option B: Neon (paste your connection string)
# DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/ayvlo"

# ============================================
# NEXTAUTH (REQUIRED)
# ============================================
NEXTAUTH_URL="http://localhost:3000"

# Generate a secret:
# Run: openssl rand -base64 32
# Paste the output below:
NEXTAUTH_SECRET="your-generated-secret-here"

# ============================================
# REDIS (REQUIRED)
# ============================================
# Paste from Upstash console:
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# ============================================
# STRIPE (OPTIONAL - for billing)
# ============================================
# Leave blank for now, add later when ready to test billing
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# ============================================
# OAUTH (OPTIONAL - for Google/GitHub login)
# ============================================
# Leave blank for now, use email login for testing
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ============================================
# APP CONFIG
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Generate NEXTAUTH_SECRET

In your terminal:
```bash
# Mac/Linux:
openssl rand -base64 32

# Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Copy the output and paste into .env.local
```

### Save the file
- `Ctrl+O` then `Ctrl+X` (nano)
- `Cmd+S` (VS Code)

---

## 🔨 Step 6: Initialize Database with Prisma (2 minutes)

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm db:push

# You should see:
# ✔ Generated Prisma Client
# Your database is now in sync with your Prisma schema.
```

**If you get errors:**

**Error: "Can't reach database"**
- Check your DATABASE_URL is correct
- For local PostgreSQL: Make sure it's running (`brew services start postgresql`)
- For Neon: Check you copied the full connection string

**Error: "SSL connection required"**
Add `?sslmode=require` to your DATABASE_URL:
```env
DATABASE_URL="postgresql://...?sslmode=require"
```

---

## 🌱 Step 7: Seed Demo Data (1 minute)

```bash
pnpm db:seed

# You should see:
# 🌱 Seeding database...
# ✅ Created demo user: demo@ayvlo.com
# ✅ Created demo organization: demo-org
# ✅ Created 2 sample anomalies
# 🎉 Seeding completed successfully!
```

This creates:
- Demo user account
- Demo organization
- Sample workspace
- 2 example anomalies
- 1 workflow
- Demo API key: `ayvlo_test_1234567890abcdef`

---

## 🚀 Step 8: Start Development Server (30 seconds)

```bash
pnpm dev

# You should see:
# ▲ Next.js 14.1.0
# - Local:        http://localhost:3000
# ✓ Ready in 2.5s
```

**Open your browser to: http://localhost:3000**

You should see the Ayvlo landing page! 🎉

---

## 🧪 Step 9: Test the Application (5 minutes)

### Test 1: View the Landing Page

1. Go to: http://localhost:3000
2. You should see the Ayvlo homepage with:
   - Gold "Ayvlo" logo
   - "Autonomous Analytics that Never Sleep"
   - Three feature cards

### Test 2: Sign In

**Option A: Use Demo Account (Easiest)**

Since we don't have OAuth configured yet, we'll view the dashboard by accessing it directly:

1. Go to: http://localhost:3000/api/auth/signin
2. Click "Continue with Email"
3. Enter: `demo@ayvlo.com`
4. Click "Sign in with Email"
5. Check your terminal - you'll see the "magic link"
6. Copy the full URL and paste into browser

**Note**: Without email server configured, the link will be printed in the terminal.

**Option B: Access the Dashboard Directly**

For testing, you can directly access:
```
http://localhost:3000/org/[orgId]
```

To find your orgId:
```bash
pnpm db:studio
# Opens Prisma Studio at http://localhost:5555
# Click "Organization" → Copy the "id" field
```

### Test 3: Test Anomaly Detection API

Open a new terminal window:

```bash
# Send test events to the API
curl -X POST http://localhost:3000/api/ayvlo/ingest \
  -H "Authorization: Bearer ayvlo_test_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '[
    {
      "metric": "revenue",
      "value": 100,
      "timestamp": "2025-01-15T10:00:00Z"
    },
    {
      "metric": "revenue",
      "value": 102,
      "timestamp": "2025-01-15T11:00:00Z"
    },
    {
      "metric": "revenue",
      "value": 1000,
      "timestamp": "2025-01-15T12:00:00Z"
    }
  ]'
```

**Expected Response:**
```json
{
  "success": true,
  "eventsProcessed": 3,
  "anomaliesDetected": 1,
  "anomalies": [...]
}
```

The jump from 102 → 1000 should trigger an anomaly! 🎯

### Test 4: View Anomalies in Dashboard

1. Go to your org dashboard
2. You should see:
   - Stats cards showing counts
   - Recent anomalies list
   - The anomaly you just created!

---

## 🎉 Success Checklist

You should now have:
- ✅ Application running at http://localhost:3000
- ✅ Database with demo data
- ✅ API accepting events and detecting anomalies
- ✅ Dashboard showing your data

---

## 🔧 Common Issues & Solutions

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# OR use a different port
pnpm dev -- -p 3001
```

### Issue: "Cannot connect to database"

**Solution:**
```bash
# Test your connection
psql $DATABASE_URL

# Check PostgreSQL is running
# Mac:
brew services list

# Linux:
sudo systemctl status postgresql

# Restart if needed
brew services restart postgresql
```

### Issue: "Prisma Client not generated"

**Solution:**
```bash
# Force regenerate
pnpm prisma generate --force

# OR delete and regenerate
rm -rf node_modules/.prisma
pnpm prisma generate
```

### Issue: "Redis connection failed"

**Solution:**
- Go to Upstash console
- Check database is "Active"
- Copy credentials again
- Make sure no extra spaces in .env.local
- Verify URL starts with `https://`

### Issue: "Module not found" errors

**Solution:**
```bash
# Clean install
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

---

## 🛠️ Useful Commands

```bash
# Start development server
pnpm dev

# View database in GUI
pnpm db:studio

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Reseed data
pnpm db:seed

# Build for production
pnpm build

# Run production build
pnpm start

# Run linting
pnpm lint
```

---

## 📚 Next Steps

### 1. Configure OAuth (Optional)

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable Google+ API
4. Create OAuth credentials
5. Add redirect URL: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Secret to `.env.local`

**GitHub OAuth:**
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set callback: `http://localhost:3000/api/auth/callback/github`
4. Copy credentials to `.env.local`

### 2. Set Up Stripe (Optional)

1. Create account at [stripe.com](https://stripe.com)
2. Get test API keys from Dashboard
3. Install Stripe CLI: https://stripe.com/docs/stripe-cli
4. Forward webhooks:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
5. Add keys to `.env.local`

### 3. Customize the App

- Change "Ayvlo" to your brand name
- Update colors in `tailwind.config.ts`
- Add your logo to `src/components/layout/app-shell.tsx`
- Customize landing page in `src/app/page.tsx`

### 4. Deploy to Production

See `README.md` for deployment instructions!

---

## 🆘 Still Having Issues?

1. **Check the logs** - Look in your terminal for error messages
2. **Check browser console** - Press F12 in your browser
3. **Review the files**:
   - `README.md` - Architecture overview
   - `SETUP.md` - Detailed setup guide
   - `QUICKSTART.md` - Quick reference

---

## 🎊 You Did It!

Your Ayvlo SaaS platform is now running locally!

**What you can do now:**
- 🔍 Explore the dashboard
- 📊 Send test events via API
- 🤖 See AI anomaly detection in action
- 🎨 Customize the branding
- 🚀 Deploy to production!

**Time to build your billion-dollar SaaS!** 👑

---

Made with ❤️ - Happy coding! 🚀
