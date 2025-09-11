import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "../shared/schema";

let db: any = null;
let pool: any = null;

export const getDatabase = () => {
  if (!db && process.env.DATABASE_URL) {
    try {
      // Create a new pool for each serverless function invocation
      pool = new Pool({ 
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 1, // Limit connections for serverless
        idleTimeoutMillis: 0, // Disable idle timeout
        connectionTimeoutMillis: 10000, // 10 second timeout
      });
      
      db = drizzle({ client: pool, schema });
      console.log("Database connection established successfully");
    } catch (error) {
      console.error("Database connection failed:", error);
      return null;
    }
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
