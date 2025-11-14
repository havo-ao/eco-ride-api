import 'tsconfig-paths/register';
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { connectMongo } from './core/database/mongodb';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Detect SKIP_MONGO env var (PowerShell sets it via $env:SKIP_MONGO = 'true')
    const skipMongo = (() => {
      const v = process.env.SKIP_MONGO;
      return !!v && (v === '1' || v.toLowerCase() === 'true');
    })();

    // Log the raw value for easier debugging when running via PowerShell
    console.log(`SKIP_MONGO=${process.env.SKIP_MONGO ?? 'unset'}`);

    if (!skipMongo) {
      // Conectamos MongoDB una sola vez antes de levantar el servidor
      await connectMongo();
    } else {
      console.warn('⚠️ SKIP_MONGO is set — starting server without connecting to MongoDB');
    }

    app.listen(PORT, () => 
      console.log(`🚀 EcoRide API listening on port ${PORT}`)
    );
  } catch (error) {
    console.error('❌ Error iniciando el servidor:', error);
    process.exit(1);
  }
}

startServer();
