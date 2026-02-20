import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import {
  isOciConfigured,
  uploadToObjectStorage,
  extractTextFromDocumentByKey,
  inferTopicsWithGemini,
  createEmbedding,
} from "./oci";
import {
  hashPassword,
  comparePassword,
  validatePassword,
  validateEmail,
  requireAuth,
  requireRole,
  getCurrentUser,
} from "./auth";
import { log } from "./index";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
});

function sanitizeTextForDb(value: string | null | undefined): string | null {
  if (value == null) return null;
  return value.replace(/\0/g, "").trim() || null;
}

/** Fallback: extract text from PDF buffer when OCI Document Understanding is not used or fails. */
async function extractTextFromPdfFallback(buffer: Buffer): Promise<string> {
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: new Uint8Array(buffer) });
    const result = await parser.getText();
    await parser.destroy();
    return typeof (result as { text?: string }).text === "string" ? (result as { text: string }).text : "";
  } catch {
    return buffer.toString("utf-8").replace(/\0/g, "");
  }
}

/** Pattern-based topic extraction (no fixed taxonomy; used when Gemini fails or is unavailable).
 * NOTE: This is a LAST RESORT fallback. Students should use Gemini for unique trait extraction.
 * This pattern matching is intentionally conservative to avoid false positives.
 */
const TOPIC_PATTERNS = [
  "machine learning", "artificial intelligence", "ai/ml", "deep learning",
  "natural language processing", "nlp", "computer vision",
  "data science", "data analytics", "data engineering",
  "software engineering", "web development", "mobile development",
  "cloud computing", "devops", "cybersecurity",
  "blockchain", "cryptocurrency", "fintech",
  "product management", "project management",
  "consulting", "management consulting", "strategy",
  "finance", "investment banking", "private equity", "venture capital",
  "marketing", "digital marketing", "growth",
  "entrepreneurship", "startup",
  "healthcare", "biotech", "pharmaceutical",
  "mechanical engineering", "electrical engineering", "civil engineering",
  "chemical engineering", "aerospace engineering",
  "sustainability", "renewable energy", "climate",
  "research", "academic research",
  "design", "ux design", "ui design", "graphic design",
  "economics", "accounting", "business administration",
  // Programming languages - use word boundaries to avoid false matches
  "python", "javascript", "typescript", "java", "c++",
  "react", "node.js", "aws", "docker", "kubernetes",
];

function extractTopicsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];
  
  for (const pattern of TOPIC_PATTERNS) {
    // Use word boundaries for short patterns to avoid false matches
    // For patterns with spaces or longer patterns, use includes
    if (pattern.length <= 3) {
      // For short patterns like "c++", require word boundaries
      const regex = new RegExp(`\\b${pattern.replace(/\+/g, "\\+")}\\b`, "i");
      if (regex.test(text) && !found.includes(pattern)) {
        found.push(pattern);
      }
    } else {
      // For longer patterns, use includes but be more careful
      if (lower.includes(pattern.toLowerCase()) && !found.includes(pattern)) {
        found.push(pattern);
      }
    }
  }
  
  return found.slice(0, 20);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // ─── Authentication Routes ────────────────────────────────────────────

  // POST /api/auth/register/student
  app.post("/api/auth/register/student", async (req: Request, res: Response) => {
    try {
      const { email, password, name, phoneNumber } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required." });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.error });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists." });
      }

      // Create user account
      const hashedPassword = await hashPassword(password);
      const username = email.split("@")[0]; // Use email prefix as username
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: "student",
      });

      // Create student record
      const student = await storage.createStudent({
        userId: user.id,
        name,
        email,
        phoneNumber: phoneNumber || null,
        resumeObjectUrl: null,
        transcriptObjectUrl: null,
        rawResumeText: null,
        rawTranscriptText: null,
        topics: [],
        embedding: null,
      });

      // Set session
      req.session.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: "student",
      };

      return res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // POST /api/auth/register/organizer
  app.post("/api/auth/register/organizer", async (req: Request, res: Response) => {
    try {
      const { email, password, name } = req.body;

      if (!email || !password || !name) {
        return res.status(400).json({ error: "Email, password, and name are required." });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ error: "Invalid email format." });
      }

      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        return res.status(400).json({ error: passwordValidation.error });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: "User with this email already exists." });
      }

      // Create user account
      const hashedPassword = await hashPassword(password);
      const username = email.split("@")[0];
      const user = await storage.createUser({
        username,
        email,
        password: hashedPassword,
        role: "organizer",
      });

      // Create organizer record
      const organizer = await storage.createOrganizer({
        userId: user.id,
        name,
        email,
      });

      // Set session
      req.session.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: "organizer",
      };

      return res.status(201).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        organizer: {
          id: organizer.id,
          name: organizer.name,
          email: organizer.email,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // POST /api/auth/login
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
      }

      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      const passwordMatch = await comparePassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid email or password." });
      }

      // Set session
      req.session.user = {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
      };

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // POST /api/auth/logout
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      return res.status(200).json({ message: "Logged out successfully" });
    });
  });

  // GET /api/auth/me
  app.get("/api/auth/me", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Get role-specific data
      let profile = null;
      if (user.role === "student") {
        const student = await storage.getStudentByUserId(user.id);
        if (student) {
          profile = {
            id: student.id,
            name: student.name,
            email: student.email,
            phoneNumber: student.phoneNumber,
          };
        }
      } else if (user.role === "organizer") {
        const organizer = await storage.getOrganizerByUserId(user.id);
        if (organizer) {
          profile = {
            id: organizer.id,
            name: organizer.name,
            email: organizer.email,
          };
        }
      }

      return res.status(200).json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        profile,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── POST /api/students/upload ───────────────────────────────────────
  app.post(
    "/api/students/upload",
    requireAuth,
    upload.fields([
      { name: "resume", maxCount: 1 },
      { name: "transcript", maxCount: 1 },
    ]),
    async (req: Request, res: Response) => {
      try {
        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const resumeFile = files?.resume?.[0];
        const transcriptFile = files?.transcript?.[0];

        if (!resumeFile && !transcriptFile) {
          return res.status(400).json({ error: "At least one of resume or transcript is required." });
        }

        if (resumeFile && resumeFile.size > MAX_FILE_SIZE) {
          return res.status(400).json({ error: "Resume file too large (max 10 MB)." });
        }
        if (transcriptFile && transcriptFile.size > MAX_FILE_SIZE) {
          return res.status(400).json({ error: "Transcript file too large (max 10 MB)." });
        }

        const safeName = (s: string) => (sanitizeTextForDb(s) ?? "file").replace(/[/\\]/g, "_");
        let resumeObjectUrl: string | null = null;
        let transcriptObjectUrl: string | null = null;
        let rawResumeText: string | null = null;
        let rawTranscriptText: string | null = null;

        if (resumeFile) {
          const key = `resumes/${safeName(resumeFile.originalname || "resume.pdf")}`;
          if (isOciConfigured()) {
            try {
              await uploadToObjectStorage(key, resumeFile.buffer);
              resumeObjectUrl = key;
              rawResumeText = sanitizeTextForDb(await extractTextFromDocumentByKey(key));
            } catch {
              resumeObjectUrl = key;
            }
          }
          if (!rawResumeText) rawResumeText = sanitizeTextForDb(await extractTextFromPdfFallback(resumeFile.buffer));
          if (!resumeObjectUrl) resumeObjectUrl = key;
        }

        if (transcriptFile) {
          const key = `transcripts/${safeName(transcriptFile.originalname || "transcript.pdf")}`;
          if (isOciConfigured()) {
            try {
              await uploadToObjectStorage(key, transcriptFile.buffer);
              transcriptObjectUrl = key;
              rawTranscriptText = sanitizeTextForDb(await extractTextFromDocumentByKey(key));
            } catch {
              transcriptObjectUrl = key;
            }
          }
          if (!rawTranscriptText) rawTranscriptText = sanitizeTextForDb(await extractTextFromPdfFallback(transcriptFile.buffer));
          if (!transcriptObjectUrl) transcriptObjectUrl = key;
        }

        const combinedText = [rawResumeText, rawTranscriptText].filter(Boolean).join(" ");
        let topics: string[] = [];
        if (combinedText && combinedText.trim().length > 0) {
          // ALWAYS try Gemini first - it should extract unique, specific traits
          // Only use pattern matching if Gemini is not configured or completely fails
          if (isOciConfigured()) {
            topics = await inferTopicsWithGemini(combinedText);
            if (topics.length === 0) {
              console.warn("[Routes] Gemini topic extraction returned empty - this may indicate an OCI configuration issue");
              console.warn("[Routes] Falling back to pattern matching (results will be generic)");
              topics = extractTopicsFromText(combinedText);
            } else {
              console.log(`[Routes] Successfully extracted ${topics.length} unique topics from Gemini`);
            }
          } else {
            console.warn("[Routes] OCI not configured - using pattern matching fallback (results will be generic)");
            topics = extractTopicsFromText(combinedText);
          }
        }
        topics = topics.map((t) => sanitizeTextForDb(t) ?? t).filter(Boolean) as string[];

        let embedding: number[] | null = null;
        if (combinedText && isOciConfigured()) embedding = await createEmbedding(combinedText);

        // RequireAuth ensures we have a user; link student to current user when they're a student
        const user = getCurrentUser(req);
        const userId = user?.role === "student" ? user.id : undefined;

        const student = await storage.createStudent({
          userId,
          name: sanitizeTextForDb(req.body.name as string) ?? null,
          email: sanitizeTextForDb(req.body.email as string) ?? null,
          phoneNumber: sanitizeTextForDb(req.body.phoneNumber as string) ?? null,
          resumeObjectUrl,
          transcriptObjectUrl,
          rawResumeText,
          rawTranscriptText,
          topics,
          embedding,
        });

        return res.status(200).json({ id: student.id, student });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || "Internal server error" });
      }
    }
  );

  // ─── GET /api/students ──────────────────────────────────────────────
  app.get("/api/students", requireRole("organizer"), async (_req: Request, res: Response) => {
    try {
      const students = await storage.getAllStudents();
      const result = students.map((s) => ({
        id: s.id,
        name: s.name,
        email: s.email,
        phoneNumber: s.phoneNumber,
        topics: s.topics,
        rawResumeText: s.rawResumeText,
        rawTranscriptText: s.rawTranscriptText,
        createdAt: s.createdAt,
      }));
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── GET /api/students/:id ──────────────────────────────────────────
  app.get("/api/students/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = getCurrentUser(req);
      const studentId = req.params.id as string;
      const student = await storage.getStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ error: "Student not found." });
      }

      // Students can only view student records that belong to them (by userId)
      if (user?.role === "student") {
        const recordOwnerId = await storage.getStudentUserId(studentId);
        if (recordOwnerId !== user.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      return res.status(200).json({
        id: student.id,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        topics: student.topics,
        rawResumeText: student.rawResumeText,
        rawTranscriptText: student.rawTranscriptText,
        createdAt: student.createdAt,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── PATCH /api/students/:id ───────────────────────────────────────
  app.patch("/api/students/:id", async (req: Request, res: Response) => {
    try {
      const studentId = req.params.id as string;
      const student = await storage.getStudent(studentId);
      if (!student) {
        return res.status(404).json({ error: "Student not found." });
      }

      const updateData: Partial<{ phoneNumber: string | null }> = {};
      if (req.body.phoneNumber !== undefined) {
        updateData.phoneNumber = sanitizeTextForDb(req.body.phoneNumber as string) ?? null;
      }

      const updatedStudent = await storage.updateStudent(studentId, updateData);

      return res.status(200).json({
        id: updatedStudent.id,
        name: updatedStudent.name,
        email: updatedStudent.email,
        phoneNumber: updatedStudent.phoneNumber,
        topics: updatedStudent.topics,
        rawResumeText: updatedStudent.rawResumeText,
        rawTranscriptText: updatedStudent.rawTranscriptText,
        createdAt: updatedStudent.createdAt,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── POST /api/postings ─────────────────────────────────────────────
  app.post(
    "/api/postings",
    requireRole("organizer"),
    upload.fields([{ name: "pdf", maxCount: 1 }]),
    async (req: Request, res: Response) => {
      try {
        const title = req.body.title as string | undefined;
        if (!title || !title.trim()) {
          return res.status(400).json({ error: "Title is required." });
        }

        const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
        const pdfFile = files?.pdf?.[0];

        if (pdfFile && pdfFile.size > MAX_FILE_SIZE) {
          return res.status(400).json({ error: "PDF too large (max 10 MB)." });
        }

        // Extract text from PDF if provided
        let pdfText = "";
        if (pdfFile) {
          if (isOciConfigured()) {
            try {
              const key = `postings/${pdfFile.originalname || "posting.pdf"}`;
              await uploadToObjectStorage(key, pdfFile.buffer);
              pdfText = sanitizeTextForDb(await extractTextFromDocumentByKey(key)) || "";
            } catch {
              pdfText = sanitizeTextForDb(await extractTextFromPdfFallback(pdfFile.buffer)) || "";
            }
          } else {
            pdfText = sanitizeTextForDb(await extractTextFromPdfFallback(pdfFile.buffer)) || "";
          }
        }
        
        const combinedText = [
          title,
          req.body.description || "",
          req.body.whoTheyNeed || "",
          pdfText,
        ].filter(Boolean).join(" ");

        // For postings, use pattern-based extraction (postings don't need unique traits like students)
        const topics = extractTopicsFromText(combinedText);

        // Get organizer from session
        const user = getCurrentUser(req);
        if (!user || user.role !== "organizer") {
          return res.status(403).json({ error: "Organizer access required" });
        }

        const organizer = await storage.getOrganizerByUserId(user.id);
        if (!organizer) {
          return res.status(404).json({ error: "Organizer profile not found" });
        }

        const posting = await storage.createPosting({
          organizerId: organizer.id,
          posterName: organizer.name,
          posterEmail: organizer.email,
          title: title.trim(),
          description: (req.body.description as string) || "",
          whoTheyNeed: (req.body.whoTheyNeed as string) || "",
          optionalPdfObjectUrl: pdfFile ? `postings/${pdfFile.originalname}` : null,
          topics,
          embedding: null,
        });

        return res.status(200).json({ id: posting.id, posting });
      } catch (err: any) {
        return res.status(500).json({ error: err.message || "Internal server error" });
      }
    }
  );

  // ─── GET /api/postings ──────────────────────────────────────────────
  app.get("/api/postings", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = getCurrentUser(req);
      const organizerId = req.query.organizerId as string | undefined;

      let postings;
      if (user?.role === "organizer" && organizerId) {
        // Get organizer's own postings
        const organizer = await storage.getOrganizerByUserId(user.id);
        if (organizer && organizer.id === organizerId) {
          postings = await storage.getPostingsByOrganizer(organizer.id);
        } else {
          postings = await storage.getAllPostings();
        }
      } else {
        postings = await storage.getAllPostings();
      }

      const result = postings.map((p) => ({
        id: p.id,
        title: p.title,
        posterName: p.posterName,
        createdAt: p.createdAt,
      }));
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── GET /api/postings/my-events ───────────────────────────────────
  app.get("/api/postings/my-events", requireRole("organizer"), async (req: Request, res: Response) => {
    try {
      const user = getCurrentUser(req);
      if (!user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const organizer = await storage.getOrganizerByUserId(user.id);
      if (!organizer) {
        return res.status(404).json({ error: "Organizer profile not found" });
      }

      const postings = await storage.getPostingsByOrganizer(organizer.id);
      const result = postings.map((p) => ({
        id: p.id,
        title: p.title,
        posterName: p.posterName,
        createdAt: p.createdAt,
      }));
      return res.status(200).json(result);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── GET /api/postings/:id ──────────────────────────────────────────
  app.get("/api/postings/:id", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const posting = await storage.getPosting(id);
      if (!posting) {
        return res.status(404).json({ error: "Posting not found." });
      }
      return res.status(200).json({
        id: posting.id,
        posterName: posting.posterName,
        posterEmail: posting.posterEmail,
        title: posting.title,
        description: posting.description,
        whoTheyNeed: posting.whoTheyNeed,
        createdAt: posting.createdAt,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── GET /api/postings/:id/match ────────────────────────────────────
  app.get("/api/postings/:id/match", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const posting = await storage.getPosting(id);
      if (!posting) {
        return res.status(404).json({ error: "Posting not found." });
      }
      const matches = await storage.getMatchesForPosting(id);
      return res.status(200).json({ matches });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── GET /api/students/:id/campaigns ────────────────────────────────
  app.get("/api/students/:id/campaigns", requireAuth, async (req: Request, res: Response) => {
    try {
      const user = getCurrentUser(req);
      const studentId = req.params.id as string;
      const student = await storage.getStudent(studentId);
      
      if (!student) {
        return res.status(404).json({ error: "Student not found." });
      }

      // Students can only view campaigns for student records that belong to them
      if (user?.role === "student") {
        const recordOwnerId = await storage.getStudentUserId(studentId);
        if (recordOwnerId !== user.id) {
          return res.status(403).json({ error: "Access denied" });
        }
      }

      const campaigns = await storage.getCampaignsForStudent(studentId);
      return res.status(200).json({ campaigns });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── GET /api/students/:id/match ────────────────────────────────────
  app.get("/api/students/:id/match", async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const student = await storage.getStudent(id);
      if (!student) {
        return res.status(404).json({ error: "Student not found." });
      }
      const matches = await storage.getMatchesForStudent(id);
      return res.status(200).json({ matches });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── Campaign Routes ────────────────────────────────────────────────

  // ─── POST /api/campaigns ─────────────────────────────────────────────
  app.post("/api/campaigns", requireRole("organizer"), async (req: Request, res: Response) => {
    // VERY OBVIOUS LOG TO TEST IF ROUTE IS BEING HIT
    console.error("\n\n\n");
    console.error("========================================");
    console.error("CAMPAIGN ROUTE HIT! CAMPAIGN ROUTE HIT!");
    console.error("========================================");
    console.error("\n\n\n");
    
    const requestId = Math.random().toString(36).substring(7);
    console.log(`\n🔵 [${requestId}] ========== POST /api/campaigns START ==========`);
    console.log(`🔵 [${requestId}] Request body:`, JSON.stringify(req.body, null, 2));
    console.log(`🔵 [${requestId}] Content-Type header:`, req.headers["content-type"]);
    
    try {
      const { name, postingId, personalizedMessage, studentIds, deliveryChannel = "sms" } = req.body;
      console.log(`🔵 [${requestId}] Extracted values:`, { name, postingId, messageLen: personalizedMessage?.length, studentIds: studentIds?.length, channel: deliveryChannel });

      if (!name || !name.trim()) {
        console.log(`🔴 [${requestId}] Validation failed: Campaign name is required`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: "Campaign name is required." });
      }

      if (!postingId) {
        console.log(`🔴 [${requestId}] Validation failed: Posting ID is required`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: "Posting ID is required." });
      }

      if (!personalizedMessage || !personalizedMessage.trim()) {
        console.log(`🔴 [${requestId}] Validation failed: Personalized message is required`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: "Personalized message is required for SMS campaigns." });
      }

      if (!Array.isArray(studentIds) || studentIds.length === 0) {
        console.log(`🔴 [${requestId}] Validation failed: No students selected`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: "At least one student must be selected." });
      }

      console.log(`🟡 [${requestId}] Step 1: Fetching posting ${postingId}...`);
      // Get posting to get organizer email
      const posting = await storage.getPosting(postingId);
      if (!posting) {
        console.log(`🔴 [${requestId}] Posting not found: ${postingId}`);
        res.setHeader("Content-Type", "application/json");
        return res.status(404).json({ error: "Posting not found." });
      }
      console.log(`🟢 [${requestId}] Posting found: ${posting.title} (${posting.posterEmail})`);

      console.log(`🟡 [${requestId}] Step 2: Fetching all students...`);
      // Filter students to only those with phone numbers
      const allStudents = await storage.getAllStudents();
      console.log(`🟢 [${requestId}] Total students in database: ${allStudents.length}`);
      
      const studentsWithPhones = studentIds.filter((id: string) => {
        const student = allStudents.find((s) => s.id === id);
        const hasPhone = student && student.phoneNumber && student.phoneNumber.trim().length > 0;
        if (!hasPhone && student) {
          console.log(`🟡 [${requestId}] Student ${id} (${student.name || student.email}) has no phone number`);
        }
        return hasPhone;
      });

      console.log(`🟢 [${requestId}] Selected ${studentIds.length} students, ${studentsWithPhones.length} have phone numbers`);

      if (studentsWithPhones.length === 0) {
        console.log(`🔴 [${requestId}] No students with phone numbers found`);
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ 
          error: "No selected students have phone numbers. Please ensure students have phone numbers added to their profiles.",
          selectedCount: studentIds.length,
          totalStudents: allStudents.length
        });
      }

      console.log(`🟡 [${requestId}] Step 3: Checking rate limit for organizer: ${posting.posterEmail}...`);
      // Check rate limit
      const organizerId = posting.posterEmail;
      const canSend = await storage.checkSmsLimit(organizerId, studentsWithPhones.length);
      console.log(`🟢 [${requestId}] Rate limit check: canSend=${canSend}`);
      
      if (!canSend) {
        const usage = await storage.getSmsUsage(organizerId);
        console.log(`🔴 [${requestId}] Rate limit exceeded: ${usage.used}/${usage.limit}`);
        res.setHeader("Content-Type", "application/json");
        return res.status(429).json({
          error: `Rate limit exceeded. You have used ${usage.used}/${usage.limit} SMS this month.`,
          usage,
        });
      }

      console.log(`🟡 [${requestId}] Step 4: Creating campaign...`);
      // Create campaign
      let campaign;
      try {
        const campaignData = {
          name,
          postingId,
          strategy: "initial",
          status: "draft",
          deliveryChannel,
          subject: null,
          content: null,
          personalizedMessage,
          imageUrl: null,
          scheduledAt: null,
          sentAt: null,
          targetSize: studentsWithPhones.length.toString(),
          selectedInterests: [],
          studentsTargeted: studentsWithPhones.length.toString(),
          studentsSent: "0",
          studentsOpened: "0",
          studentsClicked: "0",
          studentsSignedUp: "0",
        };
        console.log(`🟡 [${requestId}] Campaign data:`, JSON.stringify(campaignData, null, 2));
        console.log(`🟡 [${requestId}] Student IDs to link:`, studentsWithPhones);
        
        campaign = await storage.createCampaign(campaignData, studentsWithPhones);
        console.log(`🟢 [${requestId}] ✅ Campaign created successfully: ${campaign.id}`);
        console.log(`🟢 [${requestId}] Campaign object:`, JSON.stringify(campaign, null, 2));
      } catch (createErr: any) {
        console.error(`🔴 [${requestId}] ❌ Error creating campaign:`, createErr);
        console.error(`🔴 [${requestId}] Error message:`, createErr?.message);
        console.error(`🔴 [${requestId}] Error stack:`, createErr?.stack);
        throw createErr;
      }

      console.log(`🟡 [${requestId}] Step 5: Preparing response...`);
      // Return the campaign directly instead of fetching again
      // This avoids potential issues with getCampaign if there are schema mismatches
      const responseData = { campaign: { ...campaign, posting } };
      console.log(`🟢 [${requestId}] Response data prepared, campaignId=${campaign.id}`);
      console.log(`🟢 [${requestId}] Response preview:`, JSON.stringify(responseData).substring(0, 300));
      
      console.log(`🟡 [${requestId}] Step 6: Sending response...`);
      console.log(`🟡 [${requestId}] Setting Content-Type header...`);
      res.setHeader("Content-Type", "application/json");
      console.log(`🟡 [${requestId}] Setting status to 200...`);
      res.status(200);
      console.log(`🟡 [${requestId}] Calling res.json()...`);
      const jsonResponse = res.json(responseData);
      console.log(`🟢 [${requestId}] ✅ Response sent successfully`);
      console.log(`🟢 [${requestId}] ========== POST /api/campaigns END (SUCCESS) ==========\n`);
      return jsonResponse;
    } catch (err: any) {
      console.error(`\n🔴 [${requestId}] ❌ ========== POST /api/campaigns ERROR ==========`);
      console.error(`🔴 [${requestId}] Error type:`, err?.constructor?.name);
      console.error(`🔴 [${requestId}] Error message:`, err?.message);
      console.error(`🔴 [${requestId}] Error stack:`, err?.stack);
      console.error(`🔴 [${requestId}] Full error:`, err);
      
      const errorMessage = err?.message || "Internal server error";
      res.setHeader("Content-Type", "application/json");
      
      // Check if it's a database schema error
      if (errorMessage.includes("column") || errorMessage.includes("does not exist") || errorMessage.includes("relation")) {
        console.error(`🔴 [${requestId}] Database schema error detected`);
        return res.status(500).json({ 
          error: "Database schema error. Please run database migrations to add the required columns.",
          details: errorMessage 
        });
      }
      
      console.error(`🔴 [${requestId}] Returning error response:`, errorMessage);
      console.error(`🔴 [${requestId}] ========== POST /api/campaigns END (ERROR) ==========\n`);
      return res.status(500).json({ error: errorMessage });
    }
  });

  // ─── GET /api/campaigns ──────────────────────────────────────────────
  app.get("/api/campaigns", requireAuth, async (req: Request, res: Response) => {
    try {
      const campaigns = await storage.getAllCampaigns();
      return res.status(200).json(campaigns);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── GET /api/campaigns/:id ──────────────────────────────────────────
  app.get("/api/campaigns/:id", async (req: Request, res: Response) => {
    try {
      const campaign = await storage.getCampaign(req.params.id as string);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found." });
      }
      return res.status(200).json(campaign);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── POST /api/campaigns/:id/send ────────────────────────────────────
  app.post("/api/campaigns/:id/send", requireRole("organizer"), async (req: Request, res: Response) => {
    try {
      const campaignId = req.params.id as string;
      const campaign = await storage.getCampaign(campaignId);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found." });
      }

      if (campaign.status === "running" || campaign.status === "completed") {
        return res.status(400).json({ error: "Campaign has already been sent." });
      }

      if (!campaign.personalizedMessage) {
        return res.status(400).json({ error: "Campaign message is missing." });
      }

      // Get campaign students
      const campaignStudents = await storage.getCampaignStudents(campaignId);
      const allStudents = await storage.getAllStudents();
      const studentsToSend = campaignStudents
        .map((cs) => allStudents.find((s) => s.id === cs.studentId))
        .filter((s): s is typeof s & { phoneNumber: string } => s !== undefined && !!s.phoneNumber);

      if (studentsToSend.length === 0) {
        return res.status(400).json({ error: "No students with phone numbers to send to." });
      }

      // Check rate limit
      const organizerId = campaign.posting.posterEmail;
      const canSend = await storage.checkSmsLimit(organizerId, studentsToSend.length);
      if (!canSend) {
        const usage = await storage.getSmsUsage(organizerId);
        return res.status(429).json({
          error: `Rate limit exceeded. You have used ${usage.used}/${usage.limit} SMS this month.`,
          usage,
        });
      }

      // Import SMS functions
      const { sendSms, personalizeMessage } = await import("./sms");

      // Send SMS to each student
      let sentCount = 0;
      const errors: string[] = [];

      for (const student of studentsToSend) {
        try {
          const personalizedMsg = personalizeMessage(
            campaign.personalizedMessage!,
            student,
            campaign.posting
          );
          await sendSms(student.phoneNumber!, personalizedMsg);
          
          // Update campaign student record
          await storage.updateCampaignStudent(campaignId, student.id, {
            sent: true,
            sentAt: new Date().toISOString(),
          });
          sentCount++;
        } catch (err: any) {
          errors.push(`Failed to send to ${student.name || student.email}: ${err.message}`);
        }
      }

      // Record SMS usage
      await storage.recordSmsUsage(organizerId, sentCount);

      // Update campaign status
      await storage.updateCampaign(campaignId, {
        status: "running",
        studentsSent: sentCount.toString(),
        sentAt: new Date().toISOString(),
      });

      return res.status(200).json({
        success: true,
        sent: sentCount,
        total: studentsToSend.length,
        errors: errors.length > 0 ? errors : undefined,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  // ─── GET /api/campaigns/rate-limit ───────────────────────────────────
  app.get("/api/campaigns/rate-limit", requireRole("organizer"), async (req: Request, res: Response) => {
    try {
      const organizerEmail = req.query.organizerEmail as string;
      if (!organizerEmail) {
        return res.status(400).json({ error: "organizerEmail query parameter is required." });
      }

      const usage = await storage.getSmsUsage(organizerEmail);
      return res.status(200).json(usage);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || "Internal server error" });
    }
  });

  return httpServer;
}
