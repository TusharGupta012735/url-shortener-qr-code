# Project Structure

```text
backend/
  src/
    server.ts                    # Express app + Kafka producer connect at startup
    kafka/
      client.ts                  # Kafka client (`KAFKA_BROKER`)
      producer.ts                # Producer used by API
      consumer.ts                # Consumer factory for worker
      schemas/
        linkVisited.schema.ts    # Event shape reference
    workers/
      analytics.worker.ts        # Consumes link.visited and writes analytics/click count
    modules/
      url-shortener/
        urlShortener.route.ts
        urlShortener.controller.ts
        urlShortener.service.ts
        urlShortener.repository.ts
      qr-code/
        qrCode.route.ts
        qrCode.service.ts
    lib/
      db.ts                      # Prisma client
    middlewares/
      errorMiddleware.ts
    utils/
      snowflakeId.ts
      base62.ts
    generated/
      prisma/
  prisma/
    schema.prisma
    migrations/
  docs/
    QUICKSTART.md
    API_TESTING.md
    STRUCTURE.md
    snowflake-base62.md
  docker-compose.yml             # Kafka + Kafka UI for local development
  package.json                   # scripts: start, worker
  .env.example
  README.md
  DOCS.md
```

## Runtime Processes

- API process: `npm run start`
- Worker process: `npm run worker`

Both should run for full redirect analytics behavior.
