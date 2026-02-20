# PostgreSQL Cloud Migration Guide

## Option 1: Oracle Autonomous Database (RECOMMENDED - You already have Oracle Cloud)

Since you have Oracle Cloud access, use Oracle Autonomous Database:

### Setup Steps:
1. Go to Oracle Cloud Console → Autonomous Database
2. Create new Autonomous Database (Transaction Processing)
3. Download wallet file
4. Get connection string

### Update .env:
```env
# Replace SQLite with PostgreSQL-compatible Oracle DB
DATABASE_URL="postgresql://admin:PASSWORD@HOST:1521/SERVICE_NAME"
# Or use Oracle's native driver
```

---

## Option 2: Neon (Serverless PostgreSQL - FREE tier)

Free serverless PostgreSQL with instant setup:

### Setup:
1. Go to https://neon.tech
2. Sign up (free)
3. Create new project
4. Copy connection string

### Update .env:
```env
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/dbname?sslmode=require"
```

---

## Option 3: Supabase (PostgreSQL + extras - FREE tier)

Free PostgreSQL with built-in features:

### Setup:
1. Go to https://supabase.com
2. Create project
3. Get connection string from Settings → Database

### Update .env:
```env
DATABASE_URL="postgresql://postgres.xxx:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

---

## Option 4: Railway (Simple deployment)

### Setup:
1. Go to https://railway.app
2. New Project → Add PostgreSQL
3. Copy connection URL

---

## Migration Steps (Once you have PostgreSQL URL)

### 1. Update .env file:
```env
DATABASE_URL="your-postgresql-connection-string"
```

### 2. Update Prisma schema:
```prisma
datasource db {
  provider = "postgresql"  // Changed from sqlite
  url      = env("DATABASE_URL")
}
```

### 3. Run migration:
```powershell
npx prisma db push
npx prisma generate
```

### 4. Restart server:
```powershell
npm run dev
```

---

## Recommended: Neon (Easiest + Free)

1. Go to https://neon.tech
2. Sign up
3. Create database
4. Copy connection string
5. Paste in .env as DATABASE_URL
6. Change `provider = "postgresql"` in schema.prisma
7. Run `npx prisma db push`

Done! Your data will now save to cloud PostgreSQL.
