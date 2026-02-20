# Oracle Cloud Deployment Guide

## 🏗️ Oracle Cloud Architecture

**Components:**
- **Compute**: OCI Container Instances (or VM with Node.js)
- **Database**: Oracle Autonomous Database (Always Free tier)
- **AI**: OCI Generative AI Service (Cohere Command)
- **Storage**: Object Storage (for resume uploads)
- **Networking**: VCN + Load Balancer

---

## 🚀 Quick Setup (Hackathon)

### Step 1: Activate Your Oracle Cloud Account

1. Check email for activation link
2. Go to **https://cloud.oracle.com/**
3. Log in with tenancy: `ross_ai_hackathon`
4. Set your password and MFA

### Step 2: Create Autonomous Database (Always Free)

```bash
# In OCI Console > Database > Autonomous Database
1. Click "Create Autonomous Database"
2. Choose "Transaction Processing"
3. Select "Always Free" tier
4. Database name: uniconnect_db
5. Admin password: <create-strong-password>
6. Click "Create"

# Download Wallet
1. DB Actions > Database Connection > Download Wallet
2. Save wallet.zip
3. Extract to project: ./oracle-wallet/
```

### Step 3: Set Up OCI Generative AI

```bash
# In OCI Console > Analytics & AI > Generative AI
1. Enable Generative AI Service
2. Note your compartment OCID
3. Create API key:
   - Profile menu > User Settings
   - API Keys > Add API Key
   - Download private key (save as oci_api_key.pem)
   - Copy config snippet
```

### Step 4: Configure Environment

Create `.env.oracle`:

```env
# Oracle Database
DATABASE_URL="oracle://admin:<password>@<db-host>:1521/<service-name>"
ORACLE_WALLET_PATH="./oracle-wallet"

# Oracle Generative AI
OCI_GENERATIVE_AI_ENABLED=true
OCI_TENANCY_OCID="ocid1.tenancy.oc1..aaaa..."
OCI_USER_OCID="ocid1.user.oc1..aaaa..."
OCI_FINGERPRINT="aa:bb:cc:..."
OCI_PRIVATE_KEY_PATH="./oci_api_key.pem"
OCI_REGION="us-ashburn-1"
OCI_COMPARTMENT_OCID="ocid1.compartment.oc1..aaaa..."

# Generative AI Model
OCI_GENAI_MODEL="cohere.command-r-plus"
OCI_GENAI_ENDPOINT="https://inference.generativeai.us-ashburn-1.oci.oraclecloud.com"

# Fallback to Claude (optional)
ANTHROPIC_API_KEY="sk-ant-..."

# App Config
NEXT_PUBLIC_APP_URL="https://your-app.oraclecloud.com"
```

### Step 5: Deploy Application

**Option A: Container Instances (Recommended)**

```bash
# Build container
docker build -t uniconnect-crm .

# Push to OCI Registry
docker tag uniconnect-crm:latest \
  <region-key>.ocir.io/<tenancy-namespace>/uniconnect-crm:latest

docker push <region-key>.ocir.io/<tenancy-namespace>/uniconnect-crm:latest

# Create Container Instance in OCI Console
# Analytics & AI > Container Instances > Create
```

**Option B: Compute Instance**

```bash
# Create Ubuntu VM in OCI Console
# Compute > Instances > Create Instance
# Shape: VM.Standard.E2.1.Micro (Always Free)

# SSH into instance
ssh -i <your-key> ubuntu@<instance-ip>

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone <your-repo>
cd university-ai-crm

# Install dependencies
npm install

# Build and start
npm run build
npm start
```

---

## 🤖 Oracle Generative AI Integration

The app now supports **Oracle Generative AI** as a drop-in replacement for Claude.

**Benefits:**
- **Free credits** for hackathon
- **Lower latency** (same cloud)
- **Cohere Command R+** model (excellent for extraction)
- **No external API dependencies**

**How it works:**
1. Student uploads resume text
2. App calls OCI Generative AI with prompt
3. Model extracts interests & skills
4. Results stored in Oracle Autonomous DB

**Code location:**
- `src/lib/ingest/extract-oracle.ts` - Oracle GenAI client
- Automatically selected when `OCI_GENERATIVE_AI_ENABLED=true`

---

## 📊 Using Oracle AI Services

### 1. Document Understanding (PDF Resume Upload)

```typescript
// Parse PDF resumes
import { DocumentUnderstandingClient } from 'oci-aiservicedocument';

const client = new DocumentUnderstandingClient({...});
const result = await client.analyzeDocument({
  document: resumePdfBuffer,
  features: ['TEXT_EXTRACTION', 'KEY_VALUE_EXTRACTION']
});
```

### 2. Language Service (Topic Classification)

```typescript
// Classify text into topics
import { AIServiceLanguageClient } from 'oci-ailanguage';

const client = new AIServiceLanguageClient({...});
const result = await client.batchDetectLanguageTextClassification({
  documents: [{ text: resumeText }]
});
```

### 3. Data Science (Custom Matching Model)

```typescript
// Train custom student-event matching model
// OCI Data Science > Notebook Sessions
// Train collaborative filtering model
// Deploy as model deployment endpoint
```

---

## 🗄️ Database Migration to Oracle

### Update Prisma Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "oracle"
  url      = env("DATABASE_URL")
}

// Oracle doesn't support cuid(), use uuid() instead
model Student {
  id String @id @default(uuid())
  // ... rest of schema
}
```

### Run Migration

```bash
# Install Oracle driver
npm install oracledb

# Push schema
npx prisma db push

