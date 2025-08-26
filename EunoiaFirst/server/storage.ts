import { 
  users, sessions, messages, crisisEvents, journalEntries, moodEntries,
  type User, type InsertUser,
  type Session, type InsertSession,
  type Message, type InsertMessage,
  type CrisisEvent, type InsertCrisisEvent,
  type JournalEntry, type InsertJournalEntry,
  type MoodEntry, type InsertMoodEntry
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Session operations
  createSession(session: InsertSession): Promise<Session>;
  getSession(id: number): Promise<Session | undefined>;
  getAllSessions(): Promise<Session[]>;
  updateSession(id: number, updates: Partial<Session>): Promise<Session>;
  endSession(id: number, summary: string, keyTopics: string[], cbtTechniques: string[], homework: string[], therapistNotes: string): Promise<Session>;
  
  // Message operations
  createMessage(message: InsertMessage): Promise<Message>;
  getSessionMessages(sessionId: number): Promise<Message[]>;
  
  // Crisis event operations
  createCrisisEvent(event: InsertCrisisEvent): Promise<CrisisEvent>;
  getCrisisEvents(sessionId: number): Promise<CrisisEvent[]>;
  
  // Journal operations
  createJournalEntry(entry: InsertJournalEntry): Promise<JournalEntry>;
  getJournalEntries(sessionId?: number): Promise<JournalEntry[]>;
  
  // Mood operations
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getMoodEntries(sessionId?: number): Promise<MoodEntry[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private sessions: Map<number, Session>;
  private messages: Map<number, Message>;
  private crisisEvents: Map<number, CrisisEvent>;
  private journalEntries: Map<number, JournalEntry>;
  private moodEntries: Map<number, MoodEntry>;
  
  private userIdCounter: number;
  private sessionIdCounter: number;
  private messageIdCounter: number;
  private crisisEventIdCounter: number;
  private journalEntryIdCounter: number;
  private moodEntryIdCounter: number;

  constructor() {
    this.users = new Map();
    this.sessions = new Map();
    this.messages = new Map();
    this.crisisEvents = new Map();
    this.journalEntries = new Map();
    this.moodEntries = new Map();
    
    this.userIdCounter = 1;
    this.sessionIdCounter = 1;
    this.messageIdCounter = 1;
    this.crisisEventIdCounter = 1;
    this.journalEntryIdCounter = 1;
    this.moodEntryIdCounter = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createSession(insertSession: InsertSession): Promise<Session> {
    const id = this.sessionIdCounter++;
    const session: Session = {
      ...insertSession,
      id,
      userId: insertSession.userId || null,
      isVoiceMode: insertSession.isVoiceMode || false,
      selectedGoals: insertSession.selectedGoals as string[],
      startTime: new Date(),
      endTime: null,
      duration: null,
      summary: null,
      keyTopics: null,
      cbtTechniques: null,
      homework: null,
      therapistNotes: null,
    };
    this.sessions.set(id, session);
    return session;
  }

  async getSession(id: number): Promise<Session | undefined> {
    return this.sessions.get(id);
  }

  async getAllSessions(): Promise<Session[]> {
    return Array.from(this.sessions.values()).sort((a, b) => {
      const dateA = new Date(a.startTime || 0).getTime();
      const dateB = new Date(b.startTime || 0).getTime();
      return dateB - dateA; // Most recent first
    });
  }

  async updateSession(id: number, updates: Partial<Session>): Promise<Session> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session with id ${id} not found`);
    }
    const updatedSession = { ...session, ...updates };
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async endSession(
    id: number,
    summary: string,
    keyTopics: string[],
    cbtTechniques: string[],
    homework: string[],
    therapistNotes: string
  ): Promise<Session> {
    const session = this.sessions.get(id);
    if (!session) {
      throw new Error(`Session with id ${id} not found`);
    }
    
    const endTime = new Date();
    const duration = session.startTime ? Math.floor((endTime.getTime() - session.startTime.getTime()) / 1000) : 0;
    
    const updatedSession: Session = {
      ...session,
      endTime,
      duration,
      summary,
      keyTopics,
      cbtTechniques,
      homework,
      therapistNotes,
    };
    
    this.sessions.set(id, updatedSession);
    return updatedSession;
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const message: Message = {
      ...insertMessage,
      id,
      timestamp: new Date(),
      isVoice: insertMessage.isVoice || false,
    };
    this.messages.set(id, message);
    return message;
  }

  async getSessionMessages(sessionId: number): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async createCrisisEvent(insertEvent: InsertCrisisEvent): Promise<CrisisEvent> {
    const id = this.crisisEventIdCounter++;
    const event: CrisisEvent = {
      ...insertEvent,
      id,
      timestamp: new Date(),
      detectedKeywords: insertEvent.detectedKeywords as string[],
      actionTaken: insertEvent.actionTaken || null,
    };
    this.crisisEvents.set(id, event);
    return event;
  }

  async getCrisisEvents(sessionId: number): Promise<CrisisEvent[]> {
    return Array.from(this.crisisEvents.values())
      .filter(event => event.sessionId === sessionId)
      .sort((a, b) => (a.timestamp?.getTime() || 0) - (b.timestamp?.getTime() || 0));
  }

  async createJournalEntry(insertEntry: InsertJournalEntry): Promise<JournalEntry> {
    const id = this.journalEntryIdCounter++;
    const entry: JournalEntry = {
      ...insertEntry,
      id,
      timestamp: new Date(),
      sessionId: insertEntry.sessionId || null,
      title: insertEntry.title || null,
      prompt: insertEntry.prompt || null,
    };
    this.journalEntries.set(id, entry);
    return entry;
  }

  async getJournalEntries(sessionId?: number): Promise<JournalEntry[]> {
    const entries = Array.from(this.journalEntries.values());
    if (sessionId) {
      return entries
        .filter(entry => entry.sessionId === sessionId)
        .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
    }
    return entries.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }

  async createMoodEntry(insertEntry: InsertMoodEntry): Promise<MoodEntry> {
    const id = this.moodEntryIdCounter++;
    const entry: MoodEntry = {
      ...insertEntry,
      id,
      timestamp: new Date(),
      sessionId: insertEntry.sessionId || null,
      moodEmoji: insertEntry.moodEmoji || null,
      notes: insertEntry.notes || null,
    };
    this.moodEntries.set(id, entry);
    return entry;
  }

  async getMoodEntries(sessionId?: number): Promise<MoodEntry[]> {
    const entries = Array.from(this.moodEntries.values());
    if (sessionId) {
      return entries
        .filter(entry => entry.sessionId === sessionId)
        .sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
    }
    return entries.sort((a, b) => (b.timestamp?.getTime() || 0) - (a.timestamp?.getTime() || 0));
  }
}

export const storage = new MemStorage();
