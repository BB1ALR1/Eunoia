import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  therapistPersonality: text("therapist_personality").notNull(),
  selectedVoice: text("selected_voice").notNull(),
  selectedGoals: json("selected_goals").$type<string[]>().notNull(),
  isVoiceMode: boolean("is_voice_mode").default(true),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  duration: integer("duration_seconds"),
  summary: text("summary"),
  keyTopics: json("key_topics").$type<string[]>(),
  cbtTechniques: json("cbt_techniques").$type<string[]>(),
  homework: json("homework").$type<string[]>(),
  therapistNotes: text("therapist_notes"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  isVoice: boolean("is_voice").default(false),
});

export const crisisEvents = pgTable("crisis_events", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  detectedKeywords: json("detected_keywords").$type<string[]>().notNull(),
  userMessage: text("user_message").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  actionTaken: text("action_taken"),
});

export const journalEntries = pgTable("journal_entries", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id"),
  title: text("title"),
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
  prompt: text("prompt"),
});

export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id"),
  moodScore: integer("mood_score").notNull(), // 1-10
  moodEmoji: text("mood_emoji"),
  notes: text("notes"),
  timestamp: timestamp("timestamp").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertSessionSchema = createInsertSchema(sessions).pick({
  userId: true,
  therapistPersonality: true,
  selectedVoice: true,
  selectedGoals: true,
  isVoiceMode: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  sessionId: true,
  role: true,
  content: true,
  isVoice: true,
}).partial({ role: true }); // Make role optional since it's set by the server

export const insertCrisisEventSchema = createInsertSchema(crisisEvents).pick({
  sessionId: true,
  detectedKeywords: true,
  userMessage: true,
  actionTaken: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).pick({
  sessionId: true,
  title: true,
  content: true,
  prompt: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).pick({
  sessionId: true,
  moodScore: true,
  moodEmoji: true,
  notes: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessions.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertCrisisEvent = z.infer<typeof insertCrisisEventSchema>;
export type CrisisEvent = typeof crisisEvents.$inferSelect;
export type InsertJournalEntry = z.infer<typeof insertJournalEntrySchema>;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;
