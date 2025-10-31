# Ayvlo SaaS - Complete Setup Guide

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
pnpm install
# or
npm install
```

### 2. Set Up Database

#### Option A: Local PostgreSQL
```bash
# Install PostgreSQL if not already installed
# macOS: brew install postgresql
# Ubuntu: sudo apt install postgresql

# Create database
createdb ayvlo

# Update .env.local
DATABASE_URL="postgresql://localhost:5432/ayvlo"
```

#### Option B: Neon (Recommended)
1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy connection string to `.env.local`

#### Option C: Supabase
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Get connection string from Settings → Database
4. Add to `.env.local`

### 3. Set Up Redis (Required for Rate Limiting)

1. Go to [upstash.com](https://upstash.com)
2. Create a Redis database
3. Copy REST URL and Token
4. Add to `.env.local`:
```env
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
```

### 4. Configure Authentication

#### NextAuth Secret
```bash
# Generate a secure secret
openssl rand -base64 32

# Add to .env.local
NEXTAUTH_SECRET="your-generated-secret"
NEXTAUTH_URL="http://localhost:3000"
```

#### Email Provider (Optional)
```env
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@ayvlo.com"
```

#### Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`
6. Add to `.env.local`:
```env
GOOGLE_CLIENT_ID="your-client-id"
GOOGLE_CLIENT_SECRET="your-client-secret"
```

#### GitHub OAuth (Optional)
1. Go to GitHub Settings → Developer settings → OAuth Apps
2. Create new OAuth App
3. Set callback URL: `http://localhost:3000/api/auth/callback/github`
4. Add to `.env.local`:
```env
GITHUB_CLIENT_ID="your-client-id"
GITHUB_CLIENT_SECRET="your-client-secret"
```

### 5. Set Up Stripe

1. Go to [stripe.com](https://stripe.com)
2. Get your API keys from Dashboard
3. Create products and prices
4. Set up webhook endpoint (for local dev, use Stripe CLI)

```bash
# Install Stripe CLI
# macOS: brew install stripe/stripe-cli/stripe
# Other: https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook
# Copy webhook signing secret
```

Add to `.env.local`:
```env
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_PRICE_ID_STARTER="price_..."
STRIPE_PRICE_ID_PRO="price_..."
```

### 6. Initialize Database
```bash
# Generate Prisma client
pnpm prisma generate

# Push schema to database
pnpm db:push

# Seed demo data
pnpm db:seed
```

### 7. Run Development Server
```bash
pnpm dev
```

Visit `http://localhost:3000`

## Complete .env.local Template

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/ayvlo"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Email (optional - for magic links)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@ayvlo.com"

# Google OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# GitHub OAuth (optional)
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Stripe (required for billing)
STRIPE_SECRET_KEY="sk_test_51..."
STRIPE_WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_PRICE_ID_STARTER="price_1..."
STRIPE_PRICE_ID_PRO="price_1..."

# Upstash Redis (required)
UPSTASH_REDIS_REST_URL="https://your-db.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AaaaBbbCcccDddd..."

# UploadThing (optional - for file uploads)
UPLOADTHING_SECRET="sk_live_..."
UPLOADTHING_APP_ID="..."

# App Config
NEXT_PUBLIC_APP_URL="http://localhost:3000"
LOG_LEVEL="info"
```

## Testing the Setup

### 1. Create an Account
1. Go to `http://localhost:3000/auth/signin`
2. Sign in with Google/GitHub or use demo account
3. Demo account: `demo@ayvlo.com` (no password, created by seed)

### 2. Test Anomaly Detection

```bash
# Get your API key from the dashboard or use demo key
export API_KEY="ayvlo_test_1234567890abcdef"

# Send test events
curl -X POST http://localhost:3000/api/ayvlo/ingest \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '[
    {"metric":"test.revenue","value":50,"timestamp":"2025-01-15T10:00:00Z"},
    {"metric":"test.revenue","value":52,"timestamp":"2025-01-15T11:00:00Z"},
    {"metric":"test.revenue","value":48,"timestamp":"2025-01-15T12:00:00Z"},
    {"metric":"test.revenue","value":500,"timestamp":"2025-01-15T13:00:00Z"}
  ]'
```

The last event (500) should trigger an anomaly detection!

### 3. Check Dashboard
Go to `http://localhost:3000/org/[your-org-id]` and you should see:
- The detected anomaly
- Stats cards
- Recent activity

## Production Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

```bash
vercel deploy --prod
```

### Environment Variables for Production

Make sure to set in Vercel dashboard:
- All the same variables from `.env.local`
- Change `NEXTAUTH_URL` to your production domain
- Use production Stripe keys
- Use production database URL

### Post-Deployment

1. Set up Stripe webhook in production:
   - Go to Stripe Dashboard → Webhooks
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `customer.subscription.*`, `invoice.*`
   - Copy webhook secret to env vars

2. Test the deployment:
   - Sign in
   - Create organization
   - Generate API key
   - Send test events

## Troubleshooting

### Database Issues
```bash
# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# View database in GUI
pnpm db:studio
```

### Prisma Client Issues
```bash
# Regenerate Prisma client
pnpm prisma generate
```

### NextAuth Issues
- Make sure `NEXTAUTH_SECRET` is set
- Check OAuth redirect URIs match exactly
- For production, use `NEXTAUTH_URL` with your domain

### Stripe Webhook Issues
- Use Stripe CLI for local testing
- Check webhook signing secret matches
- Verify endpoint is publicly accessible in production

### Redis Connection Issues
- Verify Upstash credentials
- Check if Redis instance is active
- Test connection in Upstash dashboard

## Advanced Configuration

### Custom AI Model

Replace the placeholder detector in `src/lib/ai/detector.ts`:

```typescript
// Example: Using TensorFlow.js
import * as tf from '@tensorflow/tfjs';

export async function detectAnomalies(events) {
  const model = await tf.loadLayersModel('https://...');
  // Your custom logic
}
```

### Background Jobs

Set up cron jobs in `vercel.json`:

```json
{
  "crons": [{
    "path": "/api/system/cron/ingest",
    "schedule": "0 * * * *"
  }]
}
```

### Email Notifications

Integrate with SendGrid, Postmark, or Resend:

```typescript
// src/lib/email.ts
export async function sendEmail(to: string, subject: string, body: string) {
  // Your email service
}
```

## Next Steps

1. ✅ Complete setup
2. Customize branding and colors
3. Replace AI detector with your model
4. Add more integrations (Slack, Discord, etc.)
5. Set up monitoring (Sentry, LogRocket)
6. Configure CI/CD
7. Add tests
8. Launch! 🚀

## Support

For issues:
1. Check this guide
2. Review the code comments
3. Check the README
4. Search existing issues
5. Create new issue with details

---

Ready to build the next billion-dollar SaaS? Let's go! 🚀
