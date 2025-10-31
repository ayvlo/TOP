# 🚀 Ayvlo Setup with Supabase

Complete guide for setting up Ayvlo using Supabase as your database.

---

## Why Supabase?

✅ **Free PostgreSQL database** (500MB, perfect for starting)
✅ **Built-in authentication** (can replace NextAuth later)
✅ **Real-time subscriptions** (for live dashboard updates)
✅ **File storage** (S3-compatible)
✅ **Automatic backups**
✅ **Beautiful dashboard**

---

## 📋 Step-by-Step Setup (20 minutes)

### Step 1: Create Supabase Project (3 minutes)

1. **Go to https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (easiest)
4. Click **"New Project"**

Fill in:
- **Name**: `ayvlo-saas`
- **Database Password**: Generate a strong one (click the generate button)
- **Region**: Choose closest to you (e.g., `us-east-1`)
- **Pricing Plan**: Free

5. Click **"Create new project"**
6. Wait 2-3 minutes while it sets up ☕

---

### Step 2: Get Your Database Connection String (2 minutes)

Once your project is ready:

1. Click **"Connect"** button (top right)
2. Select **"Connection String"** tab
3. Choose **"URI"** mode
4. Click **"Transaction"** (not Session)
5. You'll see something like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

6. **IMPORTANT**: Replace `[YOUR-PASSWORD]` with your actual database password
7. **Copy this complete connection string** - you'll need it!

**Your connection string should look like:**
```
postgresql://postgres:YourActualPassword123@db.abcdefghijklm.supabase.co:5432/postgres
```

---

### Step 3: Set Up Upstash Redis (3 minutes)

We still need Redis for rate limiting:

1. **Go to https://console.upstash.com**
2. Sign up (free, no credit card)
3. Click **"Create Database"**
   - **Name**: `ayvlo-redis`
   - **Type**: Regional
   - **Region**: Same as your Supabase region
4. Click **"Create"**

5. **Copy credentials:**
   - Click on your database
   - Scroll to **"REST API"** section
   - Copy **UPSTASH_REDIS_REST_URL**
   - Copy **UPSTASH_REDIS_REST_TOKEN**

---

### Step 4: Configure Environment Variables (5 minutes)

In your project directory:

```bash
# Copy example file
cp .env.example .env.local

# Open in editor
code .env.local
# OR: nano .env.local
```

**Fill in your `.env.local`:**

```env
# ============================================
# DATABASE - Supabase Connection
# ============================================
DATABASE_URL="postgresql://postgres:YourPassword@db.xxx.supabase.co:5432/postgres"

# For Prisma (direct connection)
DIRECT_URL="postgresql://postgres:YourPassword@db.xxx.supabase.co:5432/postgres"

# ============================================
# NEXTAUTH (REQUIRED)
# ============================================
NEXTAUTH_URL="http://localhost:3000"

# Generate secret with: openssl rand -base64 32
NEXTAUTH_SECRET="paste-your-generated-secret-here"

# ============================================
# REDIS - Upstash
# ============================================
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AxxxYourTokenHere"

# ============================================
# OPTIONAL - Supabase Auth (if you want to use it)
# ============================================
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# ============================================
# STRIPE (Optional - add later)
# ============================================
STRIPE_SECRET_KEY=""
STRIPE_WEBHOOK_SECRET=""
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=""

# ============================================
# OAUTH (Optional - add later)
# ============================================
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ============================================
# APP CONFIG
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

Copy the output and paste into `NEXTAUTH_SECRET`

---

### Step 5: Install Dependencies (3 minutes)

```bash
# Install all packages
pnpm install

# Wait for ~500 packages to install
# Should see: "Done in X.Xs"
```

---

### Step 6: Initialize Database with Prisma (2 minutes)

```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to Supabase
pnpm db:push

# You should see:
# ✔ Generated Prisma Client
# Your database is now in sync with your Prisma schema.
```

**Check in Supabase:**
1. Go to Supabase dashboard
2. Click **"Table Editor"**
3. You should see all your tables! (User, Organization, Workspace, etc.)

---

### Step 7: Seed Demo Data (1 minute)

```bash
pnpm db:seed

# Expected output:
# 🌱 Seeding database...
# ✅ Created demo user: demo@ayvlo.com
# ✅ Created demo organization: demo-org
# ✅ Created demo workspace
# ✅ Created 2 sample anomalies
# 🎉 Seeding completed successfully!
```

**Verify in Supabase:**
1. Go to **"Table Editor"**
2. Click on **"Organization"** table
3. You should see "Demo Organization"!

---

### Step 8: Start Development Server (30 seconds)

```bash
pnpm dev

# You should see:
# ▲ Next.js 14.1.0
# - Local:        http://localhost:3000
# ✓ Ready in 2.5s
```

🎉 **Open http://localhost:3000** in your browser!

---

### Step 9: Test Everything (5 minutes)

#### Test 1: Homepage
- Go to: http://localhost:3000
- See the Ayvlo landing page

#### Test 2: API
Open a **new terminal** (keep server running):

```bash
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
      "value": 1000,
      "timestamp": "2025-01-15T11:00:00Z"
    }
  ]'
