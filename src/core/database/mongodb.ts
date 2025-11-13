import dotenv from 'dotenv';
import mongoose from 'mongoose';
import logger from '@/core/logger/logger';

dotenv.config();

const mongoUri = process.env.MONGOD_URI as string;

let isConnected = false;

export async function connectMongo() {
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
  if (!isConnected) throw new Error('MongoDB no conectado. Llama a connectMongo() primero.');
  return mongoose.connection;
}

export const db = mongoose;

