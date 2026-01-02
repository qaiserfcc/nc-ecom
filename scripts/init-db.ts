#!/usr/bin/env tsx
/**
 * Database Initialization Script
 * 
 * This script executes all SQL migration files in the scripts directory
 * in the correct order. It's designed to be idempotent - safe to run
 * multiple times without causing errors.
 * 
 * Usage:
 *   npm run db:init
 *   or
 *   tsx scripts/init-db.ts
 */

import { Pool } from '@neondatabase/serverless';
import { readFile } from "fs/promises";
import { join } from "path";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("❌ Error: DATABASE_URL environment variable is not set");
  console.error("Please add DATABASE_URL to your .env file");
  process.exit(1);
}

// SQL files to execute in order
const SQL_FILES = [
  "01-create-schema.sql",
  "02-seed-data.sql",
  "03-add-password-hash.sql",
];

/**
 * Execute a SQL file against the database
 */
async function executeSqlFile(pool: Pool, filename: string): Promise<void> {
  const filePath = join(__dirname, filename);
  
  try {
    console.log(`\n📄 Executing ${filename}...`);
    
    // Read the SQL file
    const sqlContent = await readFile(filePath, "utf-8");
    
    // Execute the entire file content
    // Neon's Pool handles multiple statements in a single query
    const result = await pool.query(sqlContent);
    
    console.log(`   ✅ Success: ${filename} executed successfully`);
    
  } catch (error: any) {
    // Check if this is a "duplicate" or "already exists" error
    const errorMsg = error.message?.toLowerCase() || "";
    
    const isIgnorableError = 
      errorMsg.includes("already exists") ||
      errorMsg.includes("duplicate key") ||
      errorMsg.includes("duplicate") ||
      errorMsg.includes("violates unique constraint");
    
    if (isIgnorableError) {
      // This is expected when running multiple times
      console.log(`   ✅ Success: ${filename} (idempotent - skipped duplicates)`);
    } else {
      // This is a real error - log it
      console.error(`   ❌ Failed to execute ${filename}`);
      console.error(`   Error: ${error.message}`);
      throw error;
    }
  }
}

/**
 * Main function - executes all SQL files in order
 */
async function main() {
  if (!DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }
  
  console.log("🚀 Starting database initialization...");
  console.log(`📍 Database: ${DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`); // Hide password
  
  const pool = new Pool({ connectionString: DATABASE_URL });
  
  try {
    // Test database connection
    console.log("\n🔌 Testing database connection...");
    await pool.query('SELECT 1 as test');
    console.log("   ✅ Connection successful");
    
    // Execute each SQL file in order
    for (const file of SQL_FILES) {
      await executeSqlFile(pool, file);
    }
    
    console.log("\n✨ Database initialization completed successfully!");
    console.log("🎉 Your database is ready to use\n");
    
    await pool.end();
    process.exit(0);
  } catch (error: any) {
    console.error("\n💥 Database initialization failed!");
    console.error(error);
    await pool.end();
    process.exit(1);
  }
}

// Run the script
main();
