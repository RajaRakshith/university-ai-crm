import { eq, desc, and, inArray } from "drizzle-orm";
import { randomUUID } from "crypto";
import { db } from "./db";
import { users, organizers, students, postings, campaigns, campaignStudents, organizerSmsUsage } from "@shared/schema";

// ---- Data Models (API shapes) ----

export interface StudentRecord {
  id: string;
  name: string | null;
  email: string | null;
  phoneNumber: string | null;
  resumeObjectUrl: string | null;
  transcriptObjectUrl: string | null;
  rawResumeText: string | null;
  rawTranscriptText: string | null;
  topics: string[];
  embedding: number[] | null;
  createdAt: string;
}

export interface PostingRecord {
  id: string;
  posterName: string;
  posterEmail: string;
  title: string;
  description: string;
  whoTheyNeed: string;
  optionalPdfObjectUrl: string | null;
  topics: string[];
  embedding: number[] | null;
  createdAt: string;
}

export interface MatchItem {
  id: string;
  name: string | null;
  email: string | null;
  topics: string[];
  score: number;
}

export interface PostingMatchItem {
  id: string;
  title: string;
  posterName: string;
  topics: string[];
  score: number;
}

export interface CampaignRecord {
  id: string;
  name: string;
  postingId: string;
  strategy: string;
  status: string;
  deliveryChannel: string;
  subject: string | null;
  content: string | null;
  personalizedMessage: string | null;
  imageUrl: string | null;
  scheduledAt: string | null;
  sentAt: string | null;
  targetSize: string | null;
  selectedInterests: string[];
  studentsTargeted: string;
  studentsSent: string;
  studentsOpened: string;
  studentsClicked: string;
  studentsSignedUp: string;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignWithPosting extends CampaignRecord {
  posting: PostingRecord;
}

export interface CampaignStudentRecord {
  id: string;
  campaignId: string;
  studentId: string;
  sent: boolean;
  opened: boolean;
  clicked: boolean;
  signedUp: boolean;
  sentAt: string | null;
  openedAt: string | null;
  clickedAt: string | null;
  signedUpAt: string | null;
  createdAt: string;
}

export interface OrganizerRecord {
  id: string;
  userId: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface UserRecord {
  id: string;
  username: string;
  email: string;
  password: string;
  role: "student" | "organizer";
  createdAt: string;
}

// ---- Storage Interface ----

export interface IStorage {
  createStudent(data: Omit<StudentRecord, "id" | "createdAt">): Promise<StudentRecord>;
  getStudent(id: string): Promise<StudentRecord | undefined>;
  getAllStudents(): Promise<StudentRecord[]>;
  updateStudent(id: string, data: Partial<StudentRecord>): Promise<StudentRecord>;

  createPosting(data: Omit<PostingRecord, "id" | "createdAt">): Promise<PostingRecord>;
  getPosting(id: string): Promise<PostingRecord | undefined>;
  getAllPostings(): Promise<PostingRecord[]>;

  getMatchesForPosting(postingId: string): Promise<MatchItem[]>;
  getMatchesForStudent(studentId: string): Promise<PostingMatchItem[]>;

  // Campaign methods
  createCampaign(data: Omit<CampaignRecord, "id" | "createdAt" | "updatedAt">, studentIds: string[]): Promise<CampaignRecord>;
  getCampaign(id: string): Promise<CampaignWithPosting | undefined>;
  getAllCampaigns(): Promise<CampaignWithPosting[]>;
  updateCampaign(id: string, data: Partial<CampaignRecord>): Promise<CampaignRecord>;
  getCampaignStudents(campaignId: string): Promise<CampaignStudentRecord[]>;
  updateCampaignStudent(campaignId: string, studentId: string, data: Partial<CampaignStudentRecord>): Promise<void>;

  // Rate limiting methods
  getSmsUsage(organizerId: string): Promise<{ used: number; limit: number }>;
  recordSmsUsage(organizerId: string, count: number): Promise<void>;
  checkSmsLimit(organizerId: string, count: number): Promise<boolean>;

