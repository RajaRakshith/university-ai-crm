# 🚀 UniConnect CRM - Quick Start Guide

## ✅ Your Application is Running!

Your UniConnect CRM is now live at: **http://localhost:3000**

## 🎯 What's Been Set Up

### ✅ Completed
- ✅ All dependencies installed (Next.js, Prisma, Oracle OCI SDKs)
- ✅ Oracle Cloud credentials configured
- ✅ Database created and schema initialized
- ✅ Sample data seeded:
  - 4 university centers (Innovation Hub, Career Services, Alumni Relations, Global Studies)
  - 15 interest topics (AI, Healthcare, Climate, Startups, etc.)
  - 3 sample students with interests
  - 4 sample events
- ✅ Development server running on http://localhost:3000

### ⏳ Action Required
- ⚠️ **Enable Oracle Generative AI Service** in OCI Console (see steps below)

## 🔧 Enable Oracle Generative AI (REQUIRED)

**You must complete this step to use AI-powered resume extraction:**

1. Go to [Oracle Cloud Console](https://cloud.oracle.com)
2. Sign in with your credentials
3. Navigate to: **Analytics & AI** → **Generative AI**
4. Click **"Enable"** or **"Get Started"**
5. Select your compartment: `ross_ai_hackathon`
6. Confirm enablement

**This only takes 1-2 minutes and is free within your tenancy limits.**

## 📱 Using Your Application

### Manager Dashboard
Visit: http://localhost:3000/manager

**Features:**
- 📊 View metrics (students, events, campaigns)
- ➕ Create new events with AI-powered audience matching
- 🎯 Preview matched students before sending campaigns
- 📈 View analytics and engagement metrics

**Try This:**
1. Go to http://localhost:3000/manager/events/new
2. Create a new event (e.g., "AI Startup Pitch Night")
3. Add topics like "Artificial Intelligence", "Startups", "Venture Capital"
4. Adjust the match threshold slider
5. See live audience preview with match scores!

### Student Portal
Visit: http://localhost:3000/student/onboard

**Features:**
- 📝 Onboard with AI resume extraction (powered by Oracle Generative AI)
- 📧 View personalized weekly digest of recommended events
- ⚙️ Manage interest preferences
- 👍/👎 Give feedback to improve recommendations

**Try This (After Enabling Oracle GenAI):**
1. Go to http://localhost:3000/student/onboard
2. Enter student info and paste a sample resume like:
   ```
   Passionate computer science student interested in artificial intelligence,
   machine learning, and healthcare technology. Built ML models for medical
   diagnosis. Love attending startup events and hackathons. Also interested
   in climate tech and sustainable energy solutions.
   ```
3. Click Submit - Oracle Generative AI will extract interests automatically!
4. View your personalized event digest

## 🔍 Test Oracle Generative AI Integration

Once you've enabled the service in OCI Console:

1. Visit: http://localhost:3000/student/onboard
2. Submit a student profile with resume text
3. Watch the AI extract interests in real-time
4. Check the console for Oracle GenAI API logs

**Expected behavior:**
- If Oracle GenAI is enabled: Uses Cohere Command R+ model
- If Oracle GenAI is disabled: Falls back to Claude (requires ANTHROPIC_API_KEY)
- If no AI available: Uses simple keyword matching

## 🗄️ Database Management

View your data with Prisma Studio:
```bash
npx prisma studio
```
This opens http://localhost:5555 with a visual database editor.

**Your database has:**
- Students (3 samples)
- Events (4 samples)
- Interest Topics (15 canonical topics)
- Student Interests (weighted 0-1)
- Event Topics
- Campaigns
- Interactions (feedback)
- Digest Items

## 🛠️ Development Commands

```bash
# Start development server
npm run dev

# View database
npx prisma studio

# Reset database (careful!)
npx prisma db push --force-reset
npm run db:seed

# Build for production
npm run build
npm start

# Type checking
npx tsc --noEmit
```

## 🎯 Demo Flow for Hackathon Judges

1. **Manager Creates Event** (http://localhost:3000/manager/events/new)
   - Show AI-powered audience preview
   - Demonstrate match threshold slider
   - Highlight matched topics per student

2. **Student Onboards** (http://localhost:3000/student/onboard)
   - Paste resume with interests
   - Oracle GenAI extracts topics automatically
   - Show resulting interest profile

3. **Student Views Digest** (http://localhost:3000/student/digest)
   - Personalized ranked events
   - Match scores displayed
   - Give feedback with 👍/👎/⭐

4. **Manager Views Analytics** (http://localhost:3000/manager/analytics)
   - Engagement metrics
   - Campaign performance
   - Student interaction breakdown

## 🌐 Oracle Cloud Integration

Your app is configured to use:
- **Generative AI**: Cohere Command R+ model for resume extraction
- **Region**: us-ashburn-1 (home), us-ashburn-1 (GenAI endpoint)
- **Object Storage**: Ready for file uploads (namespace: idh6fnvv9ss5)
- **Database**: SQLite (dev), can upgrade to Oracle Autonomous DB (production)

## 🔒 Environment Variables

All configured in `.env`:
```bash
# Database (local development)
DATABASE_URL="file:./prisma/dev.db"

# Oracle Cloud (already configured with your credentials)
OCI_GENERATIVE_AI_ENABLED=true
OCI_TENANCY_OCID=ocid1.tenancy.oc1...
OCI_USER_OCID=ocid1.user.oc1...
OCI_FINGERPRINT=4c:33:33:f9:0c:22:30:22:8b:d5:ff:0c:64:ba:c2:9b
OCI_PRIVATE_KEY_PATH=./ocu_private.pem
OCI_REGION=us-ashburn-1
OCI_COMPARTMENT_OCID=ocid1.compartment.oc1...
OCI_GENAI_MODEL=cohere.command-r-plus
OCI_GENAI_ENDPOINT=https://inference.generativeai.us-ashburn-1.oci.oraclecloud.com
```

## 📚 Documentation

- **Full Deployment Guide**: [docs/ORACLE_DEPLOYMENT.md](docs/ORACLE_DEPLOYMENT.md)
- **Demo Checklist**: [docs/demo-checklist.md](docs/demo-checklist.md)
- **Main README**: [README.md](README.md)

## 🚨 Troubleshooting

**Oracle GenAI returns error:**
- ✅ Enabled Generative AI in OCI Console?
- ✅ Private key file `ocu_private.pem` in project root?
- ✅ Fingerprint matches in .env?

**Database errors:**
```bash
npx prisma db push
npm run db:seed
```

**Port 3000 already in use:**
```bash
# Kill the process using port 3000, then:
npm run dev
```

**TypeScript errors:**
```bash
npx tsc --noEmit
```

## 🎉 You're Ready!

Your UniConnect CRM is fully operational with Oracle Cloud integration!

**Next Step:** Enable Oracle Generative AI in the OCI Console, then test the student onboarding flow.

**Need Help?** Check the docs or console logs for debugging info.

---

Built with ❤️ for University AI CRM Hackathon
Powered by Oracle Cloud Infrastructure 🌩️
