# UniConnect CRM – Backend API Reference

**Use this document as the single source of truth** when building another frontend (web, mobile, CLI) against this backend. It compiles all routes, request/response shapes, and business rules.

---

## Contents

1. [API at a glance](#api-at-a-glance)
2. [Base URL and content types](#base-url-and-content-types)
3. [Data models](#data-models)
4. [Environment variables (server-side)](#environment-variables-server-side)
5. [Students](#students)
6. [Postings](#postings)
7. [Matching](#matching)
8. [Errors](#errors)
9. [Business logic (what the backend does)](#business-logic-what-the-backend-does)
10. [Using this with another frontend](#using-this-with-another-frontend)

---

## API at a glance

| Method | Path | Description |
|--------|------|-------------|
| POST   | `/api/students/upload`     | Create student (resume/transcript PDFs → topics + optional embedding) |
| GET    | `/api/students/[id]`      | Get one student by id |
| POST   | `/api/postings`            | Create posting (title + description + optional PDF) |
| GET    | `/api/postings`            | List all postings (id, title, posterName, createdAt) |
| GET    | `/api/postings/[id]`       | Get one posting by id |
| GET    | `/api/postings/[id]/match` | Get students ranked by match score for this posting |

All responses are JSON. POSTs that accept files use **multipart/form-data**.

---

## Base URL and content types

- **Base URL:** Your backend origin (e.g. `http://localhost:3000` or your deployed URL). All API routes live under `/api/`.
- **Responses:** Always `Content-Type: application/json`.
- **Requests with files:** `Content-Type: multipart/form-data`. Do not set `Content-Type` manually when sending `FormData`; the browser/runtime will set the boundary.

---

## Data models

### Student

| Field                 | Type             | Notes |
|-----------------------|------------------|--------|
| `id`                  | string           | CUID, returned on create |
| `name`                | string \| null   | Optional |
| `email`               | string \| null   | Optional |
| `resumeObjectUrl`     | string \| null   | OCI Object Storage key (e.g. `resumes/xxx.pdf`) |
| `transcriptObjectUrl` | string \| null   | OCI Object Storage key |
| `rawResumeText`       | string \| null   | Text extracted from resume PDF |
| `rawTranscriptText`   | string \| null   | Text extracted from transcript PDF |
| `topics`              | string[]         | Free-form expertise areas (e.g. `["mechanical engineering", "Python", "research"]`) |
| `embedding`           | number[] \| null | Optional; present only if OCI embed API succeeded (us-chicago-1) |
| `createdAt`           | string           | ISO 8601 date |

### Posting

| Field                  | Type             | Notes |
|------------------------|------------------|--------|
| `id`                   | string           | CUID |
| `posterName`           | string           | |
| `posterEmail`          | string           | Can be empty |
| `title`                | string           | |
| `description`          | string           | Can be empty |
| `whoTheyNeed`          | string           | Can be empty |
| `optionalPdfObjectUrl` | string \| null   | OCI key if PDF was uploaded |
| `topics`               | string[]         | Free-form, from title + description + PDF text |
| `embedding`            | number[] \| null | Optional |
| `createdAt`            | string           | ISO 8601 |

### Match item (student with score)

Returned in `GET /api/postings/[id]/match`. Each element:

| Field   | Type           |
|---------|----------------|
| `id`    | string (student id) |
| `name`  | string \| null |
| `email` | string \| null |
| `topics`| string[]       |
| `score` | number (0–1, higher = better match) |

**Topics (students and postings):** Free-form strings. No fixed taxonomy. Inferred by Gemini (students) or pattern extraction (postings). Matching uses **exact or substring** overlap (e.g. `"mechanical"` matches `"mechanical engineering"`).

---

## Environment variables (server-side)

The **backend** needs these (e.g. in `.env`). A different frontend does **not** set them; only the server that runs this API does.

| Variable                       | Required | Description |
|--------------------------------|----------|-------------|
| `DATABASE_URL`                 | Yes      | PostgreSQL connection string (e.g. Neon with `?sslmode=require`) |
| `OCI_PRIVATE_KEY_PATH`         | Yes*     | Path to PEM key (e.g. `./keys/oci_key.pem`) |
| `OCI_USER_OCID`                | Yes*     | OCI user OCID |
| `OCI_FINGERPRINT`              | Yes*     | Key fingerprint |
| `OCI_TENANCY_OCID`             | Yes*     | Tenancy OCID |
| `OCI_COMPARTMENT_OCID`         | Yes*     | Compartment for OCI resources |
| `OCI_REGION`                   | No       | Default `us-ashburn-1` (Object Storage, Document Understanding, Gemini chat) |
| `OCI_GENAI_REGION`             | No       | Default `us-chicago-1` (embeddings only; often 401 until IAM is set) |
| `OCI_OBJECTSTORAGE_NAMESPACE`  | Yes*     | Object Storage namespace |
| `OCI_OBJECTSTORAGE_BUCKET`     | Yes*     | Bucket name (e.g. `uniconnect-uploads`) |

\* Required for any flow that uses OCI (upload, document extraction, Gemini, embeddings).

---

## Students

### POST /api/students/upload

Create a student profile from resume and/or transcript PDFs. Backend: extracts text (OCI Document Understanding), infers **free-form topics** (Gemini 2.5 Flash in us-ashburn-1), optionally computes **embedding** (OCI GenAI us-chicago-1; skipped on 401). Student is always created; if embedding fails, matching uses topics only.

**Request:** `POST`, body = `multipart/form-data`.

| Field         | Type   | Required | Notes |
|---------------|--------|----------|--------|
| `name`        | string | No       | Student name |
| `email`       | string | No       | Student email |
| `resume`      | File   | No*      | PDF, max 10 MB. *At least one of `resume` or `transcript` required.* |
| `transcript`  | File   | No*      | PDF, max 10 MB. *At least one of `resume` or `transcript` required.* |

**Success (200):**

```json
{
  "id": "<cuid>",
  "student": {
    "id": "<cuid>",
    "name": "...",
    "email": "...",
    "resumeObjectUrl": "resumes/...",
    "transcriptObjectUrl": "transcripts/...",
    "rawResumeText": "...",
    "rawTranscriptText": "...",
    "topics": ["mechanical engineering", "Python", "research"],
    "embedding": [0.1, -0.2, ...],
    "createdAt": "2026-02-20T..."
  }
}
```

`embedding` may be `null` if the embed API is unavailable (e.g. 401). Matching still works via topics.

**Errors:**

| Status | Body |
|--------|------|
| 400 | `{ "error": "At least one of resume or transcript is required." }` |
| 400 | `{ "error": "Resume file too large (max 10 MB)." }` |
| 400 | `{ "error": "Transcript file too large (max 10 MB)." }` |
| 500 | `{ "error": "<message>" }` |

---

### GET /api/students/[id]

Fetch one student. Path parameter: `id` (student CUID). Does **not** return `resumeObjectUrl`, `transcriptObjectUrl`, or `embedding`.

**Success (200):**

```json
{
  "id": "<cuid>",
  "name": "...",
  "email": "...",
  "topics": ["..."],
  "rawResumeText": "...",
  "rawTranscriptText": "...",
  "createdAt": "2026-02-20T..."
}
```

**Errors:** 404 `{ "error": "Student not found." }`

---

## Postings

### POST /api/postings

Create a posting. Backend infers **free-form topics** from title + description + whoTheyNeed + optional PDF (pattern-based extraction). Optionally computes embedding (skipped on failure).

**Request:** `POST`, body = `multipart/form-data`.

| Field         | Type   | Required | Notes |
|---------------|--------|----------|--------|
| `posterName`  | string | No       | Default `"Unknown"` |
| `posterEmail` | string | No       | |
| `title`       | string | Yes      | |
| `description` | string | No       | |
| `whoTheyNeed` | string | No       | |
| `pdf`         | File   | No       | PDF, max 10 MB. Text used for topics + embedding. |

**Success (200):**

```json
{
  "id": "<cuid>",
  "posting": {
    "id": "<cuid>",
    "posterName": "...",
    "posterEmail": "...",
    "title": "...",
    "description": "...",
    "whoTheyNeed": "...",
    "optionalPdfObjectUrl": "postings/..." | null,
    "topics": ["research", "mechanical engineering", ...],
    "embedding": [0.1, ...] | null,
    "createdAt": "2026-02-20T..."
  }
}
```

**Errors:** 400 `{ "error": "Title is required." }` | 400 `{ "error": "PDF too large (max 10 MB)." }` | 500

---

### GET /api/postings

List all postings. Returns only `id`, `title`, `posterName`, `createdAt`.

**Success (200):**

```json
[
  { "id": "<cuid>", "title": "...", "posterName": "...", "createdAt": "..." },
  ...
]
```

---

### GET /api/postings/[id]

Fetch one posting. Path parameter: `id`. Does **not** return `optionalPdfObjectUrl`, `topics`, or `embedding`.

**Success (200):** `{ "id", "posterName", "posterEmail", "title", "description", "whoTheyNeed", "createdAt" }`

**Errors:** 404 `{ "error": "Posting not found." }`

---

## Matching

### GET /api/postings/[id]/match

Get students ranked by fit for this posting. Path parameter: posting `id`.

**Logic:**

- If the posting has an **embedding** and at least one student has an **embedding** → rank by **cosine similarity** (embedding distance).
- Else if the posting has **topics** → rank by **topic overlap** (free-form; match = exact or substring, e.g. "mechanical" ↔ "mechanical engineering"). Score = (number of posting topics that match at least one student topic) / (number of posting topics).
- Else → `matches: []`.

**Success (200):**

```json
{
  "matches": [
    {
      "id": "<student-id>",
      "name": "...",
      "email": "...",
      "topics": ["mechanical engineering", "research"],
      "score": 0.85
    },
    ...
  ]
}
```

`score` is 0–1; higher = better match. Order is best first.

**Errors:** 404 `{ "error": "Posting not found." }`

---

## Errors

- All error bodies are JSON: `{ "error": "<string>" }`.
- **400** – Validation (missing/invalid input, file too large).
- **404** – Resource not found (invalid or deleted id).
- **500** – Server/OCI/DB error; `error` may be generic.

---

## Business logic (what the backend does)

1. **Student upload**
   - At least one of resume or transcript (PDF, max 10 MB each).
   - Text extracted with **OCI Document Understanding** (us-ashburn-1).
   - **Topics:** **Gemini 2.5 Flash** (us-ashburn-1), free-form phrases from resume + transcript. If Gemini fails, **pattern-based** extraction from text (no fixed list).
   - **Embedding:** OCI GenAI embed (us-chicago-1). On failure (e.g. 401), embedding is `null`; student is still saved; matching uses topics only.
   - Files stored in OCI Object Storage; DB stores student + topics + optional embedding.

2. **Posting create**
   - Title required. Optional PDF (max 10 MB).
   - **Topics:** **Pattern-based** free-form extraction from title + description + whoTheyNeed + PDF text (no fixed list).
   - **Embedding:** Same as student; optional, skipped on failure.

3. **Matching**
   - Prefer **embedding similarity** when posting and some students have embeddings.
   - Else **topic overlap**: free-form topics, match by exact or substring (case-insensitive). Score = fraction of posting topics that have at least one matching student topic.
   - If no posting topics and no embeddings, returns `[]`.

4. **Topics**
   - **No hardcoded list.** Students: Gemini (or pattern fallback). Postings: pattern extraction. Stored and matched as free-form strings with substring matching.

5. **File limits**
   - 10 MB per file (resume, transcript, posting PDF).

---

## Using this with another frontend

### Base URL

- Point all requests to the same origin as this backend (e.g. `https://your-app.vercel.app` or `http://localhost:3000`). Paths are under `/api/` as in the table above.

### Form field names (must match)

- **Student upload:** `name`, `email`, `resume`, `transcript`. At least one of `resume` or `transcript` must be a non-empty file.
- **Posting create:** `posterName`, `posterEmail`, `title`, `description`, `whoTheyNeed`, `pdf`. `title` required; `pdf` optional.

### Sending files

- Use `FormData`. Append files with the field names above (e.g. `formData.append("resume", file)`). Do not set `Content-Type` header when sending `FormData`; the client will set `multipart/form-data` with boundary.
- File type: PDF preferred; backend uses OCI Document Understanding for text extraction.

### After student upload

- On 200, use `response.id` or `response.student.id` to navigate to the student profile (e.g. `/student/profile?id=<id>`). The API does not define frontend routes; your UI can use any path.

### After posting create

- On 200, use `response.id` or `response.posting.id` for the new posting. To show matched students, call `GET /api/postings/<id>/match`.

### CORS

- If the new frontend is on a different origin, the backend must allow that origin in CORS. This backend does not set CORS by default; add headers or a CORS middleware if needed for cross-origin requests.

### Embedding 401

- If OCI GenAI embed (us-chicago-1) returns 401, the backend still creates the student/posting and returns 200. `embedding` will be `null`. Matching uses topic overlap only. No frontend change required.

---

**End of Backend API Reference.** Use this file as the contract for any new UI: same base URL, same routes, same request/response shapes and form field names.
