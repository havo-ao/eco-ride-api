import 'tsconfig-paths/register';
import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectMongo } from "./core/database/mongodb";
import { initMySQL } from "./core/database/mysql";

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    console.log("🔧 Inicializando conexiones...");

    await initMySQL();
    await connectMongo();

    app.listen(PORT, () => 
      console.log(`🚀 EcoRide API listening on port ${PORT}`)
    );

  } catch (error) {
    console.error("❌ Error iniciando el servidor:", error);
    process.exit(1);
  }
}

startServer();
