import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertSessionSchema, 
  insertMessageSchema, 
  insertCrisisEventSchema,
  insertJournalEntrySchema,
  insertMoodEntrySchema
} from "@shared/schema";
import { therapeuticAI } from "./services/therapeutic-ai";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Create a new therapy session
  app.post("/api/sessions", async (req, res) => {
    try {
      const sessionData = insertSessionSchema.parse(req.body);
      const session = await storage.createSession(sessionData);
      
      // Create initial therapist greeting using AI
      let greeting: string;
      try {
        greeting = await therapeuticAI.getTherapistResponse(
          sessionData.therapistPersonality,
          [{ role: 'system', content: 'This is the start of a new therapy session. Provide a warm, professional greeting.' }],
          sessionData.selectedGoals
        );
      } catch (error) {
        // Fallback greeting if AI fails
        const therapistName = therapeuticAI.therapistPersonalities[sessionData.therapistPersonality]?.name || 'Dr. Emma';
        greeting = `Hello! I'm ${therapistName}. I'm here to support you through whatever you're experiencing today. How are you feeling right now?`;
      }
      
      await storage.createMessage({
        sessionId: session.id,
        role: 'assistant',
        content: greeting,
        isVoice: false
      });
      
      res.json(session);
    } catch (error) {
      res.status(400).json({ message: "Failed to create session", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get all session summaries (must be before :id route)
  app.get("/api/sessions/summaries", async (req, res) => {
    try {
      const sessions = await storage.getAllSessions();
      // Only return sessions that have been completed (have summaries)
      const completedSessions = sessions.filter(session => session.summary);
      res.json(completedSessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to get session summaries", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get session details
  app.get("/api/sessions/:id", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      res.json(session);
    } catch (error) {
      res.status(500).json({ message: "Failed to get session", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get session messages
  app.get("/api/sessions/:id/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const messages = await storage.getSessionMessages(sessionId);
      res.json(messages);
    } catch (error) {
      res.status(500).json({ message: "Failed to get messages", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Send message to therapist
  app.post("/api/sessions/:id/messages", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      
      // Get session first to ensure it exists
      const session = await storage.getSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const messageData = {
        sessionId,
        role: 'user' as const,
        content: req.body.content,
        isVoice: req.body.isVoice || false
      };
      
      // Check for crisis keywords
      const crisisKeywords = await therapeuticAI.detectCrisisKeywords(messageData.content);
      if (crisisKeywords.length > 0) {
        // Log crisis event
        await storage.createCrisisEvent({
          sessionId,
          detectedKeywords: crisisKeywords,
          userMessage: messageData.content,
          actionTaken: "Crisis modal triggered"
        });
        
        // Return crisis response
        return res.json({
          message: await storage.createMessage(messageData),
          crisis: true,
          crisisKeywords
        });
      }
      
      // Create user message
      const userMessage = await storage.createMessage(messageData);
      
      // Get conversation history
      const messages = await storage.getSessionMessages(sessionId);
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content
      }));
      
      // Get AI response with fallback
      let aiResponse: string;
      try {
        aiResponse = await therapeuticAI.getTherapistResponse(
          session.therapistPersonality,
          conversationHistory,
          session.selectedGoals
        );
      } catch (aiError) {
        console.error("AI Response Error:", aiError);
        // Fallback response when AI is not available
        aiResponse = "I understand you're reaching out, and I'm here to listen. While I'm having some technical difficulties with my AI responses right now, I want you to know that your feelings are valid and important. Please feel free to continue sharing, and consider reaching out to a human therapist or crisis hotline if you need immediate support. You can also use the CBT tools, journal, and mood tracking features in the sidebar to help process your thoughts and feelings.";
      }
      
      // Create AI message
      const aiMessage = await storage.createMessage({
        sessionId,
        role: 'assistant',
        content: aiResponse,
        isVoice: messageData.isVoice
      });
      
      res.json({
        userMessage,
        aiMessage,
        crisis: false
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to send message", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // End session and generate summary
  app.post("/api/sessions/:id/end", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const session = await storage.getSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Get all messages for summary
      const messages = await storage.getSessionMessages(sessionId);
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.timestamp
      }));
      
      // Calculate duration
      const duration = session.startTime ? Math.floor((Date.now() - session.startTime.getTime()) / 1000) : 0;
      
      // Generate session summary
      const summary = await therapeuticAI.generateSessionSummary(
        conversationHistory,
        session.therapistPersonality,
        duration
      );
      
      // End session with summary
      const endedSession = await storage.endSession(
        sessionId,
        `Session completed successfully. Duration: ${Math.floor(duration / 60)} minutes.`,
        summary.keyTopics,
        summary.cbtTechniques,
        summary.homework,
        summary.therapistNotes
      );
      
      res.json(endedSession);
    } catch (error) {
      res.status(500).json({ message: "Failed to end session", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Get crisis events for a session
  app.get("/api/sessions/:id/crisis", async (req, res) => {
    try {
      const sessionId = parseInt(req.params.id);
      const crisisEvents = await storage.getCrisisEvents(sessionId);
      res.json(crisisEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to get crisis events", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Journal routes
  app.post("/api/journal", async (req, res) => {
    try {
      const entryData = insertJournalEntrySchema.parse(req.body);
      const entry = await storage.createJournalEntry(entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Failed to create journal entry", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/journal", async (req, res) => {
    try {
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      const entries = await storage.getJournalEntries(sessionId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get journal entries", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  // Mood routes  
  app.post("/api/mood", async (req, res) => {
    try {
      const entryData = insertMoodEntrySchema.parse(req.body);
      const entry = await storage.createMoodEntry(entryData);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Failed to create mood entry", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  app.get("/api/mood", async (req, res) => {
    try {
      const sessionId = req.query.sessionId ? parseInt(req.query.sessionId as string) : undefined;
      const entries = await storage.getMoodEntries(sessionId);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to get mood entries", error: error instanceof Error ? error.message : "Unknown error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
