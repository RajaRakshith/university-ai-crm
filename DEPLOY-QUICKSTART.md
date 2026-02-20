# 🎯 Quick Start: Deploy Your App in 10 Minutes

## ⚡ Fastest Path: Vercel Deployment

### Prerequisites
- ✅ GitHub account (free)
- ✅ Vercel account (free) - sign up at https://vercel.com

### Step-by-Step

#### 1️⃣ Push to GitHub (2 minutes)

**Option A: Using GitHub Desktop (Easiest)**
1. Download GitHub Desktop: https://desktop.github.com/
2. Open GitHub Desktop
3. Add this folder as repository
4. Publish to GitHub (makes it public)

**Option B: Using PowerShell (Run in project folder)**
```powershell
# Run the deployment script
.\deploy-vercel.ps1
```

**Option C: Manual Commands**
```powershell
git init
git add .
git commit -m "UniConnect CRM - AI University Engagement"
git branch -M main
```

Then create repo at https://github.com/new and follow instructions.

---

#### 2️⃣ Deploy to Vercel (3 minutes)

1. **Go to https://vercel.com**
2. **Sign in with GitHub**
3. **Click "New Project"**
4. **Import your repository** (`university-ai-crm`)
5. Vercel detects Next.js automatically
6. **Click "Deploy"**
7. Wait 2-3 minutes ⏳

🎉 **Your app is live!** You'll get a URL like: `https://university-ai-crm-abc123.vercel.app`

---

#### 3️⃣ Add Environment Variables (5 minutes)

In Vercel Dashboard:

1. Go to your project → **Settings** → **Environment Variables**
2. Add these variables one by one:

**Database:**
```
DATABASE_URL = file:./dev.db
```

**Oracle Cloud (optional - for GenAI):**
```
OCI_GENERATIVE_AI_ENABLED = true
OCI_TENANCY_OCID = ocid1.tenancy.oc1..aaaaaaaa65qhypdb5tyxdw4jtuuoobk34sckjn7zjjmlrbuhe5qu3xaddgja
OCI_USER_OCID = ocid1.user.oc1..aaaaaaaacm3yuqzd4erwiscpnpfgwgt6g2rsun4fdvhksvj4doncufs57g4a
OCI_FINGERPRINT = 4c:33:33:f9:0c:22:30:22:8b:d5:ff:0c:64:ba:c2:9b
OCI_REGION = us-ashburn-1
OCI_COMPARTMENT_OCID = ocid1.tenancy.oc1..aaaaaaaa65qhypdb5tyxdw4jtuuoobk34sckjn7zjjmlrbuhe5qu3xaddgja
OCI_GENAI_MODEL = cohere.command-r-plus
OCI_GENAI_ENDPOINT = https://inference.generativeai.us-chicago-1.oci.oraclecloud.com
OCI_OBJECT_STORAGE_NAMESPACE = idh6fnvv9ss5
```

**Oracle Private Key:**
```
Name: OCI_PRIVATE_KEY
Value: Copy entire content of ocu_private.pem file including:
-----BEGIN PRIVATE KEY-----
...all the lines...
-----END PRIVATE KEY-----
```

**App URL:**
```
NEXT_PUBLIC_APP_URL = https://your-actual-url.vercel.app
```
(Replace with your real Vercel URL)

3. Click **Save**
4. Go to **Deployments** tab
5. Click **"..."** → **Redeploy** to apply new environment variables

---

#### 4️⃣ Initialize Database (1 minute)

**Important:** Your database needs to be seeded on first deploy.

Two options:

**Option A: Auto-seed in Vercel**
Add to your `package.json`:
```json
"scripts": {
  "vercel-build": "prisma generate && prisma db push && npm run db:seed && next build"
}
```

**Option B: Manual seed via Vercel CLI**
```powershell
npm i -g vercel
vercel login
vercel env pull .env.production
npm run db:push
npm run db:seed
```

---

## ✅ Test Your Deployment

Visit your Vercel URL:

- 🏠 **Landing:** `https://your-app.vercel.app`
- 👨‍💼 **Manager Dashboard:** `https://your-app.vercel.app/manager`
- 📝 **Create Event:** `https://your-app.vercel.app/manager/events/new`
- 🎓 **Student Onboarding:** `https://your-app.vercel.app/student/onboard`
- 📊 **Analytics:** `https://your-app.vercel.app/manager/analytics`

---

## 🎪 For Your Hackathon Demo

### Share These Links

**Public Demo URLs:**
```
Application: https://your-app.vercel.app
Manager Portal: https://your-app.vercel.app/manager
Student Portal: https://your-app.vercel.app/student/onboard
Analytics: https://your-app.vercel.app/manager/analytics
```

### Demo Flow

1. **Show Manager View** - Create event with topics, see audience preview
2. **Show Student View** - Onboard with resume, see AI extraction
3. **Show Matching** - Demonstrate cosine similarity scores
4. **Show Digest** - Personalized recommendations per student
5. **Show Analytics** - Engagement metrics dashboard

### Talking Points

- ✅ "Built on Next.js 14 with TypeScript"
- ✅ "Deployed to Vercel with automatic CI/CD"
- ✅ "Integrated with Oracle Cloud Infrastructure"
- ✅ "Uses Oracle Generative AI for resume parsing"
- ✅ "Cosine similarity algorithm for intelligent matching"
- ✅ "Adaptive learning from user feedback"

---

## 🔄 Making Updates

After deployment, any changes you push to GitHub automatically redeploy:

```powershell
# Make changes to code
git add .
git commit -m "Add new feature"
git push

# Vercel auto-deploys in ~2 minutes
```

---

## 📊 Monitoring

**Vercel Dashboard shows:**
- 📈 Traffic analytics
- ⚡ Performance metrics
- 🐛 Error logs
- 📊 Build history

**Access logs:**
Project → Analytics → Functions

---

## 🚨 Common Issues

**Issue: Database empty after deploy**
- Solution: Run seed script or add to `vercel-build` command

**Issue: Environment variables not working**
- Solution: Make sure they're saved in Vercel Settings, then redeploy

**Issue: Oracle GenAI still 401**
- Solution: Add ANTHROPIC_API_KEY for now (5 min fix)

**Issue: Build fails**
- Solution: Check build logs in Vercel, usually missing dependency

---

## ⚡ Quick Wins

**Add Claude API (if Oracle GenAI still not working):**

1. Get free key: https://console.anthropic.com/
2. In Vercel, add environment variable:
   ```
   ANTHROPIC_API_KEY = sk-ant-your-key-here
   ```
3. Redeploy
4. AI resume extraction now works!

---

## 🎉 You're Live!

Your app is now:
- ✅ Publicly accessible with HTTPS
- ✅ Automatically deploys on code changes
- ✅ Monitored with analytics
- ✅ Free hosting (Vercel free tier)

**Next steps:**
- Share demo URL with judges
- Test all features on public URL
- Prepare demo script
- Take screenshots for presentation

---

## 📱 Alternative: Oracle Cloud Deployment

If you want 100% Oracle infrastructure, see [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Oracle Container Instances
- Oracle Compute VM
- Oracle Autonomous Database

**Time:** 15-30 minutes vs 10 minutes for Vercel

**Recommendation:** Deploy to Vercel NOW for working demo, then do Oracle deployment if you have extra time to show Oracle commitment.