```

**Expected response:**
```json
{
  "success": true,
  "eventsProcessed": 2,
  "anomaliesDetected": 1,
  "anomalies": [...]
}
```

#### Test 3: View in Supabase
1. Go to Supabase dashboard
2. Click **"Table Editor"** → **"Anomaly"**
3. You should see your detected anomaly! 🎯

#### Test 4: Prisma Studio
```bash
pnpm db:studio
```

Opens at http://localhost:5555 - visual database browser!

---

## 🎨 Bonus: Use Supabase Features

### Real-time Updates (Optional)

Want live dashboard updates? Add to your components:

```typescript
// Example: Real-time anomaly updates
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Subscribe to anomalies
supabase
  .channel('anomalies')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'Anomaly' },
    (payload) => {
      console.log('New anomaly detected!', payload)
      // Update your UI
    }
  )
  .subscribe()
```

### Supabase Storage (Optional)

For file uploads instead of UploadThing:

```typescript
// Upload files to Supabase Storage
const { data, error } = await supabase.storage
  .from('uploads')
  .upload('reports/2025-report.pdf', file)
```

### Supabase Auth (Optional)

You can replace NextAuth with Supabase Auth later:

```typescript
// Sign in with Supabase
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google'
})
```

---

## ✅ Success Checklist

You're all set if you can:

- [x] See homepage at localhost:3000
- [x] Send events via API
- [x] See anomalies detected
- [x] View data in Supabase dashboard
- [x] View data in Prisma Studio

---

## 🆘 Troubleshooting

### Issue: "Can't connect to database"

**Check:**
1. Is your Supabase project "Active"? (Check dashboard)
2. Did you replace `[YOUR-PASSWORD]` with actual password?
3. Is there a typo in the connection string?

**Test connection:**
```bash
psql "postgresql://postgres:YourPassword@db.xxx.supabase.co:5432/postgres"
```

### Issue: "SSL required"

Add `?sslmode=require` to your DATABASE_URL:
```env
DATABASE_URL="postgresql://...?sslmode=require"
```

### Issue: "Too many connections"

Supabase free tier limits connections. Add to your DATABASE_URL:
```env
DATABASE_URL="postgresql://...?pgbouncer=true&connection_limit=1"
```

### Issue: Prisma migrations fail

Use direct connection for migrations:
```bash
# Add to .env.local
DIRECT_URL="postgresql://postgres:password@db.xxx.supabase.co:5432/postgres"
```

Then in `prisma/schema.prisma`:
```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
```

---

## 🔐 Security Best Practices

### For Production:

1. **Use connection pooling:**
   ```env
   DATABASE_URL="postgresql://...?pgbouncer=true"
   ```

2. **Enable Row Level Security (RLS):**
   - In Supabase dashboard
   - Go to Authentication → Policies
   - Enable RLS for each table

3. **Rotate database password:**
   - Settings → Database → Reset password
   - Update your .env.local

4. **Use environment-specific projects:**
   - Development: `ayvlo-dev`
   - Production: `ayvlo-prod`

---

## 📊 Supabase Dashboard Tips

### Useful Features:

1. **SQL Editor** - Run custom queries
   ```sql
   SELECT * FROM "Anomaly"
   WHERE severity > 80
   ORDER BY "detectedAt" DESC
   LIMIT 10;
   ```

2. **Database Backups** - Settings → Database → Backups

3. **Logs** - Monitor errors and slow queries

4. **API Docs** - Auto-generated REST API docs

---

## 💡 Supabase vs Other Options

| Feature | Supabase | Neon | Local |
|---------|----------|------|-------|
| Setup Time | 5 min | 3 min | 10 min |
| Free Tier | ✅ 500MB | ✅ 3GB | ✅ Unlimited |
| Real-time | ✅ Yes | ❌ No | ❌ No |
| Backups | ✅ Auto | ✅ Auto | ❌ Manual |
| Storage | ✅ Included | ❌ No | ❌ No |
| Auth | ✅ Built-in | ❌ No | ❌ No |
| Dashboard | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ |

**Verdict**: Supabase is the best all-in-one solution! 🏆

---

## 🚀 Next Steps

After getting it running:

1. **Customize branding** - Change "Ayvlo" to your name
2. **Set up OAuth** - Google/GitHub login
3. **Configure Stripe** - For billing
4. **Enable Supabase features** - Real-time, storage, etc.
5. **Deploy to Vercel** - Production deployment
6. **Launch!** 🎉

---

## 📚 Helpful Links

- **Supabase Docs**: https://supabase.com/docs
- **Prisma + Supabase**: https://supabase.com/docs/guides/integrations/prisma
- **Connection Strings**: https://supabase.com/docs/guides/database/connecting-to-postgres
- **Supabase Status**: https://status.supabase.com

---

## 💰 Pricing (When You Scale)

**Free Tier** (Perfect for MVP):
- 500 MB database space
- 2 GB bandwidth
- 50,000 monthly active users
- 1 GB file storage

**Pro Tier** ($25/month):
- 8 GB database
- 250 GB bandwidth
- 100,000 MAU
- 100 GB storage
- Daily backups

You can start free and upgrade when needed! 🎯

---

## 🎉 You're Ready!

Your Ayvlo SaaS is now running on Supabase!

**What you have:**
- ✅ Production-grade database
- ✅ Real-time capabilities
- ✅ Beautiful admin dashboard
- ✅ Automatic backups
- ✅ Scalable infrastructure

**Time to build your billion-dollar SaaS!** 👑💰

---

Questions? Check the main docs or Supabase documentation.

Happy building! 🚀
