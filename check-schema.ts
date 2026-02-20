import { config } from "dotenv";
import { resolve } from "path";
import pg from "pg";

config({ path: resolve(__dirname, "../.env") });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function checkSchema() {
  try {
    console.log("Checking database schema...\n");

    // Check Campaign table columns
    const campaignColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Campaign'
      ORDER BY ordinal_position;
    `);

    console.log("Campaign table columns:");
    console.table(campaignColumns.rows);

    // Check if personalizedMessage exists
    const hasPersonalizedMessage = campaignColumns.rows.some(
      (row) => row.column_name === "personalizedMessage"
    );
    console.log(`\npersonalizedMessage column exists: ${hasPersonalizedMessage ? "✅ YES" : "❌ NO"}`);

    // Check Student table columns
    const studentColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'Student'
      ORDER BY ordinal_position;
    `);

    console.log("\nStudent table columns:");
    console.table(studentColumns.rows);

    // Check if phoneNumber exists
    const hasPhoneNumber = studentColumns.rows.some(
      (row) => row.column_name === "phoneNumber"
    );
    console.log(`\nphoneNumber column exists: ${hasPhoneNumber ? "✅ YES" : "❌ NO"}`);

    // Check if OrganizerSmsUsage table exists
    const organizerTable = await pool.query(`
      SELECT table_name
      FROM information_schema.tables 
      WHERE table_name = 'OrganizerSmsUsage';
    `);

    console.log(`\nOrganizerSmsUsage table exists: ${organizerTable.rows.length > 0 ? "✅ YES" : "❌ NO"}`);

    if (organizerTable.rows.length > 0) {
      const organizerColumns = await pool.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'OrganizerSmsUsage'
        ORDER BY ordinal_position;
      `);
      console.log("\nOrganizerSmsUsage table columns:");
      console.table(organizerColumns.rows);
    }

    console.log("\n✅ Schema check complete!");
  } catch (err: any) {
    console.error("Error checking schema:", err.message);
  } finally {
    await pool.end();
  }
}

checkSchema();
