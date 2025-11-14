import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logger from '@/core/logger/logger';

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
    try {
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      });

      isConnected = true;
      logger.info({ module: 'mongodb', message: 'Conectado a MongoDB' });
    } catch (error) {
      logger.error({ module: 'mongodb', message: 'Error conectando a MongoDB', error: (error as Error).message, stack: (error as Error).stack });
      throw error;
    }
  }
  return mongoose.connection;
}

export function getMongoConnection() {
  if (!isConnected && !skipMongo) throw new Error('MongoDB no conectado. Llama a connectMongo() primero.');
  return mongoose.connection;
}

export const db = mongoose;
export const isMongoSkipped = skipMongo;

