// src/core/kafka/kafka.ts
import { Kafka, Producer } from "kafkajs";
import { env } from "../config/env";

let kafkaClient: Kafka | null = null;
let producer: Producer | null = null;

const DEFAULT_RETRY = { retries: 5, factor: 2, minTimeout: 1000 };

export async function initKafka(): Promise<Producer> {
  if (producer) return producer;

  if (!kafkaClient) {
    kafkaClient = new Kafka({
      clientId: env.kafka.clientId || process.env.KAFKA_CLIENT_ID || "eco-ride-api",
      brokers: [env.kafka.broker || process.env.KAFKA_BROKER || "localhost:9092"],
      // connectionTimeout: 3000,
      // requestTimeout: 25000,
    });
  }

  producer = kafkaClient.producer({
    // options: allow auto connect, idempotent?
    // idempotent: true // use with caution (broker must support)
  });

  // Connect with retry loop
  const maxAttempts = 5;
  let attempt = 0;
  while (attempt < maxAttempts) {
    try {
      await producer.connect();
      console.log("✅ Kafka producer connected");
      break;
    } catch (err) {
      attempt++;
      console.warn(`⚠️ Kafka producer connect attempt ${attempt} failed: ${(err as Error).message}`);
      if (attempt >= maxAttempts) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }

  // graceful shutdown
  const shutdown = async () => {
    try {
      if (producer) {
        await producer.disconnect();
        console.log("🛑 Kafka producer disconnected");
      }
    } catch (e) {
      console.warn("⚠️ Error disconnecting kafka producer", e);
    }
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
  process.on("beforeExit", shutdown);

  return producer;
}

export function getProducer(): Producer {
  if (!producer) throw new Error("Kafka producer not initialized. Call initKafka() first.");
  return producer;
}
