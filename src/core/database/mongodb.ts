import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const mongoUri = process.env.MONGOD_URI as string;

let isConnected = false;

export async function connectMongo() {
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
  if (!isConnected) throw new Error('MongoDB no conectado. Llama a connectMongo() primero.');
  return mongoose.connection;
}

export const db = mongoose;