  // User and organizer methods
  createUser(data: { username: string; email: string; password: string; role: "student" | "organizer" }): Promise<UserRecord>;
  getUserByEmail(email: string): Promise<UserRecord | undefined>;
  getUserById(id: string): Promise<UserRecord | undefined>;
  createOrganizer(data: { userId: string; name: string; email: string }): Promise<OrganizerRecord>;
  getOrganizerByUserId(userId: string): Promise<OrganizerRecord | undefined>;
  getOrganizerByEmail(email: string): Promise<OrganizerRecord | undefined>;
  getPostingsByOrganizer(organizerId: string): Promise<PostingRecord[]>;
  getStudentByUserId(userId: string): Promise<StudentRecord | undefined>;
  getStudentUserId(studentId: string): Promise<string | null>;
  getCampaignsForStudent(studentId: string): Promise<CampaignWithPosting[]>;
}

// ---- Helper ----

function stripNullBytes(s: string | null | undefined): string | null {
  if (s == null) return null;
  const out = s.replace(/\0/g, "").trim();
  return out === "" ? null : out;
}

function toIso(d: Date | string | null): string {
  if (!d) return new Date().toISOString();
  return typeof d === "string" ? d : d.toISOString();
}

// ---- PostgreSQL Implementation ----

export class DatabaseStorage implements IStorage {
  async createStudent(data: Omit<StudentRecord, "id" | "createdAt"> & { userId?: string }): Promise<StudentRecord> {
    const topics = (data.topics ?? []).map((t) => (typeof t === "string" ? t.replace(/\0/g, "").trim() : "")).filter(Boolean);
    const [row] = await db
      .insert(students)
      .values({
        id: randomUUID(),
        userId: data.userId || null,
        name: stripNullBytes(data.name),
        email: stripNullBytes(data.email),
        phoneNumber: data.phoneNumber != null ? stripNullBytes(data.phoneNumber) : null,
        resumeObjectUrl: data.resumeObjectUrl != null ? stripNullBytes(data.resumeObjectUrl) : null,
        transcriptObjectUrl: data.transcriptObjectUrl != null ? stripNullBytes(data.transcriptObjectUrl) : null,
        rawResumeText: data.rawResumeText != null ? stripNullBytes(data.rawResumeText) : null,
        rawTranscriptText: data.rawTranscriptText != null ? stripNullBytes(data.rawTranscriptText) : null,
        topics,
        embedding: data.embedding,
      })
      .returning();

    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phoneNumber: row.phoneNumber,
      resumeObjectUrl: row.resumeObjectUrl,
      transcriptObjectUrl: row.transcriptObjectUrl,
      rawResumeText: row.rawResumeText,
      rawTranscriptText: row.rawTranscriptText,
      topics: (row.topics ?? []) as string[],
      embedding: (row.embedding ?? null) as number[] | null,
      createdAt: toIso(row.createdAt),
    };
  }

  async getStudent(id: string): Promise<StudentRecord | undefined> {
    const [row] = await db.select().from(students).where(eq(students.id, id));
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phoneNumber: row.phoneNumber,
      resumeObjectUrl: row.resumeObjectUrl,
      transcriptObjectUrl: row.transcriptObjectUrl,
      rawResumeText: row.rawResumeText,
      rawTranscriptText: row.rawTranscriptText,
      topics: (row.topics ?? []) as string[],
      embedding: (row.embedding ?? null) as number[] | null,
      createdAt: toIso(row.createdAt),
    };
  }

