import express, { type Request, Response, NextFunction } from "express";
import { users } from "../shared/schema";
import { eq, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { getDatabase, closeDatabase } from "./db";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Simple in-memory session store for serverless
const sessions = new Map();

// In-memory user store as fallback
const memoryUsers = new Map();

// Middleware to parse session from headers
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

// Health check endpoint
app.get("/api/health", async (req, res) => {
  const db = getDatabase();
  let dbTest = false;
  
  if (db) {
    try {
      // Test database connection
      await db.select().from(users).limit(1);
      dbTest = true;
    } catch (error) {
      console.error("Database test failed:", error);
    }
  }
  
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseConnected: !!db,
    databaseTest: dbTest,
    usingMemoryStore: !db || !dbTest,
    message: "Serverless function is working"
  });
});

// Signup endpoint
app.post("/api/auth/signup", async (req, res) => {
  try {
    console.log("Signup attempt:", req.body);
    
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

    let newUser;
    const db = getDatabase();

    if (db) {
      // Use database
      try {
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
        const [createdUser] = await db
          .insert(users)
          .values({
            username,
            email,
            password: hashedPassword,
          })
          .returning();

        newUser = createdUser;
        console.log("User created in database:", newUser.id);
      } catch (dbError) {
        console.error("Database error, falling back to memory:", dbError);
        // Fall back to memory store
      }
    }

    if (!db || !newUser) {
      // Use memory store
      for (const [id, user] of memoryUsers) {
        if (user.username === username) {
          return res.status(400).json({ message: "Username already exists" });
        }
        if (user.email === email) {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Create user in memory
      const userId = Date.now().toString();
      const hashedPassword = await bcrypt.hash(password, 10);
      
      newUser = {
        id: userId,
        username,
        email,
        password: hashedPassword
      };
      
      memoryUsers.set(userId, newUser);
      console.log("User created in memory:", userId);
    }

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
      message: "Account created successfully",
      storage: (db && newUser && newUser.id && !isNaN(parseInt(newUser.id))) ? "database" : "memory"
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Failed to create account", error: error.message });
  }
});

// Login endpoint
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("Login attempt:", req.body);
    
    const { usernameOrEmail, password } = req.body;
    
    if (!usernameOrEmail || !password) {
      return res.status(400).json({ message: "Username/email and password are required" });
    }

    let user = null;
    const db = getDatabase();

    if (db) {
      // Use database
      try {
        const [foundUser] = await db.select().from(users).where(
          or(eq(users.username, usernameOrEmail), eq(users.email, usernameOrEmail))
        ).limit(1);
        user = foundUser;
      } catch (dbError) {
        console.error("Database error, falling back to memory:", dbError);
      }
    }

    if (!db || !user) {
      // Use memory store
      for (const [id, memoryUser] of memoryUsers) {
        if (memoryUser.username === usernameOrEmail || memoryUser.email === usernameOrEmail) {
          user = memoryUser;
          break;
        }
      }
    }
    
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
    sessions.set(sessionToken, {
      userId: user.id,
      username: user.username,
      email: user.email
    });

    console.log("User logged in successfully:", user.id);

    res.json({ 
      id: user.id, 
      username: user.username,
      email: user.email,
      token: sessionToken,
      message: "Logged in successfully",
      storage: (db && user && user.id && !isNaN(parseInt(user.id))) ? "database" : "memory"
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Failed to log in", error: error.message });
  }
});

// Logout endpoint
app.post("/api/auth/logout", parseSession, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    sessions.delete(token);
  }
  res.json({ message: "Logged out successfully" });
});

// User profile endpoint
app.get("/api/user/profile", parseSession, requireAuth, (req, res) => {
  res.json({
    id: req.user.userId,
    username: req.user.username,
    email: req.user.email
  });
});

// Apply session parsing to all routes
app.use(parseSession);

// Error handling
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error("Serverless function error:", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(status).json({ message, error: err.message });
});

// Export the Express app for Vercel
export default app;