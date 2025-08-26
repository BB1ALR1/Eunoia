import type { Express } from "express";
import { createServer } from "http";
import { db } from "../shared/db";
import { sessions, messages, users, insertUserSchema, insertSessionSchema, insertMessageSchema } from "../shared/schema";
import { eq, desc } from "drizzle-orm";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";

// Extend session types
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
  }
}

export function registerRoutes(app: Express) {
  const server = createServer(app);

  // Session configuration
  const pgStore = connectPg(session);
  app.use(session({
    store: new pgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    },
  }));

  // Middleware to check authentication
  const requireAuth = (req: any, res: any, next: any) => {
    if (!(req.session as any).userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }

      // Check if username already exists
      const existingUser = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (existingUser.length > 0) {
        return res.status(400).json({ message: "Username already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const [newUser] = await db
        .insert(users)
        .values({
          username,
          password: hashedPassword,
        })
        .returning();

      // Create session
      (req.session as any).userId = newUser.id;
      (req.session as any).username = newUser.username;

      res.json({ 
        id: newUser.id, 
        username: newUser.username,
        message: "Account created successfully" 
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      // Find user
      const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).username = user.username;

      res.json({ 
        id: user.id, 
        username: user.username,
        message: "Logged in successfully" 
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Failed to log out" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", requireAuth, async (req, res) => {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, (req.session as any).userId)).limit(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ 
        id: user.id, 
        username: user.username 
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Protected sessions routes (now require authentication)
  app.get("/api/sessions", requireAuth, async (req, res) => {
    try {
      const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, (req.session as any).userId))
        .orderBy(desc(sessions.createdAt));
      res.json(userSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Get session by ID with messages (protected)
  app.get("/api/sessions/:id", requireAuth, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await db
        .select()
        .from(sessions)
        .where(eq(sessions.id, sessionId))
        .limit(1);
      
      if (!session.length) {
        return res.status(404).json({ message: "Session not found" });
      }

      // Ensure session belongs to the authenticated user
      if (session[0].userId !== (req.session as any).userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      const sessionMessages = await db
        .select()
        .from(messages)
        .where(eq(messages.sessionId, sessionId))
        .orderBy(messages.createdAt);

      res.json({ ...session[0], messages: sessionMessages });
    } catch (error) {
      console.error("Error fetching session:", error);
      res.status(500).json({ message: "Failed to fetch session" });
    }
  });

  // Create new session (protected)
  app.post("/api/sessions", requireAuth, async (req, res) => {
    try {
      const { therapistPersonality, voiceEnabled, goals } = req.body;
      
      const [newSession] = await db
        .insert(sessions)
        .values({
          userId: (req.session as any).userId,
          therapistPersonality: therapistPersonality || "empathetic",
          voiceEnabled: voiceEnabled || false,
          goals: goals || [],
          status: "active"
        })
        .returning();

      res.json(newSession);
    } catch (error) {
      console.error("Error creating session:", error);
      res.status(500).json({ message: "Failed to create session" });
    }
  });

  // Send message (protected)
  app.post("/api/sessions/:sessionId/messages", requireAuth, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { content, isUser } = req.body;

      // Verify session belongs to user
      const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
      if (!session.length || session[0].userId !== (req.session as any).userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Save user message
      const [userMessage] = await db
        .insert(messages)
        .values({
          sessionId,
          content,
          isUser: true,
        })
        .returning();

      // For now, just return the user message without AI response
      // In the future, you can add your own response logic here
      res.json({ userMessage });
    } catch (error) {
      console.error("Error sending message:", error);
      res.status(500).json({ message: "Failed to send message" });
    }
  });

  // End session (protected)
  app.patch("/api/sessions/:id/end", requireAuth, async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      
      // Verify session belongs to user
      const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
      if (!session.length || session[0].userId !== (req.session as any).userId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const [updatedSession] = await db
        .update(sessions)
        .set({ 
          status: "completed",
          endedAt: new Date(),
          summary: "Session completed" // Simple summary for now
        })
        .where(eq(sessions.id, sessionId))
        .returning();

      res.json(updatedSession);
    } catch (error) {
      console.error("Error ending session:", error);
      res.status(500).json({ message: "Failed to end session" });
    }
  });

  // Get session summaries (protected)
  app.get("/api/sessions/summaries", requireAuth, async (req, res) => {
    try {
      const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, (req.session as any).userId))
        .orderBy(desc(sessions.createdAt));
      res.json(userSessions);
    } catch (error) {
      console.error("Error fetching session summaries:", error);
      res.status(500).json({ message: "Failed to fetch session summaries" });
    }
  });

  // Add routes for journal entries, mood entries, etc. (protected)
  app.get("/api/journal", requireAuth, async (req, res) => {
    try {
      // For now, return empty array since journal entries need session relationship
      res.json([]);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.get("/api/mood", requireAuth, async (req, res) => {
    try {
      // For now, return empty array since mood entries need session relationship
      res.json([]);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  return server;
}