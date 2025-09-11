import express, { type Request, Response, NextFunction } from "express";
import { db } from "../shared/db";
import { users, sessions as sessionTable, messages, journalEntries, moodEntries, passwordResetTokens, insertUserSchema, insertSessionSchema, insertMessageSchema, insertJournalEntrySchema, insertMoodEntrySchema, insertPasswordResetTokenSchema } from "../shared/schema";
import { eq, desc, or, and, lt, gt } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple in-memory session store for serverless (not ideal for production)
const sessions = new Map();

// Middleware to parse session from headers (simple token-based auth)
const parseSession = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const sessionData = sessions.get(token);
    if (sessionData) {
      req.user = sessionData;
    }
  }
  next();
};

// Middleware to check authentication
const requireAuth = (req: any, res: any, next: any) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Authentication routes
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Username, email, and password are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    // Check if username or email already exists
    const existingUser = await db.select().from(users).where(
      or(eq(users.username, username), eq(users.email, email))
    ).limit(1);
    if (existingUser.length > 0) {
      const existing = existingUser[0];
      if (existing.username === username) {
        return res.status(400).json({ message: "Username already exists" });
      } else {
        return res.status(400).json({ message: "Email already exists" });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
      })
      .returning();

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionToken, {
      userId: newUser.id,
      username: newUser.username,
      email: newUser.email
    });

    res.json({ 
      id: newUser.id, 
      username: newUser.username,
      email: newUser.email,
      token: sessionToken,
      message: "Account created successfully" 
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ message: "Failed to create account" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { usernameOrEmail, password } = req.body;
    
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }

    // Find user by username or email
    const [user] = await db.select().from(users).where(
      or(eq(users.username, usernameOrEmail), eq(users.email, usernameOrEmail))
    ).limit(1);
    if (!user) {
      return res.status(401).json({ message: "Invalid username/email or password" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid username/email or password" });
    

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    sessions.set(sessionToken, {
      userId: user.id,
      username: user.username,
      email: user.email
    });

    res.json({ 
      id: user.id, 
      username: user.username,
      email: user.email,
      token: sessionToken,
      message: "Logged in successfully" 
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Failed to log in" });
  }
});

app.post("/api/auth/logout", parseSession, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sessions.delete(token);
  }
  res.json({ message: "Logged out successfully" });
});

// Apply session parsing to all routes
app.use(parseSession);

// Basic API routes (simplified for serverless)
app.get("/api/user/profile", requireAuth, (req, res) => {
  res.json({
    id: req.user.userId,
    username: req.user.username,
    email: req.user.email
  });
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  console.error("Serverless function error:", err);
});

// Export the Express app for Vercel
export default app;

// Force deployment trigger
