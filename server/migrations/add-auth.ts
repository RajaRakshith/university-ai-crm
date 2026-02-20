/**
 * Migration script to add authentication tables and columns
 * 
 * Run this script after updating the schema:
 * 1. Run `npm run db:push` to apply schema changes
 * 2. Run this script to migrate existing data (if any)
 * 
 * Or run manually with: tsx server/migrations/add-auth.ts
 */

import { db } from "../db";
import { users, organizers, students, postings } from "@shared/schema";
import { sql } from "drizzle-orm";
import { hashPassword } from "../auth";

async function migrate() {
  console.log("Starting migration...");

  try {
    // Get all unique poster emails from existing postings
    const existingPostings = await db.select().from(postings);
    const uniqueEmails = [...new Set(existingPostings.map((p) => p.posterEmail).filter(Boolean))];

    console.log(`Found ${uniqueEmails.length} unique organizer emails`);

    // Create user accounts and organizer records for existing organizers
    for (const email of uniqueEmails) {
      if (!email) continue;

      // Check if user already exists
      const existingUser = await db.select().from(users).where(sql`${users.email} = ${email}`).limit(1);
      
      if (existingUser.length > 0) {
        console.log(`User already exists for ${email}, skipping...`);
        continue;
      }

      // Create user account with default password (organizers will need to reset)
      const defaultPassword = await hashPassword("changeme123");
      const username = email.split("@")[0];

      const [user] = await db
        .insert(users)
        .values({
          username,
          email,
          password: defaultPassword,
          role: "organizer",
        })
        .returning();

      // Create organizer record
      const posting = existingPostings.find((p) => p.posterEmail === email);
      const organizerName = posting?.posterName || "Organizer";

      const [organizer] = await db.insert(organizers).values({
        userId: user.id,
        name: organizerName,
        email,
      }).returning();

      // Update postings with organizerId
      await db
        .update(postings)
        .set({ organizerId: organizer.id })
        .where(sql`${postings.posterEmail} = ${email}`);

      console.log(`Created organizer account for ${email}`);
    }

    console.log("Migration completed successfully!");
    console.log("\n⚠️  IMPORTANT: All organizer accounts have been created with default password 'changeme123'");
    console.log("   Organizers should change their password after first login.");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .then(() => {
      console.log("Done!");
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

export { migrate };