  async getAllStudents(): Promise<StudentRecord[]> {
    const rows = await db.select().from(students).orderBy(desc(students.createdAt));
    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phoneNumber: row.phoneNumber,
      resumeObjectUrl: row.resumeObjectUrl,
      transcriptObjectUrl: row.transcriptObjectUrl,
      rawResumeText: row.rawResumeText,
      rawTranscriptText: row.rawTranscriptText,
      topics: (row.topics ?? []) as string[],
      embedding: (row.embedding ?? null) as number[] | null,
      createdAt: toIso(row.createdAt),
    }));
  }

  async updateStudent(id: string, data: Partial<StudentRecord>): Promise<StudentRecord> {
    const updateData: any = {};
    
    if (data.name !== undefined) updateData.name = stripNullBytes(data.name);
    if (data.email !== undefined) updateData.email = stripNullBytes(data.email);
    if (data.phoneNumber !== undefined) updateData.phoneNumber = stripNullBytes(data.phoneNumber);
    if (data.resumeObjectUrl !== undefined) updateData.resumeObjectUrl = data.resumeObjectUrl != null ? stripNullBytes(data.resumeObjectUrl) : null;
    if (data.transcriptObjectUrl !== undefined) updateData.transcriptObjectUrl = data.transcriptObjectUrl != null ? stripNullBytes(data.transcriptObjectUrl) : null;
    if (data.rawResumeText !== undefined) updateData.rawResumeText = data.rawResumeText != null ? stripNullBytes(data.rawResumeText) : null;
    if (data.rawTranscriptText !== undefined) updateData.rawTranscriptText = data.rawTranscriptText != null ? stripNullBytes(data.rawTranscriptText) : null;
    if (data.topics !== undefined) updateData.topics = data.topics;
    if (data.embedding !== undefined) updateData.embedding = data.embedding;

    const [updated] = await db
      .update(students)
      .set(updateData)
      .where(eq(students.id, id))
      .returning();

    if (!updated) throw new Error(`Student ${id} not found`);

    return {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      phoneNumber: updated.phoneNumber,
      resumeObjectUrl: updated.resumeObjectUrl,
      transcriptObjectUrl: updated.transcriptObjectUrl,
      rawResumeText: updated.rawResumeText,
      rawTranscriptText: updated.rawTranscriptText,
      topics: (updated.topics ?? []) as string[],
      embedding: (updated.embedding ?? null) as number[] | null,
      createdAt: toIso(updated.createdAt),
    };
  }

  async createPosting(data: Omit<PostingRecord, "id" | "createdAt"> & { organizerId?: string | null }): Promise<PostingRecord> {
    const [row] = await db
      .insert(postings)
      .values({
        id: randomUUID(),
        organizerId: data.organizerId || null,
        posterName: data.posterName,
        posterEmail: data.posterEmail,
        title: data.title,
        description: data.description,
        whoTheyNeed: data.whoTheyNeed,
        optionalPdfObjectUrl: data.optionalPdfObjectUrl,
        topics: data.topics,
        embedding: data.embedding,
      })
      .returning();

    return {
      id: row.id,
      posterName: row.posterName,
      posterEmail: row.posterEmail,
      title: row.title,
      description: row.description,
      whoTheyNeed: row.whoTheyNeed,
      optionalPdfObjectUrl: row.optionalPdfObjectUrl,
      topics: (row.topics ?? []) as string[],
      embedding: (row.embedding ?? null) as number[] | null,
      createdAt: toIso(row.createdAt),
    };
  }

  async getPosting(id: string): Promise<PostingRecord | undefined> {
    const [row] = await db.select().from(postings).where(eq(postings.id, id));
    if (!row) return undefined;
    return {
      id: row.id,
      posterName: row.posterName,
      posterEmail: row.posterEmail,
      title: row.title,
      description: row.description,
      whoTheyNeed: row.whoTheyNeed,
      optionalPdfObjectUrl: row.optionalPdfObjectUrl,
      topics: (row.topics ?? []) as string[],
      embedding: (row.embedding ?? null) as number[] | null,
      createdAt: toIso(row.createdAt),
    };
  }

  async getAllPostings(): Promise<PostingRecord[]> {
    const rows = await db.select().from(postings).orderBy(desc(postings.createdAt));
    return rows.map((row) => ({
      id: row.id,
      posterName: row.posterName,
      posterEmail: row.posterEmail,
      title: row.title,
      description: row.description,
      whoTheyNeed: row.whoTheyNeed,
      optionalPdfObjectUrl: row.optionalPdfObjectUrl,
      topics: (row.topics ?? []) as string[],
      embedding: (row.embedding ?? null) as number[] | null,
      createdAt: toIso(row.createdAt),
    }));
  }

  async getMatchesForPosting(postingId: string): Promise<MatchItem[]> {
    const posting = await this.getPosting(postingId);
    if (!posting) return [];

    const allStudents = await this.getAllStudents();
    if (allStudents.length === 0) return [];

    // Prefer embedding similarity when available
    if (posting.embedding && allStudents.some((s) => s.embedding)) {
      return matchByEmbedding(posting, allStudents);
    }

    // Fall back to topic overlap
    if (posting.topics.length > 0) {
      return matchByTopics(posting, allStudents);
    }

    return [];
  }

  async getMatchesForStudent(studentId: string): Promise<PostingMatchItem[]> {
    const student = await this.getStudent(studentId);
    if (!student) return [];

    const allPostings = await this.getAllPostings();
    if (allPostings.length === 0) return [];

    // Prefer embedding similarity when available
    if (student.embedding && allPostings.some((p) => p.embedding)) {
      return matchPostingsByEmbedding(student, allPostings);
    }

    // Fall back to topic overlap
    if (student.topics.length > 0) {
      return matchPostingsByTopics(student, allPostings);
    }

    return [];
  }

  // ---- Campaign Methods ----

  async createCampaign(data: Omit<CampaignRecord, "id" | "createdAt" | "updatedAt">, studentIds: string[]): Promise<CampaignRecord> {
    const campaignId = randomUUID();
    const now = new Date();

    // Create campaign
    const [campaignRow] = await db
      .insert(campaigns)
      .values({
        id: campaignId,
        name: data.name,
        postingId: data.postingId,
        strategy: data.strategy,
        status: data.status,
        deliveryChannel: data.deliveryChannel,
        subject: data.subject,
        content: data.content,
        personalizedMessage: data.personalizedMessage,
        imageUrl: data.imageUrl,
        scheduledAt: data.scheduledAt ? new Date(data.scheduledAt) : null,
        sentAt: data.sentAt ? new Date(data.sentAt) : null,
        targetSize: data.targetSize,
        selectedInterests: data.selectedInterests,
        studentsTargeted: studentIds.length.toString(),
        studentsSent: data.studentsSent || "0",
        studentsOpened: data.studentsOpened || "0",
        studentsClicked: data.studentsClicked || "0",
        studentsSignedUp: data.studentsSignedUp || "0",
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    // Create campaign-student links
    if (studentIds.length > 0) {
      await db.insert(campaignStudents).values(
        studentIds.map((studentId) => ({
          campaignId,
          studentId,
          sent: false,
          opened: false,
          clicked: false,
          signedUp: false,
        }))
      );
    }

    return {
      id: campaignRow.id,
      name: campaignRow.name,
      postingId: campaignRow.postingId,
      strategy: campaignRow.strategy,
      status: campaignRow.status,
      deliveryChannel: campaignRow.deliveryChannel,
      subject: campaignRow.subject,
      content: campaignRow.content,
      personalizedMessage: campaignRow.personalizedMessage,
      imageUrl: campaignRow.imageUrl,
      scheduledAt: campaignRow.scheduledAt ? toIso(campaignRow.scheduledAt) : null,
      sentAt: campaignRow.sentAt ? toIso(campaignRow.sentAt) : null,
      targetSize: campaignRow.targetSize,
      selectedInterests: (campaignRow.selectedInterests ?? []) as string[],
      studentsTargeted: campaignRow.studentsTargeted,
      studentsSent: campaignRow.studentsSent,
      studentsOpened: campaignRow.studentsOpened,
      studentsClicked: campaignRow.studentsClicked,
      studentsSignedUp: campaignRow.studentsSignedUp,
      createdAt: toIso(campaignRow.createdAt),
      updatedAt: toIso(campaignRow.updatedAt),
    };
  }

  async getCampaign(id: string): Promise<CampaignWithPosting | undefined> {
    const [campaignRow] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    if (!campaignRow) return undefined;

    const posting = await this.getPosting(campaignRow.postingId);
    if (!posting) return undefined;

    return {
      id: campaignRow.id,
      name: campaignRow.name,
      postingId: campaignRow.postingId,
      strategy: campaignRow.strategy,
      status: campaignRow.status,
      deliveryChannel: campaignRow.deliveryChannel,
      subject: campaignRow.subject,
      content: campaignRow.content,
      personalizedMessage: campaignRow.personalizedMessage,
      imageUrl: campaignRow.imageUrl,
      scheduledAt: campaignRow.scheduledAt ? toIso(campaignRow.scheduledAt) : null,
      sentAt: campaignRow.sentAt ? toIso(campaignRow.sentAt) : null,
      targetSize: campaignRow.targetSize,
      selectedInterests: (campaignRow.selectedInterests ?? []) as string[],
      studentsTargeted: campaignRow.studentsTargeted,
      studentsSent: campaignRow.studentsSent,
      studentsOpened: campaignRow.studentsOpened,
      studentsClicked: campaignRow.studentsClicked,
      studentsSignedUp: campaignRow.studentsSignedUp,
      createdAt: toIso(campaignRow.createdAt),
      updatedAt: toIso(campaignRow.updatedAt),
      posting,
    };
  }

  async getAllCampaigns(): Promise<CampaignWithPosting[]> {
    const campaignRows = await db.select().from(campaigns).orderBy(desc(campaigns.createdAt));
    
    const campaignsWithPostings: CampaignWithPosting[] = [];
    for (const campaignRow of campaignRows) {
      const posting = await this.getPosting(campaignRow.postingId);
      if (posting) {
        campaignsWithPostings.push({
          id: campaignRow.id,
          name: campaignRow.name,
          postingId: campaignRow.postingId,
          strategy: campaignRow.strategy,
          status: campaignRow.status,
          deliveryChannel: campaignRow.deliveryChannel,
          subject: campaignRow.subject,
          content: campaignRow.content,
          personalizedMessage: campaignRow.personalizedMessage,
          imageUrl: campaignRow.imageUrl,
          scheduledAt: campaignRow.scheduledAt ? toIso(campaignRow.scheduledAt) : null,
          sentAt: campaignRow.sentAt ? toIso(campaignRow.sentAt) : null,
          targetSize: campaignRow.targetSize,
          selectedInterests: (campaignRow.selectedInterests ?? []) as string[],
          studentsTargeted: campaignRow.studentsTargeted,
          studentsSent: campaignRow.studentsSent,
          studentsOpened: campaignRow.studentsOpened,
          studentsClicked: campaignRow.studentsClicked,
          studentsSignedUp: campaignRow.studentsSignedUp,
          createdAt: toIso(campaignRow.createdAt),
          updatedAt: toIso(campaignRow.updatedAt),
          posting,
        });
      }
    }
    
    return campaignsWithPostings;
  }

  async updateCampaign(id: string, data: Partial<CampaignRecord>): Promise<CampaignRecord> {
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (data.name !== undefined) updateData.name = data.name;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.strategy !== undefined) updateData.strategy = data.strategy;
    if (data.deliveryChannel !== undefined) updateData.deliveryChannel = data.deliveryChannel;
    if (data.subject !== undefined) updateData.subject = data.subject;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.personalizedMessage !== undefined) updateData.personalizedMessage = data.personalizedMessage;
    if (data.imageUrl !== undefined) updateData.imageUrl = data.imageUrl;
    if (data.scheduledAt !== undefined) updateData.scheduledAt = data.scheduledAt ? new Date(data.scheduledAt) : null;
    if (data.sentAt !== undefined) updateData.sentAt = data.sentAt ? new Date(data.sentAt) : null;
    if (data.targetSize !== undefined) updateData.targetSize = data.targetSize;
    if (data.selectedInterests !== undefined) updateData.selectedInterests = data.selectedInterests;
    if (data.studentsTargeted !== undefined) updateData.studentsTargeted = data.studentsTargeted;
    if (data.studentsSent !== undefined) updateData.studentsSent = data.studentsSent;
    if (data.studentsOpened !== undefined) updateData.studentsOpened = data.studentsOpened;
    if (data.studentsClicked !== undefined) updateData.studentsClicked = data.studentsClicked;
    if (data.studentsSignedUp !== undefined) updateData.studentsSignedUp = data.studentsSignedUp;

    const [updated] = await db
      .update(campaigns)
      .set(updateData)
      .where(eq(campaigns.id, id))
      .returning();

    if (!updated) throw new Error(`Campaign ${id} not found`);

    return {
      id: updated.id,
      name: updated.name,
      postingId: updated.postingId,
      strategy: updated.strategy,
      status: updated.status,
      deliveryChannel: updated.deliveryChannel,
      subject: updated.subject,
      content: updated.content,
      personalizedMessage: updated.personalizedMessage,
      imageUrl: updated.imageUrl,
      scheduledAt: updated.scheduledAt ? toIso(updated.scheduledAt) : null,
      sentAt: updated.sentAt ? toIso(updated.sentAt) : null,
      targetSize: updated.targetSize,
      selectedInterests: (updated.selectedInterests ?? []) as string[],
      studentsTargeted: updated.studentsTargeted,
      studentsSent: updated.studentsSent,
      studentsOpened: updated.studentsOpened,
      studentsClicked: updated.studentsClicked,
      studentsSignedUp: updated.studentsSignedUp,
      createdAt: toIso(updated.createdAt),
      updatedAt: toIso(updated.updatedAt),
    };
  }

  async getCampaignStudents(campaignId: string): Promise<CampaignStudentRecord[]> {
    const rows = await db
      .select()
      .from(campaignStudents)
      .where(eq(campaignStudents.campaignId, campaignId));

    return rows.map((row) => ({
      id: row.id,
      campaignId: row.campaignId,
      studentId: row.studentId,
      sent: row.sent ?? false,
      opened: row.opened ?? false,
      clicked: row.clicked ?? false,
      signedUp: row.signedUp ?? false,
      sentAt: row.sentAt ? toIso(row.sentAt) : null,
      openedAt: row.openedAt ? toIso(row.openedAt) : null,
      clickedAt: row.clickedAt ? toIso(row.clickedAt) : null,
      signedUpAt: row.signedUpAt ? toIso(row.signedUpAt) : null,
      createdAt: toIso(row.createdAt),
    }));
  }

  async updateCampaignStudent(campaignId: string, studentId: string, data: Partial<CampaignStudentRecord>): Promise<void> {
    const updateData: any = {};
    
    if (data.sent !== undefined) updateData.sent = data.sent;
    if (data.opened !== undefined) updateData.opened = data.opened;
    if (data.clicked !== undefined) updateData.clicked = data.clicked;
    if (data.signedUp !== undefined) updateData.signedUp = data.signedUp;
    if (data.sentAt !== undefined) updateData.sentAt = data.sentAt ? new Date(data.sentAt) : null;
    if (data.openedAt !== undefined) updateData.openedAt = data.openedAt ? new Date(data.openedAt) : null;
    if (data.clickedAt !== undefined) updateData.clickedAt = data.clickedAt ? new Date(data.clickedAt) : null;
    if (data.signedUpAt !== undefined) updateData.signedUpAt = data.signedUpAt ? new Date(data.signedUpAt) : null;

    await db
      .update(campaignStudents)
      .set(updateData)
      .where(and(
        eq(campaignStudents.campaignId, campaignId),
        eq(campaignStudents.studentId, studentId)
      ));
  }

  // ---- Rate Limiting Methods ----

  async getSmsUsage(organizerId: string): Promise<{ used: number; limit: number }> {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    const [usage] = await db
      .select()
      .from(organizerSmsUsage)
      .where(and(
        eq(organizerSmsUsage.organizerId, organizerId),
        eq(organizerSmsUsage.month, month)
      ));

    return {
      used: usage?.smsCount ?? 0,
      limit: 100, // Monthly limit
    };
  }

  async recordSmsUsage(organizerId: string, count: number): Promise<void> {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    const [existing] = await db
      .select()
      .from(organizerSmsUsage)
      .where(and(
        eq(organizerSmsUsage.organizerId, organizerId),
        eq(organizerSmsUsage.month, month)
      ));

    if (existing) {
      await db
        .update(organizerSmsUsage)
        .set({
          smsCount: existing.smsCount + count,
          updatedAt: now,
        })
        .where(eq(organizerSmsUsage.id, existing.id));
    } else {
      await db.insert(organizerSmsUsage).values({
        organizerId,
        month,
        smsCount: count,
        createdAt: now,
        updatedAt: now,
      });
    }
  }

  async checkSmsLimit(organizerId: string, count: number): Promise<boolean> {
    const usage = await this.getSmsUsage(organizerId);
    return usage.used + count <= usage.limit;
  }

  // ---- User and Organizer Methods ----

  async createUser(data: { username: string; email: string; password: string; role: "student" | "organizer" }): Promise<UserRecord> {
    const [row] = await db
      .insert(users)
      .values({
        username: data.username,
        email: data.email,
        password: data.password,
        role: data.role,
      })
      .returning();

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      role: row.role as "student" | "organizer",
      createdAt: toIso(row.createdAt),
    };
  }

  async getUserByEmail(email: string): Promise<UserRecord | undefined> {
    const [row] = await db.select().from(users).where(eq(users.email, email));
    if (!row) return undefined;
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      role: row.role as "student" | "organizer",
      createdAt: toIso(row.createdAt),
    };
  }

  async getUserById(id: string): Promise<UserRecord | undefined> {
    const [row] = await db.select().from(users).where(eq(users.id, id));
    if (!row) return undefined;
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      role: row.role as "student" | "organizer",
      createdAt: toIso(row.createdAt),
    };
  }

  async createOrganizer(data: { userId: string; name: string; email: string }): Promise<OrganizerRecord> {
    const [row] = await db
      .insert(organizers)
      .values({
        userId: data.userId,
        name: data.name,
        email: data.email,
      })
      .returning();

    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      email: row.email,
      createdAt: toIso(row.createdAt),
    };
  }

  async getOrganizerByUserId(userId: string): Promise<OrganizerRecord | undefined> {
    const [row] = await db.select().from(organizers).where(eq(organizers.userId, userId));
    if (!row) return undefined;
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      email: row.email,
      createdAt: toIso(row.createdAt),
    };
  }

  async getOrganizerByEmail(email: string): Promise<OrganizerRecord | undefined> {
    const [row] = await db.select().from(organizers).where(eq(organizers.email, email));
    if (!row) return undefined;
    return {
      id: row.id,
      userId: row.userId,
      name: row.name,
      email: row.email,
      createdAt: toIso(row.createdAt),
    };
  }

  async getPostingsByOrganizer(organizerId: string): Promise<PostingRecord[]> {
    const rows = await db
      .select()
      .from(postings)
      .where(eq(postings.organizerId, organizerId))
      .orderBy(desc(postings.createdAt));

    return rows.map((row) => ({
      id: row.id,
      posterName: row.posterName,
      posterEmail: row.posterEmail,
      title: row.title,
      description: row.description,
      whoTheyNeed: row.whoTheyNeed,
      optionalPdfObjectUrl: row.optionalPdfObjectUrl,
      topics: (row.topics ?? []) as string[],
      embedding: (row.embedding ?? null) as number[] | null,
      createdAt: toIso(row.createdAt),
    }));
  }

  async getStudentByUserId(userId: string): Promise<StudentRecord | undefined> {
    const [row] = await db.select().from(students).where(eq(students.userId, userId));
    if (!row) return undefined;
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phoneNumber: row.phoneNumber,
      resumeObjectUrl: row.resumeObjectUrl,
      transcriptObjectUrl: row.transcriptObjectUrl,
      rawResumeText: row.rawResumeText,
      rawTranscriptText: row.rawTranscriptText,
      topics: (row.topics ?? []) as string[],
      embedding: (row.embedding ?? null) as number[] | null,
      createdAt: toIso(row.createdAt),
    };
  }

  async getStudentUserId(studentId: string): Promise<string | null> {
    const [row] = await db.select({ userId: students.userId }).from(students).where(eq(students.id, studentId));
    return row?.userId ?? null;
  }

  async getCampaignsForStudent(studentId: string): Promise<CampaignWithPosting[]> {
    const campaignStudentRows = await db
      .select()
      .from(campaignStudents)
      .where(eq(campaignStudents.studentId, studentId));

    const campaignIds = campaignStudentRows.map((cs) => cs.campaignId);
    if (campaignIds.length === 0) return [];

    const campaignRows = await db
      .select()
      .from(campaigns)
      .where(inArray(campaigns.id, campaignIds));

    const postingIds = [...new Set(campaignRows.map((c) => c.postingId))];
    const postingRows = await db
      .select()
      .from(postings)
      .where(inArray(postings.id, postingIds));

    const postingsMap = new Map(
      postingRows.map((p) => [
        p.id,
        {
          id: p.id,
          posterName: p.posterName,
          posterEmail: p.posterEmail,
          title: p.title,
          description: p.description,
          whoTheyNeed: p.whoTheyNeed,
          optionalPdfObjectUrl: p.optionalPdfObjectUrl,
          topics: (p.topics ?? []) as string[],
          embedding: (p.embedding ?? null) as number[] | null,
          createdAt: toIso(p.createdAt),
        },
      ])
    );

    return campaignRows.map((c) => {
      const posting = postingsMap.get(c.postingId);
      if (!posting) throw new Error(`Posting ${c.postingId} not found`);

      return {
        id: c.id,
        name: c.name,
        postingId: c.postingId,
        strategy: c.strategy,
        status: c.status,
        deliveryChannel: c.deliveryChannel,
        subject: c.subject,
        content: c.content,
        personalizedMessage: c.personalizedMessage,
        imageUrl: c.imageUrl,
        scheduledAt: c.scheduledAt ? toIso(c.scheduledAt) : null,
        sentAt: c.sentAt ? toIso(c.sentAt) : null,
        targetSize: c.targetSize,
        selectedInterests: (c.selectedInterests ?? []) as string[],
        studentsTargeted: c.studentsTargeted,
        studentsSent: c.studentsSent,
        studentsOpened: c.studentsOpened,
        studentsClicked: c.studentsClicked,
        studentsSignedUp: c.studentsSignedUp,
        createdAt: toIso(c.createdAt),
        updatedAt: toIso(c.updatedAt),
        posting,
      };
    });
  }
}

