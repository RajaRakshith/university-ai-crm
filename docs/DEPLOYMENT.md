# 🚀 Public Deployment Guide - UniConnect CRM

## ⚡ Quick Deploy Options

### Option 1: Vercel (FASTEST - 5 minutes) ⭐ RECOMMENDED

**Why Vercel:**
- ✅ Free tier with generous limits
- ✅ Auto HTTPS + CDN
- ✅ Public URL instantly
- ✅ Git-based deployment (auto-redeploy on push)
- ✅ Perfect for Next.js apps

**Steps:**

1. **Create GitHub Repository**
   ```bash
   git init
   git add .
   git commit -m "UniConnect CRM - AI-powered university engagement"
   gh repo create university-ai-crm --public --source=. --remote=origin
   git push -u origin main
   ```

2. **Deploy to Vercel**
   - Go to https://vercel.com
   - Sign in with GitHub
   - Click "New Project"
   - Import `university-ai-crm` repository
   - Vercel auto-detects Next.js
   - Click "Deploy"

3. **Add Environment Variables** (in Vercel Dashboard)
   Go to Project Settings → Environment Variables → Add:
   ```
   DATABASE_URL=file:./dev.db
   OCI_GENERATIVE_AI_ENABLED=true
   OCI_TENANCY_OCID=ocid1.tenancy.oc1..aaaaaaaa65qhypdb5tyxdw4jtuuoobk34sckjn7zjjmlrbuhe5qu3xaddgja
   OCI_USER_OCID=ocid1.user.oc1..aaaaaaaacm3yuqzd4erwiscpnpfgwgt6g2rsun4fdvhksvj4doncufs57g4a
   OCI_FINGERPRINT=4c:33:33:f9:0c:22:30:22:8b:d5:ff:0c:64:ba:c2:9b
   OCI_REGION=us-ashburn-1
   OCI_COMPARTMENT_OCID=ocid1.tenancy.oc1..aaaaaaaa65qhypdb5tyxdw4jtuuoobk34sckjn7zjjmlrbuhe5qu3xaddgja
   OCI_GENAI_MODEL=cohere.command-r-plus
   OCI_GENAI_ENDPOINT=https://inference.generativeai.us-chicago-1.oci.oraclecloud.com
   OCI_OBJECT_STORAGE_NAMESPACE=idh6fnvv9ss5
   NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
   ```

4. **Add Private Key as Secret**
   - Copy content of `ocu_private.pem`
   - In Vercel, add environment variable:
     - Name: `OCI_PRIVATE_KEY`
     - Value: Paste entire private key (including BEGIN/END lines)
   
5. **Redeploy**
   - Vercel will auto-deploy with new env vars
   - Your app is live at `https://university-ai-crm-xxxx.vercel.app`

**Done! 🎉** Your app is publicly accessible with HTTPS.

---

### Option 2: Oracle Container Instances (100% Oracle Cloud)

**Why OCI:**
- ✅ Fully on Oracle infrastructure
- ✅ Good for hackathon judges (showing Oracle commitment)
- ✅ More control than Vercel

**Steps:**

#### 1. Prepare Docker Image

Already have Dockerfile! Just need to build:

```bash
# Build image
docker build -t uniconnect-crm:latest .

# Test locally
docker run -p 3000:3000 --env-file .env uniconnect-crm:latest
```

#### 2. Push to Oracle Container Registry (OCIR)

```bash
# Login to OCIR
docker login idh6fnvv9ss5.ocir.us-ashburn-1.oci.oraclecloud.com
# Username: idh6fnvv9ss5/your-email
# Password: Your auth token from OCI Console

# Tag image
docker tag uniconnect-crm:latest idh6fnvv9ss5.ocir.us-ashburn-1.oci.oraclecloud.com/ross_ai_hackathon/uniconnect-crm:latest

# Push
docker push idh6fnvv9ss5.ocir.us-ashburn-1.oci.oraclecloud.com/ross_ai_hackathon/uniconnect-crm:latest
```

#### 3. Deploy to OCI Container Instances

**Via OCI Console:**
1. Go to **Developer Services** → **Container Instances**
2. Click **Create Container Instance**
3. Name: `uniconnect-crm`
4. Shape: `CI.Standard.E4.Flex` (1 OCPU, 8GB RAM)
5. Networking: Select VCN (or create new)
6. Add Container:
   - Image: `idh6fnvv9ss5.ocir.us-ashburn-1.oci.oraclecloud.com/ross_ai_hackathon/uniconnect-crm:latest`
   - Port: 3000
   - Environment variables: Add all from .env
