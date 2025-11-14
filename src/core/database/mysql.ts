import mysql, { Pool } from "mysql2/promise";
import { env } from "../config/env";

let db!: Pool; // "definite assignment"

export const initMySQL = async (): Promise<void> => {
  if (db) {
    return;
  }

  try {
    const tempConnection = await mysql.createConnection({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password
    });

    await tempConnection.query(
      `CREATE DATABASE IF NOT EXISTS \`${env.db.name}\`;`
    );
    await tempConnection.end();

    db = mysql.createPool({
      host: env.db.host,
      port: env.db.port,
      user: env.db.user,
      password: env.db.password,
      database: env.db.name,
      connectionLimit: env.db.connectionLimit,
      connectTimeout: 10000,
      multipleStatements: true
    });

    console.log(`✅ MySQL inicializado y conectado a "${env.db.name}"`);
  } catch (error) {
    console.error("❌ Error inicializando MySQL:", error);
    throw error;
  }
};

export { db };
