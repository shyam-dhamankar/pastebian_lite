import { MongoClient, Db } from 'mongodb';

const DB_NAME = 'pastebin';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    console.log('MongoDB - Using cached connection');
    return { client: cachedClient, db: cachedDb };
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    throw new Error('Please define MONGODB_URI environment variable in .env.local');
  }

  console.log('MongoDB - Connecting to database...');
  const client = await MongoClient.connect(MONGODB_URI);
  const db = client.db(DB_NAME);
  console.log('MongoDB - Connected successfully to database:', DB_NAME);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}

export async function getDatabase(): Promise<Db> {
  const { db } = await connectToDatabase();
  return db;
}
