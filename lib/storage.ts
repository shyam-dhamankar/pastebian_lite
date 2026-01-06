import { getDatabase } from './mongodb';
import { Collection } from 'mongodb';

export interface Paste {
  id: string;
  content: string;
  createdAt: number;
  ttlSeconds?: number;
  maxViews?: number;
  currentViews: number;
}

export interface Storage {
  createPaste(paste: Omit<Paste, 'id' | 'createdAt' | 'currentViews'>): Promise<Paste>;
  getPaste(id: string, currentTimeMs?: number): Promise<Paste | null>;
  updatePaste(id: string, paste: Partial<Paste>): Promise<Paste | null>;
  deletePaste(id: string): Promise<boolean>;
}

class InMemoryStorage implements Storage {
  private store: Map<string, Paste> = new Map();
  
  async createPaste(pasteData: Omit<Paste, 'id' | 'createdAt' | 'currentViews'>): Promise<Paste> {
    const id = generateId();
    const paste: Paste = {
      id,
      ...pasteData,
      createdAt: Date.now(),
      currentViews: 0,
    };
    
    this.store.set(id, paste);
    return paste;
  }
  
  async getPaste(id: string, currentTimeMs: number = Date.now()): Promise<Paste | null> {
    const paste = this.store.get(id);
    if (!paste) {
      return null;
    }
    
    if (this.isExpired(paste, currentTimeMs)) {
      this.store.delete(id);
      return null;
    }
    
    return paste;
  }
  
  async updatePaste(id: string, pasteData: Partial<Paste>): Promise<Paste | null> {
    const existingPaste = this.store.get(id);
    if (!existingPaste) {
      return null;
    }
    
    const updatedPaste = { ...existingPaste, ...pasteData };
    this.store.set(id, updatedPaste);
    return updatedPaste;
  }
  
  async deletePaste(id: string): Promise<boolean> {
    return this.store.delete(id);
  }
  
  private isExpired(paste: Paste, currentTimeMs: number): boolean {
    if (paste.ttlSeconds !== undefined) {
      const pasteAgeMs = currentTimeMs - paste.createdAt;
      if (pasteAgeMs > paste.ttlSeconds * 1000) {
        return true;
      }
    }
    
    if (paste.maxViews !== undefined && paste.currentViews >= paste.maxViews) {
      return true;
    }
    
    return false;
  }
}

class MongoDBStorage implements Storage {
  private collectionName = 'pastes';
  
  private async getCollection(): Promise<Collection> {
    const db = await getDatabase();
    return db.collection(this.collectionName);
  }
  
  async createPaste(pasteData: Omit<Paste, 'id' | 'createdAt' | 'currentViews'>): Promise<Paste> {
    try {
      const id = generateId();
      const paste: Paste = {
        id,
        ...pasteData,
        createdAt: Date.now(),
        currentViews: 0,
      };
      
      const collection = await this.getCollection();
      // Store document with custom _id field
      const doc: any = {
        _id: id,
        content: paste.content,
        createdAt: paste.createdAt,
        currentViews: paste.currentViews,
      };
      
      // Only add optional fields if they have values
      if (paste.ttlSeconds !== undefined && paste.ttlSeconds !== null) {
        doc.ttlSeconds = paste.ttlSeconds;
      }
      if (paste.maxViews !== undefined && paste.maxViews !== null) {
        doc.maxViews = paste.maxViews;
      }
      
      console.log('MongoDB createPaste - Saving document:', doc);
      const result = await collection.insertOne(doc);
      console.log('MongoDB createPaste - Insert result:', result);
      console.log('MongoDB createPaste - Created paste with ID:', id);
      
      return paste;
    } catch (error) {
      console.error('MongoDB createPaste - Error:', error);
      throw error;
    }
  }
  
  async getPaste(id: string, currentTimeMs: number = Date.now()): Promise<Paste | null> {
    try {
      const collection = await this.getCollection();
      const doc = await collection.findOne({ _id: id as any });
      
      console.log('MongoDB getPaste - ID:', id);
      console.log('MongoDB getPaste - Document found:', doc);
      
      if (!doc) {
        console.log('MongoDB getPaste - No document found');
        return null;
      }
      
      const paste: Paste = {
        id: String(doc._id),
        content: doc.content || '',
        createdAt: doc.createdAt || Date.now(),
        ttlSeconds: doc.ttlSeconds,
        maxViews: doc.maxViews,
        currentViews: doc.currentViews || 0,
      };
      
      console.log('MongoDB getPaste - Parsed paste:', paste);
      
      if (this.isExpired(paste, currentTimeMs)) {
        console.log('MongoDB getPaste - Paste expired, deleting');
        await this.deletePaste(id);
        return null;
      }
      
      return paste;
    } catch (error) {
      console.error('MongoDB getPaste - Error:', error);
      throw error;
    }
  }
  
  async updatePaste(id: string, pasteData: Partial<Paste>): Promise<Paste | null> {
    const collection = await this.getCollection();
    const result = await collection.findOneAndUpdate(
      { _id: id as any },
      { $set: pasteData },
      { returnDocument: 'after' }
    );
    
    if (!result) {
      return null;
    }
    
    return {
      id: String(result._id),
      content: result.content,
      createdAt: result.createdAt,
      ttlSeconds: result.ttlSeconds,
      maxViews: result.maxViews,
      currentViews: result.currentViews,
    };
  }
  
  async deletePaste(id: string): Promise<boolean> {
    const collection = await this.getCollection();
    const result = await collection.deleteOne({ _id: id as any });
    return result.deletedCount > 0;
  }
  
  private isExpired(paste: Paste, currentTimeMs: number): boolean {
    // Check TTL expiration (only if ttlSeconds is a valid positive number)
    if (paste.ttlSeconds !== undefined && paste.ttlSeconds !== null && paste.ttlSeconds > 0) {
      const pasteAgeMs = currentTimeMs - paste.createdAt;
      if (pasteAgeMs > paste.ttlSeconds * 1000) {
        console.log('Paste expired by TTL');
        return true;
      }
    }
    
    // Check max views expiration (only if maxViews is a valid positive number)
    if (paste.maxViews !== undefined && paste.maxViews !== null && paste.maxViews > 0) {
      if (paste.currentViews >= paste.maxViews) {
        console.log('Paste expired by max views');
        return true;
      }
    }
    
    return false;
  }
}

let storageInstance: Storage | null = null;

export function getStorage(): Storage {
  if (!storageInstance) {
    storageInstance = new MongoDBStorage();
  }
  return storageInstance;
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}