# Seed data
npm run db:seed
```

---

## 🚀 OCI-Specific Features

### Object Storage for Resume Files

```typescript
import { ObjectStorageClient } from 'oci-objectstorage';

// Upload resume PDF
const client = new ObjectStorageClient({...});
await client.putObject({
  namespaceName: 'your-namespace',
  bucketName: 'resumes',
  objectName: `${studentId}/resume.pdf`,
  putObjectBody: fileBuffer
});
```

### API Gateway for Rate Limiting

```bash
# Create API Gateway in OCI Console
# Deployments > Create Deployment
# Add rate limiting policy: 100 req/min
```

### Load Balancer for High Availability

```bash
# Create Load Balancer
# Networking > Load Balancers > Create
# Add backend servers (multiple container instances)
```

---

## 💰 Cost Optimization (Hackathon Budget)

**Always Free Services:**
- 2 Autonomous Databases (1 OCPU each)
- 2 Compute VMs (VM.Standard.E2.1.Micro)
- 20 GB Object Storage
- 10 GB Outbound Data Transfer

**Paid Services (Use Hackathon Credits):**
- Generative AI: ~$0.003 per 1K tokens
- Container Instances: ~$0.01 per hour
- Load Balancer: ~$0.02 per hour

**Budget Estimate for Hackathon:**
- 10 hours demo/testing: **~$5**
- 500 resume analyses: **~$2**
- **Total: ~$7** (well within hackathon credits)

---

## 🔒 Security Best Practices

### 1. Use OCI Vault for Secrets

```bash
# Store API keys in OCI Vault
# Security > Vault > Create Vault
# Add secret: DB password, API keys
```

### 2. Configure IAM Policies

```bash
# Create policy for app to access AI services
Allow group hackathon_users to use generative-ai-family in compartment ross_ai_hackathon
Allow group hackathon_users to manage autonomous-database-family in compartment ross_ai_hackathon
```

### 3. Enable Cloud Guard

```bash
# Security > Cloud Guard
# Enable default detectors
# Monitor for suspicious activity
```

---

## 📈 Monitoring & Observability

### 1. Application Performance Monitoring (APM)

```bash
# Observability > Application Performance Monitoring
# Create APM Domain
# Instrument Next.js app with APM agent
```

### 2. Logging Analytics

```bash
# Observability > Logging > Log Groups
# Stream app logs to OCI Logging
# Create dashboards for errors/performance
```

### 3. Metrics & Alarms

```bash
# Set up alarms for:
- High error rate (>5%)
- Slow response time (>2s)
- Database CPU (>80%)
```

---

## 🎯 Hackathon Demo Setup

### Quick Deploy Script

```bash
#!/bin/bash
# deploy-oracle.sh

# Build app
npm run build

# Create container
docker build -t uniconnect .

# Push to OCIR
docker push <region>.ocir.io/<namespace>/uniconnect:latest

# Deploy to Container Instance (via OCI CLI)
oci container-instances container-instance create \
  --compartment-id $OCI_COMPARTMENT_OCID \
  --containers file://container-config.json
```

### Test Endpoints

```bash
# Health check
curl https://your-app.oraclecloud.com/api/health

# Test AI extraction
curl -X POST https://your-app.oraclecloud.com/api/students/onboard \
  -H "Content-Type: application/json" \
  -d '{"email":"test@uni.edu","name":"Test","resumeText":"AI healthcare startup founder"}'
```

---

## 🏆 Hackathon Presentation Tips

**Highlight Oracle Integration:**
- "Built entirely on Oracle Cloud - database, AI, compute"
- "Using Oracle Generative AI for intelligent matching"
- "Scales with Oracle's Always Free tier"

**Show Oracle Services in Action:**
1. **Generative AI**: Live demo resume → interests extraction
2. **Autonomous DB**: Show real-time query performance
3. **Object Storage**: Upload resume PDF
4. **Monitoring**: Show APM dashboards

**Architecture Diagram:**
```
Student → Next.js App → Oracle Generative AI
                     ↓
              Autonomous DB
                     ↓
              Object Storage (Resumes)
```

---

## 🚨 Troubleshooting

### Issue: OCI Auth Failed
```bash
# Verify config
cat ~/.oci/config

# Test connection
oci iam region list
```

### Issue: Database Connection Failed
```bash
# Check wallet path
ls oracle-wallet/

# Test connection
sqlplus admin/<password>@<service-name>
```

### Issue: Generative AI Quota Exceeded
```bash
# Check usage
oci generative-ai metrics list

# Request quota increase (for hackathon, limits are high)
```

---

## 📚 Additional Resources

- [OCI Generative AI Docs](https://docs.oracle.com/iaas/Content/generative-ai/overview.htm)
- [Autonomous Database Quick Start](https://docs.oracle.com/iaas/autonomous-database/doc/autonomous-quick-start.html)
- [OCI SDK for Node.js](https://docs.oracle.com/iaas/Content/API/SDKDocs/typescriptsdk.htm)
- [Container Instances](https://docs.oracle.com/iaas/Content/container-instances/home.htm)

---

## ✅ Pre-Demo Checklist

- [ ] Oracle Cloud account activated
- [ ] Autonomous Database created
- [ ] Generative AI enabled
- [ ] App deployed to Container Instance
- [ ] Sample data seeded
- [ ] Test student onboarding works
- [ ] Test event matching works
- [ ] Monitor dashboards configured

**Estimated Setup Time: 45-60 minutes**

---

**Good luck with the Ross AI Hackathon! 🚀**
