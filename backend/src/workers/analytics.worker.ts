import "../config/env.js";
import { createConsumer } from "../kafka/consumer.js";
import { prisma } from "../lib/db.js";

async function start() {
  const consumer = await createConsumer("analytics-group");

  await consumer.run({
    eachMessage: async ({ message }) => {
      const event = JSON.parse(message.value!.toString());
      try {
        await prisma.$transaction([
          prisma.analytics.upsert({
            where: { eventId: event.eventId },
            update: {},
            create: {
              eventId: event.eventId,
              urlId: event.urlId,
              occurredAt: new Date(event.occurredAt),
              ip: event.ip,
              userAgent: event.userAgent,
            },
          }),
          prisma.url.update({
            where: { id: event.urlId },
            data: {
              clickCount: { increment: 1 },
            },
          }),
        ]);
      } catch (error) {
        throw error;
      }
    },
  });
}

start();