7. Click **Create**

**Get Public IP:**
- Go to Container Instance details
- Note the public IP
- Access at: `http://[PUBLIC-IP]:3000`

#### 4. Add Load Balancer (Optional - for HTTPS)

1. **Compute** → **Load Balancers** → **Create**
2. Add backend: Your container instance
3. Configure SSL certificate (free Let's Encrypt via Certbot)

---

### Option 3: Oracle Compute VM

**Steps:**

1. **Create Compute Instance**
   - OCI Console → Compute → Instances → Create
   - Shape: `VM.Standard.E4.Flex` (1 OCPU, 8GB)
   - Image: Oracle Linux 8
   - Add SSH key

2. **SSH into VM**
   ```bash
   ssh opc@[PUBLIC-IP]
   ```

3. **Install Node.js & Dependencies**
   ```bash
   # Install Node.js
   curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
   sudo yum install nodejs git -y
   
   # Clone repo (after pushing to GitHub)
   git clone https://github.com/yourusername/university-ai-crm.git
   cd university-ai-crm
   
   # Install deps
   npm install
   
   # Setup .env
   nano .env  # Paste your env vars
   
   # Initialize DB
   npx prisma db push
   npm run db:seed
   
   # Build for production
   npm run build
   
   # Start with PM2
   sudo npm install -g pm2
   pm2 start npm --name "uniconnect" -- start
   pm2 save
   pm2 startup
   ```

4. **Configure Firewall**
   ```bash
   sudo firewall-cmd --permanent --add-port=3000/tcp
   sudo firewall-cmd --reload
   ```

5. **Access**
   - Go to `http://[PUBLIC-IP]:3000`

---

## 🗄️ Database Options for Production

**Current:** SQLite (file-based) - **Works for demo but not scalable**

**Production Options:**

### Option A: Oracle Autonomous Database (Recommended)
```bash
# Update .env
DATABASE_URL="oracle://username:password@host:1522/service_name"

# Update prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Autonomous DB supports PostgreSQL protocol
  url      = env("DATABASE_URL")
}

# Migrate
npx prisma db push
```

### Option B: Vercel Postgres (if using Vercel)
- Free tier: 256MB storage
- One-click setup in Vercel dashboard

### Option C: Keep SQLite
- Fine for hackathon demo
- Data resets on each deploy (Vercel/Container)
- Use Vercel's Volume storage to persist

---

## 📋 Pre-Deployment Checklist

- [ ] Test build locally: `npm run build && npm start`
- [ ] Verify all environment variables in .env
- [ ] Check .gitignore (don't commit .env or ocu_private.pem!)
- [ ] Update NEXT_PUBLIC_APP_URL to production URL
- [ ] Test database migrations
- [ ] Create production seed data (optional)

---

## 🎯 Recommended Path for Hackathon

**For fastest demo:**
1. ✅ Deploy to **Vercel** (5 min)
2. ✅ Keep **SQLite** for now
3. ✅ Add **Claude API key** for working AI (2 min)
4. ✅ Demo publicly accessible app

**For "full Oracle" story:**
1. ✅ Deploy to **OCI Container Instances** (15 min)
2. ✅ Use **Oracle Autonomous Database** (10 min setup)
3. ✅ Demo full Oracle Cloud solution

---

## 🚨 Important: Security

**Before deploying:**

1. **Don't commit secrets**
   ```bash
   # Verify .gitignore includes:
   .env
   .env.local
   *.pem
   ```

2. **Use environment variables** (not hardcoded)
3. **Rotate keys after hackathon**
4. **Enable rate limiting** (add to middleware)

---

## 🎉 Post-Deployment

Once live, share:
- 🌐 Public URL: `https://your-app.vercel.app`
- 📊 Manager Demo: `https://your-app.vercel.app/manager`
- 🎓 Student Demo: `https://your-app.vercel.app/student/onboard`

**For judges:**
- Screenshot analytics dashboard
- Demo video of AI extraction
- Architecture diagram (Oracle Cloud services)

---

## ❓ Which Option Should You Choose?

| Option | Time | Cost | Oracle Focus | Best For |
|--------|------|------|--------------|----------|
| **Vercel** | 5 min | Free | Low | Quick demo |
| **OCI Container** | 15 min | ~$5/month | High | Hackathon judges |
| **OCI Compute** | 30 min | ~$7/month | High | Full control |

**My recommendation:** Start with **Vercel** (5 min), then if you have time, also deploy to **OCI Container Instances** to show full Oracle commitment.

Want help with deployment? Which option do you want to try first?
