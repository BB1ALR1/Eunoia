import type { Express } from "express";
import { createServer } from "http";
import { db } from "../shared/db";
import { sessions, messages, users } from "../shared/schema";
import { eq, desc } from "drizzle-orm";

export function registerRoutes(app: Express) {
  const server = createServer(app);

  // Get all sessions
  app.get("/api/sessions", async (req, res) => {
    try {
      const allSessions = await db.select().from(sessions).orderBy(desc(sessions.createdAt));
      res.json(allSessions);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      res.status(500).json({ message: "Failed to fetch sessions" });
    }
  });

  // Get session by ID with messages
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await db.select().from(sessions).where(eq(sessions.id, sessionId)).limit(1);
      
      if (!session.length) {
        return res.status(404).json({ message: "Session not found" });
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

  // Create new session
  app.post("/api/sessions", async (req, res) => {
    try {
      const { therapistPersonality, voiceEnabled, goals } = req.body;
      
      const [newSession] = await db
        .insert(sessions)
        .values({
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

  // Send message (without AI response for now)
  app.post("/api/sessions/:sessionId/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.sessionId);
      const { content, isUser } = req.body;

      // Save user message
      const [userMessage] = await db
        .insert(messages)
        .values({
          sessionId,
          content,
          isUser: true,
          createdAt: new Date()
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

  // End session
  app.patch("/api/sessions/:id/end", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      
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

  return server;
}