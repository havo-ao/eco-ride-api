import 'tsconfig-paths/register';
import dotenv from 'dotenv';
dotenv.config();
import app from './app';
import { connectMongo } from './core/database/mongodb';
import logger from '@/core/logger/logger';
import { db as mysqlPool } from '@/core/database/mysql';

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    // Optionally skip Mongo connection in local dev (set SKIP_MONGO=true)
    if (process.env.SKIP_MONGO !== 'true') {
      // Conectamos MongoDB una sola vez antes de levantar el servidor
      await connectMongo();
    } else {
      logger.warn('⚠️ SKIP_MONGO=true -> arrancando sin conexión a MongoDB (temporal)');
    }

    // Quick MySQL connectivity check (log only)
    try {
      const conn = await mysqlPool.getConnection();
      conn.release();
      logger.info({ module: 'mysql', message: 'Conectado a MySQL (pool OK)' });
    } catch (mysqlErr) {
      logger.error({ module: 'mysql', message: 'Error conectando a MySQL', error: (mysqlErr as Error).message });
    }

    app.listen(PORT, () => logger.info({ module: 'server', message: `EcoRide API listening on port ${PORT}`, port: PORT, env: process.env.NODE_ENV || 'development' }));
  } catch (error) {
    logger.error({ module: 'server', message: 'Error iniciando el servidor', error: (error as Error).message, stack: (error as Error).stack });
    process.exit(1);
  }
}

startServer();
