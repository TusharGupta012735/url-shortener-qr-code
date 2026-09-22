# URL Shortener Backend

TypeScript + Express backend for URL shortening with Snowflake/Base62 short codes, QR code generation, and asynchronous click analytics via Kafka.

## Features

- Short URL generation (`POST /shortUrl/generate`)
- URL redirect by short code (`GET /shortUrl/:shortCode`)
- QR code support
- Snowflake ID + Base62 short code strategy
- Async click analytics pipeline using Kafka (`link.visited` topic)
- PostgreSQL + Prisma persistence

## Tech Stack

- Node.js + TypeScript
- Express
- PostgreSQL + Prisma
- KafkaJS
- Docker Compose (Kafka + Kafka UI)

## Project Structure

```text
backend/
  src/
    server.ts
    kafka/
      client.ts
      producer.ts
      consumer.ts
      schemas/
    workers/
      analytics.worker.ts
    modules/
      url-shortener/
      qr-code/
  prisma/
  docs/
  docker-compose.yml
  package.json
```

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL running locally
- Docker Desktop (for Kafka)

## Setup

1. Install dependencies.

```bash
npm install
```

2. Create `.env` from template. This file lives at the **repo root** (shared with `frontend/`), not inside `backend/`.

```bash
cp ../.env.example ../.env
```

3. Set required env vars.

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/url-shortener?schema=public"
PORT=3000
NODE_ENV="DEVELOPMENT"
KAFKA_BROKER="localhost:9092"
```

4. Start Kafka locally via Docker.

```bash
docker compose up -d kafka kafka-ui
```

Kafka UI will be available at `http://localhost:8080`.

5. Run migrations and generate Prisma client.

```bash
npx prisma migrate deploy
npx prisma generate
```

## Run

Use the scripts from `package.json`:

```bash
npm run start
npm run worker
```

- `npm run start` starts the HTTP API and Kafka producer connection.
- `npm run worker` starts the analytics Kafka consumer worker.

Run both processes in separate terminals.

## API Endpoints

- `GET /` health check
- `POST /shortUrl/generate` create short URL
- `GET /shortUrl/:shortCode` redirect + publish `link.visited` analytics event
- `GET /qrCode/:shortCode` generate/fetch QR code (if enabled in route module)

## Kafka Analytics Flow

1. Client calls `GET /shortUrl/:shortCode`.
2. API resolves URL and publishes event to `link.visited`.
3. Worker consumes event and upserts analytics record.
4. Worker increments `url.clickCount`.

## Troubleshooting

- `Failed to start server` with Kafka error:
  - Ensure `docker compose ps` shows `kafka` healthy.
  - Verify `.env` has `KAFKA_BROKER=localhost:9092`.
- Worker not processing events:
  - Confirm `npm run worker` is running.
  - Check Kafka UI (`http://localhost:8080`) topic `link.visited`.
- DB connection errors:
  - Verify `DATABASE_URL` and PostgreSQL availability.

## Docs

- [Quickstart](docs/QUICKSTART.md)
- [API Testing](docs/API_TESTING.md)
- [Architecture](docs/STRUCTURE.md)
- [Snowflake/Base62](docs/snowflake-base62.md)
- [Documentation Index](DOCS.md)
