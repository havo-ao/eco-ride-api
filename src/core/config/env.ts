import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

type JwtExpiresIn = SignOptions["expiresIn"];

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  db: {
    host: process.env.DB_HOST || "127.0.0.1",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "ecoride_db",
    connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
  },
  jwt: {
    secret: process.env.JWT_SECRET || "change-me",
    expiresIn: (process.env.JWT_EXPIRES_IN as JwtExpiresIn) || "1h",
  },
};