// ---- Matching helpers ----

// Minimum score thresholds to filter out irrelevant matches
const MIN_EMBEDDING_SCORE = 0.35; // Minimum normalized embedding similarity (0-1 scale)
const MIN_TOPIC_SCORE = 0.25; // Minimum topic overlap score (25% of topics must match)

// Generic terms that should not match easily (require exact or very specific matches)
const GENERIC_TERMS = new Set([
  "engineering", "research", "design", "development", "analysis", "programming",
  "software", "data", "science", "technology", "computer", "systems", "application",
  "python", "java", "javascript", "sql", "r", "c++", "c", "html", "css"
]);

/**
 * Check if a topic is generic (too broad to be meaningful)
 */
function isGenericTopic(topic: string): boolean {
  const lower = topic.toLowerCase().trim();
  // Check if it's a single generic word
  if (GENERIC_TERMS.has(lower)) return true;
  // Check if it's just a programming language without context
  const words = lower.split(/\s+/);
  if (words.length === 1 && GENERIC_TERMS.has(words[0])) return true;
  return false;
}

/**
 * Calculate match quality score (0-1) for topic matching
 * Higher scores for exact/specific matches, lower for generic matches
 */
function getTopicMatchScore(topic1: string, topic2: string): number {
  const t1 = topic1.toLowerCase().trim();
  const t2 = topic2.toLowerCase().trim();
  
  // Exact match - highest score
  if (t1 === t2) return 1.0;
  
  const words1 = t1.split(/\s+/);
  const words2 = t2.split(/\s+/);
  
  // Check if one is generic - penalize generic matches
  const t1Generic = isGenericTopic(topic1);
  const t2Generic = isGenericTopic(topic2);
  
  // If both are generic, require exact match
  if (t1Generic && t2Generic) {
    return t1 === t2 ? 0.3 : 0;
  }
  
  // If one is generic and one is specific, penalize heavily
  if (t1Generic || t2Generic) {
    // Only allow if the specific one contains the generic one as a complete word
    const specific = t1Generic ? t2 : t1;
    const generic = t1Generic ? t1 : t2;
    const specificWords = specific.split(/\s+/);
    const genericWords = generic.split(/\s+/);
    
    // Check if all generic words appear in specific topic
    const allMatch = genericWords.every(gw => specificWords.includes(gw));
    return allMatch ? 0.4 : 0; // Reduced score for generic matches
  }
  
  // Both are specific - check word overlap
  const shorterWords = words1.length <= words2.length ? words1 : words2;
  const longerWords = words1.length > words2.length ? words1 : words2;
  const matchingWords = shorterWords.filter(w => longerWords.includes(w));
  
  if (matchingWords.length === 0) return 0;
  
  // Require at least 60% word overlap for specific topics
  const overlapRatio = matchingWords.length / shorterWords.length;
  if (overlapRatio >= 0.6) {
    return 0.7 + (overlapRatio - 0.6) * 0.75; // Scale from 0.7 to 1.0
  }
  
  return 0;
}

