# 🚀 Ayvlo - All-in-One Quick Start

## ⚡ Run Everything with One Command

### Option 1: Automated Setup + Run

```bash
# Clone the repo (if you haven't)
git clone <your-repo-url>
cd ayvlo

# Run automated setup (does everything!)
bash setup.sh

# Start the app
pnpm dev
```

### Option 2: Single Command Start

```bash
# This checks if setup is needed and runs it, then starts the app
bash run.sh
```

That's it! Open http://localhost:3000 🎉

---

## 📦 What's Included - Complete Code Overview

### Core Application Structure

```
ayvlo/
├── src/
│   ├── app/                  # Next.js 14 App Router
│   │   ├── page.tsx         # Landing page
│   │   ├── api/             # API routes
│   │   │   ├── ayvlo/
│   │   │   │   └── ingest/
│   │   │   │       └── route.ts  # Anomaly detection API
│   │   │   ├── auth/
│   │   │   │   └── [...nextauth]/
│   │   │   │       └── route.ts  # NextAuth handlers
│   │   │   └── health/
│   │   │       └── route.ts      # Health check
│   │   └── org/
│   │       └── [orgId]/
│   │           └── page.tsx      # Dashboard
│   ├── components/           # React components
│   │   ├── layout/
│   │   ├── ui/
│   │   └── dashboard/
│   ├── lib/                  # Utilities & configs
│   │   ├── prisma.ts        # Database client
│   │   ├── redis.ts         # Redis client
│   │   ├── auth.ts          # Auth config
│   │   └── anomaly-detection.ts  # AI detection logic
│   └── types/                # TypeScript types
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Demo data seeder
├── public/                   # Static assets
├── .env.local               # Environment variables (auto-generated)
├── setup.sh                 # Automated setup script
└── run.sh                   # Quick start script
```

---

## 🔑 Pre-Configured Credentials

All credentials are **already configured** in `setup.sh`:

### Database (Supabase PostgreSQL)
```
Direct: postgresql://postgres:Adampoptropica7951!@db.ezpdjupcpgdqpixtlmzs.supabase.co:5432/postgres
Pooler: postgresql://postgres.ezpdjupcpgdqpixtlmzs:Adampoptropica7951!@aws-1-us-east-2.pooler.supabase.com:6543/postgres
```

### Redis (Upstash)
```
URL: https://special-ladybug-31965.upstash.io
Token: AXzdAAIncDI2MmY4ZGFjNGZjZjg0ZTM3ODE3MDBkOWVjN2RkYzVmOXAyMzE5NjU
```

### Demo Account
```
Email: demo@ayvlo.com
API Key: ayvlo_test_1234567890abcdef
```

---

## 💻 Key Code Files - Complete Reference

### 1. Anomaly Detection API (`src/app/api/ayvlo/ingest/route.ts`)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';
import { detectAnomalies } from '@/lib/anomaly-detection';
import { z } from 'zod';

