// src/core/database/mysql.ts
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// 🧩 Pool de conexiones
export const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "ecoride",
  connectionLimit: 10,
});

// -----------------------------------------------------------------------------
// Helpers base (compatibles y claros)
// -----------------------------------------------------------------------------

/**
 * Ejecuta un SQL (INSERT/UPDATE/DELETE o SELECT simple).
 * Retorna el resultado crudo de mysql2: OkPacket o RowDataPacket[].
 */
export async function exec<T = RowDataPacket[] | ResultSetHeader>(
  sql: string,
  params: any[] = []
): Promise<T> {
  const [result] = (await pool.execute(sql, params)) as unknown as [T, any];
  return result;
}

/**
 * Devuelve TODAS las filas de un SELECT.
 * (Alias del `query` que ya tenías, pero sobre execute)
 */
export async function queryAll<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  return rows as unknown as T[];
}

/**
 * Devuelve SOLO una fila (o null si no hay).
 */
export async function queryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const [rows] = await pool.execute<RowDataPacket[]>(sql, params);
  const arr = rows as unknown as T[];
  return arr.length ? arr[0] : null;
}

/**
 * Llama un procedimiento almacenado: CALL spName(?, ?, ...);
 * OJO: mysql2 retorna un arreglo de result sets. Para SPs que no devuelven SELECT,
 * simplemente ignoramos el valor retornado.
 *
 * - Si tu SP retorna SELECTs, puedes acceder a `sets[0]` (primer result set).
 */
export async function callProc(procName: string, params: any[] = []): Promise<any> {
  const placeholders = params.map(() => "?").join(", ");
  const sql = `CALL ${procName}(${placeholders});`;
  const [sets] = await pool.query(sql, params);
  return sets; // puede ser RowDataPacket[][] dependiendo del SP
}

// -----------------------------------------------------------------------------
// Compatibilidad con TU API actual (alias a los nombres que ya usabas)
// -----------------------------------------------------------------------------

/** Alias del antiguo query */
export const query = queryAll;

/** Alias del antiguo callProcedure */
export async function callProcedure<T = any>(procName: string, params: any[] = []): Promise<T[]> {
  const sets = await callProc(procName, params);
  // Si tu SP no retorna SELECTs, 'sets' no es útil. Devolvemos primer result set si existe.
  if (Array.isArray(sets) && Array.isArray(sets[0])) {
    return sets[0] as T[];
  }
  return [] as T[];
}

// -----------------------------------------------------------------------------
// Diagnóstico opcional
// -----------------------------------------------------------------------------

export const testConnection = async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("✅ Conectado correctamente a MySQL");
  } catch (error) {
    console.error("❌ Error al conectar con MySQL:", error);
  }
};
