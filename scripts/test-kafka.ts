import { initKafka } from "../src/core/kafka/kafka";

(async () => {
  try {
    const producer = await initKafka();
    await producer.send({
      topic: "iot.lock",
      messages: [{ key: "1", value: JSON.stringify({ action: "unlock", bikeId: 1, timestamp: new Date().toISOString() }) }],
    });
    console.log("✅ Kafka OK: mensaje enviado a iot.lock");
    await producer.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error Kafka test:", err);
    process.exit(1);
  }
})();
