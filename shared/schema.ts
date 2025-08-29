import { pgTable, text, serial, integer, boolean, timestamp, json, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  password: text("password").notNull(),
  profilePic: text("profile_pic"),
  therapistPersonality: text("therapist_personality"),
  selectedVoice: text("selected_voice"),
  selectedGoals: json("selected_goals").$type<string[]>().default([]),
  darkMode: boolean("dark_mode").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  unique("users_username_unique").on(table.username),
  unique("users_email_unique").on(table.email),
]);

export const sessions = pgTable("sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  therapistPersonality: text("therapist_personality").notNull(),
  voiceEnabled: boolean("voice_enabled").default(false),
  goals: json("goals").$type<string[]>().notNull().default([]),
  status: text("status").notNull().default("active"), // active, completed, paused
  createdAt: timestamp("created_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  durationSeconds: integer("duration_seconds"),
  summary: text("summary"),
  keyTopics: json("key_topics").$type<string[]>().default([]),
  startTime: timestamp("start_time").defaultNow(),
  duration: integer("duration"),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull(),
  content: text("content").notNull(),
  isUser: boolean("is_user").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id"),
  title: text("title"),
  content: text("content").notNull(),
  prompt: text("prompt"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const moodEntries = pgTable("mood_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id"),
  moodScore: integer("mood_score").notNull(), // 1-10
  moodEmoji: text("mood_emoji"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  profilePic: true,
});

export const insertSessionSchema = createInsertSchema(sessions).omit({
  id: true,
  createdAt: true,
  endedAt: true,
  durationSeconds: true,
  summary: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertCrisisEventSchema = createInsertSchema(crisisEvents).omit({
  id: true,
  timestamp: true,
});

export const insertJournalEntrySchema = createInsertSchema(journalEntries).omit({
  id: true,
  createdAt: true,
});

export const insertMoodEntrySchema = createInsertSchema(moodEntries).omit({
  id: true,
  createdAt: true,
});

// Types
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