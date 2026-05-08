import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer | null = null;

/**
 * Connects to MongoDB. If MONGODB_URI is not provided, 
 * it starts an in-memory database for demo purposes.
 */
export async function connectDB(): Promise<void> {
  try {
    let uri = process.env.MONGODB_URI;

    if (!uri) {
      console.log('ℹ️  No MONGODB_URI found, starting in-memory database...');
      mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
    }

    await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    if (mongod) console.log('📁 Using In-Memory Storage (Data will be lost on restart)');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
}

/** Closes the connection and stops the in-memory server */
export async function closeDB(): Promise<void> {
  await mongoose.disconnect();
  if (mongod) await mongod.stop();
}