// Validation schema
const eventSchema = z.object({
  metric: z.string(),
  value: z.number(),
  timestamp: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = authHeader.substring(7);

    // Verify API key
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey, active: true },
      include: { workspace: { include: { organization: true } } },
    });

    if (!key) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // 2. Rate limiting (100 requests per minute)
    const rateLimitKey = `ratelimit:${key.id}`;
    const requests = await redis.incr(rateLimitKey);

    if (requests === 1) {
      await redis.expire(rateLimitKey, 60);
    }

    if (requests > 100) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // 3. Parse and validate events
    const body = await req.json();
    const events = Array.isArray(body) ? body : [body];

    const validatedEvents = events.map((event) => eventSchema.parse(event));

    // 4. Store events in database
    const storedEvents = await prisma.event.createMany({
      data: validatedEvents.map((event) => ({
        workspaceId: key.workspaceId,
        metric: event.metric,
        value: event.value,
        timestamp: new Date(event.timestamp),
        metadata: event.metadata || {},
      })),
    });

    // 5. Detect anomalies using AI
    const anomalies = await detectAnomalies(
      validatedEvents,
      key.workspaceId
    );

    // 6. Store detected anomalies
    if (anomalies.length > 0) {
      await prisma.anomaly.createMany({
        data: anomalies.map((anomaly) => ({
          workspaceId: key.workspaceId,
          metric: anomaly.metric,
          value: anomaly.value,
          expectedValue: anomaly.expectedValue,
          deviation: anomaly.deviation,
          severity: anomaly.severity,
          type: anomaly.type,
          message: anomaly.message,
          detectedAt: new Date(),
        })),
      });

      // 7. Trigger alerts if severity > 80
      const criticalAnomalies = anomalies.filter((a) => a.severity > 80);
      if (criticalAnomalies.length > 0) {
        await prisma.alert.createMany({
          data: criticalAnomalies.map((anomaly) => ({
            workspaceId: key.workspaceId,
            type: 'ANOMALY',
            severity: anomaly.severity > 95 ? 'CRITICAL' : 'HIGH',
            title: `Anomaly detected in ${anomaly.metric}`,
            message: anomaly.message,
            metadata: { anomaly },
          })),
        });
      }
    }

    // 8. Return response
    return NextResponse.json({
      success: true,
      eventsProcessed: validatedEvents.length,
      anomaliesDetected: anomalies.length,
      anomalies: anomalies,
    });

  } catch (error) {
    console.error('Ingest error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event format', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

### 2. Anomaly Detection Algorithm (`src/lib/anomaly-detection.ts`)

```typescript
import { prisma } from '@/lib/prisma';

interface Event {
  metric: string;
  value: number;
  timestamp: string;
}

interface Anomaly {
  metric: string;
  value: number;
  expectedValue: number;
  deviation: number;
  severity: number;
  type: 'SPIKE' | 'DROP' | 'TREND_CHANGE' | 'OUTLIER';
  message: string;
}

export async function detectAnomalies(
  events: Event[],
  workspaceId: string
): Promise<Anomaly[]> {
  const anomalies: Anomaly[] = [];

  // Group events by metric
  const eventsByMetric = events.reduce((acc, event) => {
    if (!acc[event.metric]) acc[event.metric] = [];
    acc[event.metric].push(event);
    return acc;
  }, {} as Record<string, Event[]>);

  // Analyze each metric
  for (const [metric, metricEvents] of Object.entries(eventsByMetric)) {
    // Get historical data (last 100 events for this metric)
    const historicalEvents = await prisma.event.findMany({
      where: {
        workspaceId,
        metric,
      },
      orderBy: { timestamp: 'desc' },
      take: 100,
    });

    if (historicalEvents.length < 3) {
      // Not enough data for meaningful analysis
      continue;
    }

    // Calculate statistics
    const values = historicalEvents.map((e) => e.value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) /
      values.length;
    const stdDev = Math.sqrt(variance);

    // Check each new event
    for (const event of metricEvents) {
      const zScore = stdDev === 0 ? 0 : Math.abs(event.value - mean) / stdDev;

      // Detect spike/drop (z-score > 2 is significant)
      if (zScore > 2) {
        const isSpike = event.value > mean;
        const percentChange = ((event.value - mean) / mean) * 100;

        anomalies.push({
          metric: event.metric,
          value: event.value,
          expectedValue: mean,
          deviation: zScore,
          severity: Math.min(zScore * 30, 100), // Cap at 100
          type: isSpike ? 'SPIKE' : 'DROP',
          message: `Detected ${isSpike ? 'spike' : 'drop'} in ${metric}: ${
            event.value
          } (${percentChange.toFixed(2)}% ${isSpike ? 'increase' : 'decrease'})`,
        });
      }

      // Detect trend changes
      if (historicalEvents.length >= 5) {
        const recentValues = historicalEvents.slice(0, 5).map((e) => e.value);
        const recentMean =
          recentValues.reduce((a, b) => a + b, 0) / recentValues.length;
        const olderValues = historicalEvents.slice(5, 10).map((e) => e.value);

        if (olderValues.length > 0) {
          const olderMean =
            olderValues.reduce((a, b) => a + b, 0) / olderValues.length;
          const trendChange =
            Math.abs(recentMean - olderMean) / olderMean;

          if (trendChange > 0.3) {
            // 30% trend change
            anomalies.push({
              metric: event.metric,
              value: event.value,
              expectedValue: olderMean,
              deviation: trendChange,
              severity: Math.min(trendChange * 200, 100),
              type: 'TREND_CHANGE',
              message: `Trend change detected in ${metric}: ${(
                trendChange * 100
              ).toFixed(2)}% shift`,
            });
          }
        }
      }
    }
  }

  return anomalies;
}
```

---

### 3. Database Schema (`prisma/schema.prisma`)

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

// User authentication
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  role          Role      @default(USER)

  accounts      Account[]
  sessions      Session[]
  memberships   OrganizationMember[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Organizations (multi-tenancy)
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  logo        String?
  plan        Plan     @default(FREE)

  members     OrganizationMember[]
  workspaces  Workspace[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model OrganizationMember {
  id             String       @id @default(cuid())
  organizationId String
  userId         String
  role           OrgRole      @default(MEMBER)

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([organizationId, userId])
}

// Workspaces (projects within organizations)
model Workspace {
  id             String   @id @default(cuid())
  name           String
  organizationId String

  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)

  apiKeys    ApiKey[]
  events     Event[]
  anomalies  Anomaly[]
  workflows  Workflow[]
  alerts     Alert[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// API Keys for workspace authentication
model ApiKey {
  id          String   @id @default(cuid())
  key         String   @unique
  name        String
  workspaceId String
  active      Boolean  @default(true)
  lastUsedAt  DateTime?

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
}

// Events (data points)
model Event {
  id          String   @id @default(cuid())
  workspaceId String
  metric      String
  value       Float
  timestamp   DateTime
  metadata    Json     @default("{}")

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([workspaceId, metric, timestamp])
}

// Detected anomalies
model Anomaly {
  id            String   @id @default(cuid())
  workspaceId   String
  metric        String
  value         Float
  expectedValue Float
  deviation     Float
  severity      Float
  type          AnomalyType
  message       String
  detectedAt    DateTime
  resolved      Boolean  @default(false)
  resolvedAt    DateTime?

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  @@index([workspaceId, detectedAt])
}

// Automation workflows
model Workflow {
  id          String   @id @default(cuid())
  workspaceId String
  name        String
  description String?
  trigger     Json
  actions     Json
  active      Boolean  @default(true)

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// Alerts and notifications
model Alert {
  id          String      @id @default(cuid())
  workspaceId String
  type        String
  severity    AlertSeverity
  title       String
  message     String
  metadata    Json        @default("{}")
  read        Boolean     @default(false)

  workspace Workspace @relation(fields: [workspaceId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@index([workspaceId, createdAt])
}

// Enums
enum Role {
  USER
  ADMIN
}

enum OrgRole {
  OWNER
  ADMIN
  MEMBER
}

enum Plan {
  FREE
  PRO
  ENTERPRISE
}

enum AnomalyType {
  SPIKE
  DROP
  TREND_CHANGE
  OUTLIER
}

enum AlertSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

---

### 4. Environment Variables Template (`.env.local` - auto-generated by setup.sh)

```env
# Database
DATABASE_URL="postgresql://postgres:Adampoptropica7951!@db.ezpdjupcpgdqpixtlmzs.supabase.co:5432/postgres"
DIRECT_URL="postgresql://postgres:Adampoptropica7951!@db.ezpdjupcpgdqpixtlmzs.supabase.co:5432/postgres"

# Auth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="<auto-generated-32-byte-secret>"

# Redis
UPSTASH_REDIS_REST_URL="https://special-ladybug-31965.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXzdAAIncDI2MmY4ZGFjNGZjZjg0ZTM3ODE3MDBkOWVjN2RkYzVmOXAyMzE5NjU"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

---

### 5. Database Client (`src/lib/prisma.ts`)

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

---

### 6. Redis Client (`src/lib/redis.ts`)

```typescript
import { Redis } from '@upstash/redis';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});
```

---

### 7. Seed Script (`prisma/seed.ts`)

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create demo user
  const user = await prisma.user.upsert({
    where: { email: 'demo@ayvlo.com' },
    update: {},
    create: {
      email: 'demo@ayvlo.com',
      name: 'Demo User',
      role: 'ADMIN',
    },
  });
  console.log('✅ Created demo user:', user.email);

  // Create demo organization
  const org = await prisma.organization.upsert({
    where: { slug: 'demo-org' },
    update: {},
    create: {
      name: 'Demo Organization',
      slug: 'demo-org',
      plan: 'PRO',
    },
  });
  console.log('✅ Created demo organization:', org.name);

  // Link user to organization
  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId: org.id,
        userId: user.id,
      },
    },
    update: {},
    create: {
      organizationId: org.id,
      userId: user.id,
      role: 'OWNER',
    },
  });

  // Create workspace
  const workspace = await prisma.workspace.upsert({
    where: { id: 'demo-workspace' },
    update: {},
    create: {
      id: 'demo-workspace',
      name: 'Main Workspace',
      organizationId: org.id,
    },
  });
  console.log('✅ Created demo workspace:', workspace.name);

  // Create API key
  const apiKey = await prisma.apiKey.upsert({
    where: { key: 'ayvlo_test_1234567890abcdef' },
    update: {},
    create: {
      key: 'ayvlo_test_1234567890abcdef',
      name: 'Demo API Key',
      workspaceId: workspace.id,
      active: true,
    },
  });
  console.log('✅ Created API key:', apiKey.key);

  // Create sample anomalies
  await prisma.anomaly.createMany({
    data: [
      {
        workspaceId: workspace.id,
        metric: 'revenue',
        value: 50000,
        expectedValue: 10000,
        deviation: 4.0,
        severity: 85,
        type: 'SPIKE',
        message: 'Revenue spike detected: 400% increase',
        detectedAt: new Date(),
      },
      {
        workspaceId: workspace.id,
        metric: 'users',
        value: 50,
        expectedValue: 1000,
        deviation: 3.5,
        severity: 75,
        type: 'DROP',
        message: 'User count drop detected: 95% decrease',
        detectedAt: new Date(),
      },
    ],
  });
  console.log('✅ Created 2 sample anomalies');

  // Create sample workflow
  await prisma.workflow.create({
    data: {
      workspaceId: workspace.id,
      name: 'Alert on High Severity',
      description: 'Send notification when severity > 80',
      trigger: {
        type: 'anomaly',
        condition: { severity: { gt: 80 } },
      },
      actions: [
        {
          type: 'notification',
          channel: 'email',
          template: 'anomaly-alert',
        },
      ],
      active: true,
    },
  });
  console.log('✅ Created 1 workflow');

  console.log('🎉 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

---

## 🎯 Quick Test Commands

### Test API with curl
```bash
# Test health check
curl http://localhost:3000/api/health

# Send test event
curl -X POST http://localhost:3000/api/ayvlo/ingest \
  -H "Authorization: Bearer ayvlo_test_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '[{
    "metric": "revenue",
    "value": 1000,
    "timestamp": "2025-11-01T10:00:00Z"
  }]'
```

### Test with JavaScript
```javascript
// test.js
const response = await fetch('http://localhost:3000/api/ayvlo/ingest', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ayvlo_test_1234567890abcdef',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify([
    {
      metric: 'revenue',
      value: 100,
      timestamp: new Date().toISOString(),
    },
    {
      metric: 'revenue',
      value: 1000,
      timestamp: new Date().toISOString(),
    },
  ]),
});

const data = await response.json();
console.log(data);
```

---

## 🛠️ All Available Commands

```bash
# Setup & Run
bash setup.sh          # Automated complete setup
bash run.sh            # Quick start (runs setup if needed)

# Development
pnpm dev               # Start dev server (http://localhost:3000)
pnpm build             # Build for production
pnpm start             # Run production build
pnpm lint              # Run ESLint

# Database
pnpm db:push           # Push schema to database
pnpm db:seed           # Seed demo data
pnpm db:studio         # Open Prisma Studio (http://localhost:5555)
pnpm prisma generate   # Generate Prisma client
pnpm prisma migrate    # Run migrations

# Testing
pnpm test              # Run tests
pnpm test:watch        # Watch mode
```

---

## 🎉 Summary

### What You Get:

1. **`setup.sh`** - Automated setup script that:
   - Checks prerequisites
   - Installs dependencies
   - Creates `.env.local` with all credentials
   - Generates Prisma client
   - Pushes database schema
   - Seeds demo data
   - Tests connections

2. **`run.sh`** - Quick start script that:
   - Checks if setup is needed
   - Starts the dev server
   - One command to rule them all!

3. **Complete codebase** with:
   - Anomaly detection API
   - AI-powered detection algorithm
   - Database schema (Prisma)
   - Authentication (NextAuth)
   - Rate limiting (Redis)
   - Multi-tenancy
   - Demo data

### Total Setup Time: **5 minutes**

```bash
# Literally just run this:
bash setup.sh && pnpm dev
```

That's it! Everything is pre-configured with your credentials. No manual configuration needed! 🚀
