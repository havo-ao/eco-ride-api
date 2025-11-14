import { initMySQL, db } from "../src/core/database/mysql";
import fs from "node:fs";
import path from "node:path";
import { RowDataPacket } from "mysql2";

async function ensureMigrationTableExists() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS migration (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL UNIQUE,
        executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("📦 Verified existence of migration table.");
  } catch (err: any) {
    console.error("❌ Failed to ensure migration table:", err.message);
    process.exit(1);
  }
}

async function runMigrations() {
  console.log("🚀 Starting migrations...");
  
  await initMySQL();
  await ensureMigrationTableExists();

  const migrationDir = path.join(__dirname, "../sql/migrations");
  const files = fs.readdirSync(migrationDir).sort();

  // Get already executed migrations
  const [executedRows] = await db.query<RowDataPacket[]>(
    "SELECT name FROM migration"
  );
  const executed = new Set(
    (executedRows as RowDataPacket[]).map((row) => row["name"] as string)
  );

  // Run only pending migrations
  for (const file of files) {
    if (executed.has(file)) {
      console.log(`⏩ Skipping already executed migration: ${file}`);
      continue;
    }

    const filePath = path.join(migrationDir, file);
    const sqlContent = fs.readFileSync(filePath, "utf-8");

    console.log(`📄 Executing migration: ${file}`);
    try {
      await db.query(sqlContent);
      await db.query("INSERT INTO migration (name) VALUES (?)", [file]);
      console.log(`✅ Migration completed: ${file}`);
    } catch (err: any) {
      console.error(`❌ Error in migration ${file}: ${err.message}`);
      process.exit(1);
    }
  }

  console.log("🎯 All pending migrations processed.");
  process.exit(0);
}

runMigrations().catch((err) => {
  console.error("❌ General migration error:", err);
  process.exit(1);
});
