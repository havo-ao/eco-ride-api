import 'tsconfig-paths/register';
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { connectMongo } from './core/database/mongodb';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Conectamos MongoDB una sola vez antes de levantar el servidor
    await connectMongo();

    app.listen(PORT, () => 
      console.log(`🚀 EcoRide API listening on port ${PORT}`)
    );
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

startServer();
