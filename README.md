# UniConnect CRM

**AI-powered CRM for cross-center student engagement**

Stop sending spam—send the right opportunity to the right student at the right time, automatically.

---

## 🎯 What This Is

A working MVP university CRM that:
- **Students**: Upload resume → AI extracts interests → get ONE personalized weekly digest (no spam)
- **Managers**: Create event → tag topics → AI finds matched students → track engagement
- **Intelligence**: Learns from student feedback, continuously improving recommendations

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Claude API key from [Anthropic Console](https://console.anthropic.com/)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# 3. Initialize database
npx prisma db push
npm run db:seed

# 4. Start development server
npm run dev
```

Visit **http://localhost:3000**

---

## 📋 Demo Flow (5 minutes)

### As a Student:
1. Go to **Student → Get Started**
2. Fill profile + paste resume text
3. AI extracts interests automatically
4. View personalized digest
5. Give feedback (👍/👎) to refine preferences

### As a Manager:
1. Go to **Center Manager → Create Event**
2. Tag topics (AI, Healthcare, etc.)
3. Set match threshold (how strict)
4. Preview matched students
5. Send campaign → view analytics

---

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: SQLite (dev) / PostgreSQL (prod-ready)
- **AI**: Claude 3.5 Sonnet (Anthropic)
- **ORM**: Prisma

### Core Features

#### ✅ Implemented
- Student onboarding with AI resume parsing
- Interest vector extraction and normalization
- Event creation with topic tagging
- Cosine similarity matching algorithm
- Threshold-based audience targeting
- Weekly digest generation
- Student feedback loop (updates interest weights)
- Manager analytics dashboard
- Cross-center event aggregation

#### 🔜 Production Enhancements (Phase 2)
- SSO integration (SAML/OAuth)
- LinkedIn/SIS data sync
- Production email delivery (SendGrid/Mailgun)
- A/B testing framework
- Advanced segmentation filters
- Calendar integrations

---

## 📂 Project Structure

```
university-ai-crm/
├── src/
│   ├── app/                    # Next.js pages & API routes
│   │   ├── api/               # Backend endpoints
│   │   ├── manager/           # Manager dashboard pages
│   │   ├── student/           # Student portal pages
│   │   └── page.tsx           # Landing page
│   ├── components/            # Reusable UI components
│   ├── lib/                   # Core business logic
│   │   ├── ingest/           # AI extraction engine
│   │   ├── digest/           # Digest generation
│   │   ├── feedback/         # Vector update logic
│   │   ├── scoring.ts        # Matching algorithm
│   │   └── topic-map.ts      # Topic taxonomy
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── seed.ts               # Sample data
└── docs/                     # Documentation
```

---

## 🔧 Key APIs

### Students
- `POST /api/students/onboard` - Onboard new student
- `GET /api/students/[id]` - Get student profile

### Events
- `POST /api/events` - Create new event
- `GET /api/events` - List all events
- `GET /api/events/[id]/score` - Preview audience

### Digest
- `POST /api/digest/generate` - Generate weekly digests
- `GET /api/digest/[studentId]` - Get student's digest

### Interactions
- `POST /api/interactions` - Record feedback (updates vector)

### Analytics
- `GET /api/analytics/summary` - Dashboard metrics

---

## 🧪 Testing the AI

The system uses **Claude 3.5 Sonnet** to extract interests from text.

### Test it:
1. Go to student onboarding
2. Paste this sample resume:
   ```
   MBA student with 5 years in healthcare consulting.
   Built AI-powered diagnostic tool for remote patient monitoring.
   Passionate about climate tech and sustainable supply chains.
   Looking for VC funding for health-tech startup.
   ```
3. Expected extracted topics:
   - AI (high weight)
   - Healthcare (high weight)
   - Climate (medium weight)
   - VC (medium weight)
   - Startups (medium weight)

If Claude API is unavailable, system falls back to keyword matching.

---

## 🎨 Customization

### Add New Topics
Edit `src/lib/topic-map.ts`:
```typescript
export const CANONICAL_TOPICS = [
  // Add your topics
  'Quantum Computing',
  'Biotech',
  // ...
];
```

### Adjust Match Algorithm
Edit `src/lib/scoring.ts` to tweak cosine similarity calculations.

### Change AI Model
Edit `src/lib/ingest/extract.ts`:
```typescript
const message = await anthropic.messages.create({
  model: 'claude-3-opus-20240229', // Change model here
  // ...
});
```

---

## 📊 Database Schema

Key models:
- **Student**: Profile + resume text
- **StudentInterest**: Topic weights (0.0–1.0)
- **Event**: Title, description, date, center
- **EventTopic**: Tagged topics for matching
- **DigestItem**: Ranked events per student per week
- **Interaction**: Feedback (interested/not_relevant/strong_interest)
- **Campaign**: Targeting metadata (threshold, count)

View schema: `prisma/schema.prisma`

---

## 🐛 Troubleshooting

### Database Issues
```bash
# Reset database
rm prisma/dev.db
npx prisma db push
npm run db:seed
```

### API Key Errors
- Verify `.env` has `ANTHROPIC_API_KEY=sk-ant-...`
- Check [console.anthropic.com](https://console.anthropic.com/) for credits

### Build Errors
```bash
# Clear cache
rm -rf .next
npm run build
```

---

## 🚢 Deployment

### Vercel (recommended)
```bash
vercel
```
Add environment variables in Vercel dashboard.

### Database for Production
Switch to PostgreSQL:
1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Update `.env`:
   ```
   DATABASE_URL="postgresql://user:pass@host:5432/dbname"
   ```

---

## 📈 Roadmap

### Immediate (Next 48 hours)
- [ ] Email preview templates
- [ ] Export audience to CSV
- [ ] Student interest editing UI

### Short-term (1–2 weeks)
- [ ] Production email sending
- [ ] Scheduled digest cron job
- [ ] Multi-university support

### Long-term (1–3 months)
- [ ] LinkedIn OAuth integration
- [ ] Mobile app (React Native)
- [ ] Advanced analytics (heatmaps, cohorts)
- [ ] Calendar sync (Google/Outlook)

---

## 🤝 Contributing

This is a working prototype. To extend:
1. Fork repo
2. Create feature branch
3. Add tests (if applicable)
4. Submit PR

---

## 📄 License

MIT License

---

## 🙋 Support

Questions? Check `docs/demo-checklist.md` for step-by-step usage guide.

**Built with ❤️ for better student engagement**