/**
 * Check if two topic strings match, using stricter matching rules
 */
function topicsMatch(topic1: string, topic2: string): boolean {
  return getTopicMatchScore(topic1, topic2) > 0;
}

function matchByEmbedding(posting: PostingRecord, students: StudentRecord[]): MatchItem[] {
  const postingEmb = posting.embedding!;
  const scored: MatchItem[] = [];

  for (const student of students) {
    if (!student.embedding) continue;
    const cosineScore = cosineSimilarity(postingEmb, student.embedding);
    // Normalize cosine similarity from [-1, 1] to [0, 1]
    const normalizedScore = Math.max(0, Math.min(1, (cosineScore + 1) / 2));
    
    // Filter out low-scoring matches
    if (normalizedScore < MIN_EMBEDDING_SCORE) continue;
    
    scored.push({
      id: student.id,
      name: student.name,
      email: student.email,
      topics: student.topics,
      score: normalizedScore,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function matchByTopics(posting: PostingRecord, students: StudentRecord[]): MatchItem[] {
  const postingTopics = posting.topics.map((t) => t.toLowerCase().trim()).filter(Boolean);
  if (postingTopics.length === 0) return [];
  
  const scored: MatchItem[] = [];

  for (const student of students) {
    const studentTopics = student.topics.map((t) => t.toLowerCase().trim()).filter(Boolean);
    if (studentTopics.length === 0) continue;
    
    // Calculate weighted match scores for each posting topic
    let totalMatchScore = 0;
    let matchedTopics = 0;
    
    for (const pt of postingTopics) {
      let bestMatchScore = 0;
      for (const st of studentTopics) {
        const matchScore = getTopicMatchScore(pt, st);
        if (matchScore > bestMatchScore) {
          bestMatchScore = matchScore;
        }
      }
      if (bestMatchScore > 0) {
        totalMatchScore += bestMatchScore;
        matchedTopics++;
      }
    }

    // Score is based on: (weighted average match quality) * (coverage ratio)
    // This prioritizes both match quality and coverage
    const avgMatchQuality = matchedTopics > 0 ? totalMatchScore / matchedTopics : 0;
    const coverageRatio = matchedTopics / postingTopics.length;
    
    // Weighted combination: 60% match quality, 40% coverage
    const score = avgMatchQuality * 0.6 + coverageRatio * 0.4;
    
    // Filter out low-scoring matches
    if (score < MIN_TOPIC_SCORE) continue;
    
    scored.push({
      id: student.id,
      name: student.name,
      email: student.email,
      topics: student.topics,
      score: Math.min(1, score), // Cap at 1.0
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function matchPostingsByEmbedding(student: StudentRecord, postings: PostingRecord[]): PostingMatchItem[] {
  const studentEmb = student.embedding!;
  const scored: PostingMatchItem[] = [];

  for (const posting of postings) {
    if (!posting.embedding) continue;
    const cosineScore = cosineSimilarity(studentEmb, posting.embedding);
    // Normalize cosine similarity from [-1, 1] to [0, 1]
    const normalizedScore = Math.max(0, Math.min(1, (cosineScore + 1) / 2));
    
    // Filter out low-scoring matches
    if (normalizedScore < MIN_EMBEDDING_SCORE) continue;
    
    scored.push({
      id: posting.id,
      title: posting.title,
      posterName: posting.posterName,
      topics: posting.topics,
      score: normalizedScore,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function matchPostingsByTopics(student: StudentRecord, postings: PostingRecord[]): PostingMatchItem[] {
  const studentTopics = student.topics.map((t) => t.toLowerCase().trim()).filter(Boolean);
  if (studentTopics.length === 0) return [];
  
  const scored: PostingMatchItem[] = [];

  for (const posting of postings) {
    const postingTopics = posting.topics.map((t) => t.toLowerCase().trim()).filter(Boolean);
    if (postingTopics.length === 0) continue;
    
    // Calculate weighted match scores for each student topic
    let totalMatchScore = 0;
    let matchedTopics = 0;
    
    for (const st of studentTopics) {
      let bestMatchScore = 0;
      for (const pt of postingTopics) {
        const matchScore = getTopicMatchScore(st, pt);
        if (matchScore > bestMatchScore) {
          bestMatchScore = matchScore;
        }
      }
      if (bestMatchScore > 0) {
        totalMatchScore += bestMatchScore;
        matchedTopics++;
      }
    }

    // Score is based on: (weighted average match quality) * (coverage ratio)
    const avgMatchQuality = matchedTopics > 0 ? totalMatchScore / matchedTopics : 0;
    const coverageRatio = matchedTopics / studentTopics.length;
    
    // Weighted combination: 60% match quality, 40% coverage
    const score = avgMatchQuality * 0.6 + coverageRatio * 0.4;
    
    // Filter out low-scoring matches
    if (score < MIN_TOPIC_SCORE) continue;
    
    scored.push({
      id: posting.id,
      title: posting.title,
      posterName: posting.posterName,
      topics: posting.topics,
      score: Math.min(1, score), // Cap at 1.0
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored;
}

function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

export const storage = new DatabaseStorage();
