// Simple storage interface - keeping for compatibility
// The actual storage is handled by Drizzle ORM and database

export interface IStorage {
  // This can be extended later if needed for additional storage operations
}

export class MemStorage implements IStorage {
  // Placeholder for any in-memory storage needs
  constructor() {}
}