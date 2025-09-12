import express, { type Request, Response, NextFunction } from "express";
import { db } from "../shared/db";
import { users, sessions as sessionsTable, messages, journalEntries, moodEntries, passwordResetTokens, insertUserSchema, insertSessionSchema, insertMessageSchema, insertJournalEntrySchema, insertMoodEntrySchema, insertPasswordResetTokenSchema } from "../shared/schema";
import { eq, desc, or, and, lt, gt } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple in-memory session store for serverless (not ideal for production)
const sessionStore = new Map<string, { userId: number; username: string; email: string }>();

// Middleware to parse session from headers (simple token-based auth)
const parseSession = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const sessionData = sessionStore.get(token);
    if (sessionData) {
      req.user = sessionData;
    }
  }
  next();
};

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Authentication routes
app.post("/api/auth/signup", async (req: Request, res: Response) => {
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
    sessionStore.set(sessionToken, {
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error creating user:", errorMessage);
    res.status(500).json({ message: "Failed to create account" });
  }
});

app.post("/api/auth/login", async (req: Request, res: Response) => {
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
    }

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    sessionStore.set(sessionToken, {
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error logging in:", errorMessage);
    res.status(500).json({ message: "Failed to log in" });
  }
});

app.post("/api/auth/logout", parseSession, (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sessionStore.delete(token);
  }
  res.json({ message: "Logged out successfully" });
});

// Apply session parsing to all routes
app.use(parseSession);

// Basic API routes (simplified for serverless)
app.get("/api/user/profile", requireAuth, (req: Request, res: Response) => {
  const user = req.user!;
  res.json({
    id: user.userId,
    username: user.username,
    email: user.email
  });
});

// Health check
app.get("/api/health", (req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
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
