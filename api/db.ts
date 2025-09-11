import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

let db: any = null;
let pool: any = null;

export const getDatabase = () => {
  if (!db && process.env.DATABASE_URL) {
    try {
      console.log("Attempting database connection with DATABASE_URL:", process.env.DATABASE_URL ? "Present" : "Missing");
      
      // Use the DATABASE_URL from Vercel environment variables
      pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 1, // Limit connections for serverless
        idleTimeoutMillis: 0, // Disable idle timeout
        connectionTimeoutMillis: 10000, // 10 second timeout
      });
      
      db = drizzle({ client: pool, schema });
      console.log("Database connected using Vercel environment variables");
    } catch (error) {
      console.error("Database connection failed:", error);
      return null;
    }
  } else if (!process.env.DATABASE_URL) {
    console.log("DATABASE_URL environment variable not found");
  }
  return db;
};

export const closeDatabase = async () => {
  if (pool) {
    try {
      await pool.end();
      console.log("Database connection closed");
    } catch (error) {
      console.error("Error closing database:", error);
    }
    pool = null;
    db = null;
  }
};