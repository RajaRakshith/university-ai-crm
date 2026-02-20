# UniConnect CRM

AI-powered student–opportunity matching. Students upload resume and transcript to get a topic profile; professors and posters create postings and see matched students.

## Setup

1. **Environment**  
   Copy `.env.example` to `.env` and set:
   - OCI credentials (Option B: key path, user OCID, fingerprint, tenancy OCID)
   - `OCI_COMPARTMENT_OCID`, `OCI_REGION`, `OCI_OBJECTSTORAGE_NAMESPACE`, `OCI_OBJECTSTORAGE_BUCKET`
   - `DATABASE_URL` (Neon Postgres connection string)

2. **Database**  
   Run:
   ```bash
   npx prisma db push
   ```
   If you see a TLS error with Neon, try running this from your own machine or adjust `DATABASE_URL` (e.g. `?sslmode=require`).

3. **Run**  
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

## Flows

- **Student:** Upload resume + transcript (PDF) → profile page with inferred topics.
- **Poster:** Create a posting (title, description, who you need, optional PDF) → view matched students ranked by similarity.

## OCI

- **Object Storage** and **Document Understanding** use **`OCI_REGION`** (e.g. **us-ashburn-1**). Create your bucket in that region.
- **Generative AI** (embeddings) uses **`OCI_GENAI_REGION`** (default **us-chicago-1**) so the on-demand Cohere Embed English 3 model is available. You can keep your bucket in Ashburn and only GenAI runs in Chicago.

## Tech

- Next.js 15, React 19, Tailwind, Prisma, PostgreSQL (Neon)
