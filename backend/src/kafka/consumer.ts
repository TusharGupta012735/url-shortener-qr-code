import { kafka } from "./client.js";

export async function createConsumer(groupId: string) {
  const consumer = kafka.consumer({ groupId });
  await consumer.connect();
  await consumer.subscribe({ topic: "link.visited" });

  return consumer;
}
