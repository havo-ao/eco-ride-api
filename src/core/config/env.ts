import dotenv from "dotenv";
import type { SignOptions } from "jsonwebtoken";

dotenv.config();

type JwtExpiresIn = SignOptions["expiresIn"];

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  db: {
    host: process.env.DB_HOST || "localhost",
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    name: process.env.DB_NAME || "ecoride_db",
    connectionLimit: Number(process.env.DB_CONN_LIMIT || 10),
  },
  mongo: {
    uri: process.env.MONGOD_URI || "mongodb://localhost:27017/eco_ride",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "change-me",
    expiresIn: (process.env.JWT_EXPIRES_IN as JwtExpiresIn) || "1h",
  },
  kafka: {
    broker: process.env.KAFKA_BROKER || "localhost:9092",
    clientId: process.env.KAFKA_CLIENT_ID || "eco-ride-api",
    advertisedListeners:
      process.env.KAFKA_ADVERTISED_LISTENERS || "PLAINTEXT://localhost:9092",
  },

  }