# 🚀 Quick Start Guide - UniConnect CRM

**Get running in 5 minutes**

---

## Step 1: Install Dependencies

```bash
npm install
```

This installs:
- Next.js 14
- Prisma ORM
- Anthropic Claude SDK
- Tailwind CSS
- TypeScript

---

## Step 2: Configure Environment

```bash
# Copy the example environment file
cp .env.example .env
```

**Edit `.env` and add your Claude API key:**

```env
DATABASE_URL="file:./dev.db"
ANTHROPIC_API_KEY="sk-ant-api03-YOUR-KEY-HERE"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Get Claude API key:**
1. Go to [console.anthropic.com](https://console.anthropic.com/)
2. Sign in or create account
3. Navigate to API Keys
4. Create new key
5. Copy and paste into `.env`

---

## Step 3: Initialize Database

```bash
# Push schema to SQLite database
npx prisma db push

# Seed with sample data
npm run db:seed
```

**This creates:**
- 4 university centers
- 15 canonical topics
- 3 sample students with interests
- 4 sample events with topic tags

---

## Step 4: Start Development Server

```bash
npm run dev
```

**Open browser**: http://localhost:3000

---

## Step 5: Test the Demo

### Quick Test Flow:

**1. Student Onboarding:**
- Click "Student → Get Started"
- Email: `test@university.edu`
- Name: `Test Student`
- Paste in resume section:
  ```
  MBA student interested in AI and healthcare.
  Built machine learning models for patient diagnosis.
  Looking for VC funding opportunities.
  ```
- Click "Create Profile"
- ✅ Should extract: AI, Healthcare, VC, Startups, Machine Learning

**2. View Digest:**
- Click "View Your Personalized Digest"
- Click "Generate Digest" if empty
- ✅ Should show ranked events (likely "AI for Healthcare Pitch Night" at top)

**3. Create Event (Manager):**
- Go home → "Center Manager"
- Click "Create Event"
- Fill form:
  - Center: AI Research Lab
  - Title: Test Event
  - Description: Testing the platform
  - Date: Tomorrow
  - Select topics: AI, Healthcare
- ✅ Should show matched students after creation

**4. View Analytics:**
- Click "Analytics" in manager nav
- ✅ Should show summary metrics

---

## Common Commands

```bash
# Development
npm run dev              # Start dev server

# Database
npx prisma db push       # Apply schema changes
npm run db:seed          # Reseed database
npx prisma studio        # Visual database browser

# Production
npm run build            # Build for production
npm start                # Start production server

# Utilities
npm run lint             # Run linter
```

---

## Troubleshooting

### Issue: `npm install` fails
**Solution**: Ensure Node.js 18+ is installed
```bash
node --version  # Should be 18.0.0 or higher
```

### Issue: Database errors
**Solution**: Reset database
```bash
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

### Issue: Claude API not working
**Solution #1**: Verify API key in `.env`
```bash
cat .env | grep ANTHROPIC_API_KEY
```

**Solution #2**: Check API credits at [console.anthropic.com](https://console.anthropic.com/)

**Solution #3**: System will auto-fallback to keyword matching if AI unavailable

### Issue: Port 3000 already in use
**Solution**: Use different port
```bash
PORT=3001 npm run dev
```

---

## Next Steps

Once running:
1. Review [README.md](../README.md) for full documentation
2. Follow [docs/demo-checklist.md](demo-checklist.md) for 5-min demo
3. Explore code in `src/` directory
4. Customize topics in `src/lib/topic-map.ts`
5. Deploy to Vercel: `vercel`

---

## File Structure Refresher

```
src/
  app/
    api/              # Backend API routes
    manager/          # Manager dashboard UI
    student/          # Student portal UI
    page.tsx          # Landing page
  components/         # Reusable UI components
  lib/
    ingest/          # AI extraction logic
    digest/          # Digest generation
    scoring.ts       # Match algorithm
    topic-map.ts     # Topic taxonomy

prisma/
  schema.prisma      # Database schema
  seed.ts            # Sample data generator
```

---

## Development Tips

### View Database
```bash
npx prisma studio
```
Opens GUI at http://localhost:5555

### Test API Endpoints
```bash
# Onboard student
curl -X POST http://localhost:3000/api/students/onboard \
  -H "Content-Type: application/json" \
  -d '{"email":"curl@test.edu","name":"Curl Test","resumeText":"AI and startups"}'

# Generate digests
curl -X POST http://localhost:3000/api/digest/generate \
  -H "Content-Type: application/json" \
  -d '{"minScore":0.5}'
```

### Hot Reload
Next.js automatically reloads on file changes. Just edit and save!

---

## Ready to Code?

**All systems green!** 🚀

Start building:
- Add new topics to `src/lib/topic-map.ts`
- Tweak matching in `src/lib/scoring.ts`
- Customize UI in `src/components/`
- Add API routes in `src/app/api/`

Happy coding! 🎉