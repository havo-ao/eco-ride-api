// src/modules/telemetry/telemetry.service.ts
import { getProducer } from "../../core/kafka/kafka";

export class TelemetryService {
  async sendLockEvent(action: "unlock" | "lock", data: { bikeId: number; rideId: number; userId: number }) {
    const producer = getProducer(); // lanza si no inicializado
    await producer.send({
      topic: "iot.lock",
      messages: [
        {
          key: String(data.bikeId),
          value: JSON.stringify({
            action,
            bikeId: data.bikeId,
            rideId: data.rideId,
            userId: data.userId,
            timestamp: new Date().toISOString(),
          }),
        },
      ],
    });
    console.log(`📡 Evento Kafka enviado: ${action} bike ${data.bikeId}`);
  }
}