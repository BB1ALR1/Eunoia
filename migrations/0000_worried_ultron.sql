-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE "crisis_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"detected_keywords" json NOT NULL,
	"user_message" text NOT NULL,
	"timestamp" timestamp DEFAULT now(),
	"action_taken" text
);
--> statement-breakpoint
CREATE TABLE "journal_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"title" text,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer NOT NULL,
	"content" text NOT NULL,
	"is_user" boolean NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mood_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"session_id" integer,
	"mood_score" integer NOT NULL,
	"mood_emoji" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer,
	"therapist_personality" text NOT NULL,
	"voice_enabled" boolean DEFAULT false,
	"goals" json DEFAULT '[]'::json NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"ended_at" timestamp,
	"duration_seconds" integer,
	"summary" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username")
);

*/