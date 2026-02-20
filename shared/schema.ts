import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("student"), // "student" | "organizer"
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const organizers = pgTable("Organizer", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const students = pgTable("Student", {
  id: text("id").primaryKey(),
  userId: varchar("userId").references(() => users.id, { onDelete: "set null" }),
  name: text("name"),
  email: text("email"),
  phoneNumber: text("phoneNumber"),
  resumeObjectUrl: text("resumeObjectUrl"),
  transcriptObjectUrl: text("transcriptObjectUrl"),
  rawResumeText: text("rawResumeText"),
  rawTranscriptText: text("rawTranscriptText"),
  topics: jsonb("topics").$type<string[]>(),
  embedding: jsonb("embedding").$type<number[]>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const postings = pgTable("Posting", {
  id: text("id").primaryKey(),
  organizerId: text("organizerId").references(() => organizers.id, { onDelete: "set null" }),
  posterName: text("posterName").notNull().default("Unknown"),
  posterEmail: text("posterEmail").notNull().default(""),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  whoTheyNeed: text("whoTheyNeed").notNull().default(""),
  optionalPdfObjectUrl: text("optionalPdfObjectUrl"),
  topics: jsonb("topics").$type<string[]>(),
  embedding: jsonb("embedding").$type<number[]>(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const campaigns = pgTable("Campaign", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  postingId: text("postingId").notNull().references(() => postings.id, { onDelete: "cascade" }),
  strategy: text("strategy").notNull().default("initial"), // "initial" | "retargeting"
  status: text("status").notNull().default("draft"), // "draft" | "scheduled" | "running" | "completed" | "cancelled"
  deliveryChannel: text("deliveryChannel").notNull().default("email"), // "email" | "sms"
  
  // Content
  subject: text("subject"),
  content: text("content"),
  personalizedMessage: text("personalizedMessage"), // SMS template with variables
  imageUrl: text("imageUrl"),
  
  // Scheduling
  scheduledAt: timestamp("scheduledAt"),
  sentAt: timestamp("sentAt"),
  
  // Targeting
  targetSize: text("targetSize"), // JSON string or number
  selectedInterests: jsonb("selectedInterests").$type<string[]>(),
  
  // Metrics
  studentsTargeted: text("studentsTargeted").default("0"),
  studentsSent: text("studentsSent").default("0"),
  studentsOpened: text("studentsOpened").default("0"),
  studentsClicked: text("studentsClicked").default("0"),
  studentsSignedUp: text("studentsSignedUp").default("0"),
  
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
});

// Junction table linking campaigns to students
export const campaignStudents = pgTable("CampaignStudent", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  campaignId: text("campaignId").notNull().references(() => campaigns.id, { onDelete: "cascade" }),
  studentId: text("studentId").notNull().references(() => students.id, { onDelete: "cascade" }),
  
  // Engagement tracking
  sent: boolean("sent").default(false),
  opened: boolean("opened").default(false),
  clicked: boolean("clicked").default(false),
  signedUp: boolean("signedUp").default(false),
  
  sentAt: timestamp("sentAt"),
  openedAt: timestamp("openedAt"),
  clickedAt: timestamp("clickedAt"),
  signedUpAt: timestamp("signedUpAt"),
  
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

// Rate limiting table for SMS usage tracking
export const organizerSmsUsage = pgTable("OrganizerSmsUsage", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`),
  organizerId: text("organizerId").notNull(), // Email or user ID of organizer
  month: text("month").notNull(), // Format: "YYYY-MM"
  smsCount: integer("smsCount").notNull().default(0),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type DbOrganizer = typeof organizers.$inferSelect;
export type DbStudent = typeof students.$inferSelect;
export type DbPosting = typeof postings.$inferSelect;
export type DbCampaign = typeof campaigns.$inferSelect;
export type DbCampaignStudent = typeof campaignStudents.$inferSelect;
export type DbOrganizerSmsUsage = typeof organizerSmsUsage.$inferSelect;
