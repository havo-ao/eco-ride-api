import 'tsconfig-paths/register';
import dotenv from "dotenv";
dotenv.config();
import app from "./app";
import { connectMongo } from './core/database/mongodb';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Opcional: permitir omitir la conexión a MongoDB en entornos de desarrollo/tests
    // Si se exporta la variable de entorno SKIP_MONGO='true' se omite connectMongo()
    const skipMongo = String(process.env.SKIP_MONGO || '').toLowerCase() === 'true';
    if (!skipMongo) {
      // Conectamos MongoDB una sola vez antes de levantar el servidor
      await connectMongo();
    } else {
      console.log('⚠️ SKIP_MONGO detected: omitiendo conexión a MongoDB');
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
