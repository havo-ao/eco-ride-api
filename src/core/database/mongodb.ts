import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const mongoUri = process.env.MONGOD_URI as string;

// Detect SKIP_MONGO env var (accept 'true' or '1')
const skipMongo = (() => {
  const v = process.env.SKIP_MONGO;
  if (!v) return false;
  return v === '1' || v.toLowerCase() === 'true';
})();

let isConnected = false;

export async function connectMongo() {
  if (skipMongo) {
    console.warn('⚠️ SKIP_MONGO is set — skipping MongoDB connection.');
    return mongoose.connection;
  }

  if (!isConnected) {
    await mongoose.connect(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
    });

    isConnected = true;
    console.log('✅ Conectado a MongoDB');
  }
  return mongoose.connection;
}

export function getMongoConnection() {
  if (!isConnected && !skipMongo) throw new Error('MongoDB no conectado. Llama a connectMongo() primero.');
  return mongoose.connection;
}

export const db = mongoose;
export const isMongoSkipped = skipMongo;

