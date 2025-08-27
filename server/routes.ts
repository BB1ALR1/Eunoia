import type { Express } from "express";
import { createServer } from "http";
import { db } from "../shared/db";
import { sessions, messages, users, journalEntries, moodEntries, insertUserSchema, insertSessionSchema, insertMessageSchema, insertJournalEntrySchema, insertMoodEntrySchema } from "../shared/schema";
import { eq, desc, or } from "drizzle-orm";
import bcrypt from "bcrypt";
import session from "express-session";
import connectPg from "connect-pg-simple";
import multer from "multer";
import path from "path";
import fs from "fs";

// Extend session types
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
  }
}

export function registerRoutes(app: Express) {
  const server = createServer(app);

  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Multer configuration for file uploads
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `profile-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
      const allowedTypes = /jpeg|jpg|png|gif|webp/;
      const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
      const mimetype = allowedTypes.test(file.mimetype);

      if (mimetype && extname) {
        return cb(null, true);
      } else {
        cb(new Error('Only image files are allowed'));
      }
    }
  });

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

      // Create session
      (req.session as any).userId = newUser.id;
      (req.session as any).username = newUser.username;

      res.json({ 
        id: newUser.id, 
        username: newUser.username,
        email: newUser.email,
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
      }

      // Create session
      (req.session as any).userId = user.id;
      (req.session as any).username = user.username;

      res.json({ 
        id: user.id, 
        username: user.username,
        email: user.email,
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
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user preferences
  app.patch("/api/auth/preferences", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { darkMode, therapistPersonality, selectedVoice, selectedGoals } = req.body;
      
      const updateData: any = {};
      if (darkMode !== undefined) updateData.darkMode = darkMode;
      if (therapistPersonality !== undefined) updateData.therapistPersonality = therapistPersonality;
      if (selectedVoice !== undefined) updateData.selectedVoice = selectedVoice;
      if (selectedGoals !== undefined) updateData.selectedGoals = selectedGoals;
      
      const [updatedUser] = await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, userId))
        .returning();
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating preferences:", error);
      res.status(500).json({ message: "Failed to update preferences" });
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

  // Journal entries routes (protected)
  app.get("/api/journal", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const userJournalEntries = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.userId, userId))
        .orderBy(desc(journalEntries.createdAt));
      res.json(userJournalEntries);
    } catch (error) {
      console.error("Error fetching journal entries:", error);
      res.status(500).json({ message: "Failed to fetch journal entries" });
    }
  });

  app.post("/api/journal", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { title, content, sessionId } = req.body;
      
      const [newEntry] = await db
        .insert(journalEntries)
        .values({
          userId,
          sessionId: sessionId || null,
          title: title || null,
          content,
        })
        .returning();

      res.json(newEntry);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      res.status(500).json({ message: "Failed to create journal entry" });
    }
  });

  app.delete("/api/journal/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const entryId = parseInt(req.params.id);
      
      if (!entryId || isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // First check if the entry exists and belongs to the user
      const [existingEntry] = await db
        .select()
        .from(journalEntries)
        .where(eq(journalEntries.id, entryId))
        .limit(1);

      if (!existingEntry) {
        return res.status(404).json({ message: "Journal entry not found" });
      }

      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this entry" });
      }

      // Delete the entry
      await db.delete(journalEntries).where(eq(journalEntries.id, entryId));
      
      res.json({ message: "Journal entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting journal entry:", error);
      res.status(500).json({ message: "Failed to delete journal entry" });
    }
  });

  // Mood entries routes (protected)
  app.get("/api/mood", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const userMoodEntries = await db
        .select()
        .from(moodEntries)
        .where(eq(moodEntries.userId, userId))
        .orderBy(desc(moodEntries.createdAt));
      res.json(userMoodEntries);
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ message: "Failed to fetch mood entries" });
    }
  });

  app.post("/api/mood", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const { moodScore, moodEmoji, notes, sessionId } = req.body;
      
      const [newEntry] = await db
        .insert(moodEntries)
        .values({
          userId,
          sessionId: sessionId || null,
          moodScore,
          moodEmoji: moodEmoji || null,
          notes: notes || null,
        })
        .returning();

      res.json(newEntry);
    } catch (error) {
      console.error("Error creating mood entry:", error);
      res.status(500).json({ message: "Failed to create mood entry" });
    }
  });

  app.delete("/api/mood/:id", requireAuth, async (req, res) => {
    try {
      const userId = (req.session as any).userId;
      const entryId = parseInt(req.params.id);
      
      if (!entryId || isNaN(entryId)) {
        return res.status(400).json({ message: "Invalid entry ID" });
      }

      // First check if the entry exists and belongs to the user
      const [existingEntry] = await db
        .select()
        .from(moodEntries)
        .where(eq(moodEntries.id, entryId))
        .limit(1);

      if (!existingEntry) {
        return res.status(404).json({ message: "Mood entry not found" });
      }

      if (existingEntry.userId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this entry" });
      }

      // Delete the entry
      await db.delete(moodEntries).where(eq(moodEntries.id, entryId));
      
      res.json({ message: "Mood entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting mood entry:", error);
      res.status(500).json({ message: "Failed to delete mood entry" });
    }
  });

  // Account management routes
  app.patch("/api/auth/change-password", requireAuth, async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: "Current password and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }

      // Get current user
      const [user] = await db.select().from(users).where(eq(users.id, (req.session as any).userId)).limit(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Current password is incorrect" });
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      // Update password
      await db
        .update(users)
        .set({ password: hashedNewPassword })
        .where(eq(users.id, (req.session as any).userId));

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error changing password:", error);
      res.status(500).json({ message: "Failed to change password" });
    }
  });

  app.patch("/api/auth/update-profile", requireAuth, async (req, res) => {
    try {
      const { username, email, profilePic } = req.body;
      
      if (!username || !email) {
        return res.status(400).json({ message: "Username and email are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Please enter a valid email address" });
      }

      // Check if username or email already exists (excluding current user)
      const existingUser = await db.select().from(users).where(
        or(eq(users.username, username), eq(users.email, email))
      ).limit(1);
      
      if (existingUser.length > 0 && existingUser[0].id !== (req.session as any).userId) {
        const existing = existingUser[0];
        if (existing.username === username) {
          return res.status(400).json({ message: "Username already exists" });
        } else {
          return res.status(400).json({ message: "Email already exists" });
        }
      }

      // Update user profile
      const [updatedUser] = await db
        .update(users)
        .set({ 
          username, 
          email, 
          profilePic: profilePic || null 
        })
        .where(eq(users.id, (req.session as any).userId))
        .returning();

      // Update session username
      (req.session as any).username = updatedUser.username;

      res.json({ 
        id: updatedUser.id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePic: updatedUser.profilePic,
        message: "Profile updated successfully" 
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Profile picture upload endpoint
  app.post("/api/auth/upload-profile-pic", requireAuth, upload.single('profilePic'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const userId = (req.session as any).userId;
      const profilePicUrl = `/uploads/${req.file.filename}`;

      // Get current user to check for existing profile pic
      const [currentUser] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      
      // Delete old profile picture if it exists
      if (currentUser && currentUser.profilePic) {
        const oldPicPath = path.join(process.cwd(), 'public', currentUser.profilePic);
        if (fs.existsSync(oldPicPath)) {
          try {
            fs.unlinkSync(oldPicPath);
          } catch (error) {
            console.warn("Could not delete old profile picture:", error);
          }
        }
      }

      // Update user profile with new profile picture
      const [updatedUser] = await db
        .update(users)
        .set({ profilePic: profilePicUrl })
        .where(eq(users.id, userId))
        .returning();

      const { password, ...userWithoutPassword } = updatedUser;

      res.json({
        ...userWithoutPassword,
        message: "Profile picture updated successfully"
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      
      // Clean up uploaded file if there was an error
      if (req.file) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.warn("Could not clean up uploaded file:", cleanupError);
        }
      }
      
      res.status(500).json({ message: "Failed to upload profile picture" });
    }
  });

  app.get("/api/auth/download-data", requireAuth, async (req, res) => {
    try {
      // Get user data
      const [user] = await db.select().from(users).where(eq(users.id, (req.session as any).userId)).limit(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get user's sessions
      const userSessions = await db
        .select()
        .from(sessions)
        .where(eq(sessions.userId, (req.session as any).userId))
        .orderBy(desc(sessions.createdAt));

      // Get all messages for user's sessions
      const sessionIds = userSessions.map(s => s.id);
      const userMessages = sessionIds.length > 0 
        ? await db
            .select()
            .from(messages)
            .where(eq(messages.sessionId, sessionIds[0])) // For now, just first session
            .orderBy(messages.createdAt)
        : [];

      const userData = {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt
        },
        sessions: userSessions,
        messages: userMessages,
        exportDate: new Date().toISOString()
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="my-eunoia-data.json"');
      res.json(userData);
    } catch (error) {
      console.error("Error downloading user data:", error);
      res.status(500).json({ message: "Failed to download user data" });
    }
  });

  app.delete("/api/auth/delete-account", requireAuth, async (req, res) => {
    try {
      const { password } = req.body;
      
      if (!password) {
        return res.status(400).json({ message: "Password is required to delete account" });
      }

      // Get current user
      const [user] = await db.select().from(users).where(eq(users.id, (req.session as any).userId)).limit(1);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Password is incorrect" });
      }

      // Delete user (this will cascade delete sessions and messages if foreign keys are set)
      await db.delete(users).where(eq(users.id, (req.session as any).userId));

      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
        }
      });

      res.clearCookie('connect.sid');
      res.json({ message: "Account deleted successfully" });
    } catch (error) {
      console.error("Error deleting account:", error);
      res.status(500).json({ message: "Failed to delete account" });
    }
  });

  return server;
}