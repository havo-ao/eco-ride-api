import mysql from "mysql2/promise";
import { env } from "../config/env";

export const db = mysql.createPool({
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  database: env.db.name,
  connectionLimit: env.db.connectionLimit,
  connectTimeout: 10000,
  multipleStatements: true,
});
