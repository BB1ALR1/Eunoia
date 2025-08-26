import { pgTable, serial, integer, json, text, timestamp, boolean, unique } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const crisisEvents = pgTable("crisis_events", {
	id: serial().primaryKey().notNull(),
	sessionId: integer("session_id").notNull(),
	detectedKeywords: json("detected_keywords").notNull(),
	userMessage: text("user_message").notNull(),
	timestamp: timestamp({ mode: 'string' }).defaultNow(),
	actionTaken: text("action_taken"),
});

export const journalEntries = pgTable("journal_entries", {
	id: serial().primaryKey().notNull(),
	sessionId: integer("session_id"),
	title: text(),
	content: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const messages = pgTable("messages", {
	id: serial().primaryKey().notNull(),
	sessionId: integer("session_id").notNull(),
	content: text().notNull(),
	isUser: boolean("is_user").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const moodEntries = pgTable("mood_entries", {
	id: serial().primaryKey().notNull(),
	sessionId: integer("session_id"),
	moodScore: integer("mood_score").notNull(),
	moodEmoji: text("mood_emoji"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
});

export const sessions = pgTable("sessions", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id"),
	therapistPersonality: text("therapist_personality").notNull(),
	voiceEnabled: boolean("voice_enabled").default(false),
	goals: json().default([]).notNull(),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	endedAt: timestamp("ended_at", { mode: 'string' }),
	durationSeconds: integer("duration_seconds"),
	summary: text(),
});

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	password: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	unique("users_username_unique").on(table.username),
]);
