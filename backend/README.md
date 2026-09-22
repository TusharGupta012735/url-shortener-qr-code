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
- Docker Compose (Postgres + Kafka + Kafka UI, or the whole backend)

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
  Dockerfile
  package.json
```

`docker-compose.yml` lives at the **repo root**. It orchestrates Postgres, Kafka, Kafka UI, and this backend's `api`/`worker` containers (built from `backend/Dockerfile`).

## Prerequisites

- Node.js 18+
- npm
- PostgreSQL running locally (or via Docker)
- Docker Desktop (for Kafka, Postgres, or the whole backend)

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
NODE_ENV="development"
KAFKA_BROKER="localhost:9094"
```

4. Start Postgres and Kafka locally via Docker (run from the repo root).

```bash
cd ..
docker compose up -d postgres kafka kafka-ui
cd backend
```

Kafka UI will be available at `http://localhost:8080`. Kafka's host-facing broker is `localhost:9094` (see `KAFKA_BROKER` above); containers talk to it as `kafka:9092`.

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

### Or: run the whole backend in Docker

From the repo root, instead of running Postgres/Kafka via Docker and the API/worker on the host, run everything in containers:

```bash
docker compose up --build
```

This builds `backend/Dockerfile` and starts `postgres`, `kafka`, `kafka-ui`, `api` (runs `prisma migrate deploy` then the server), and `worker`.

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
  - Ensure `docker compose ps` (from the repo root) shows `kafka` running.
  - Verify `.env` has `KAFKA_BROKER=localhost:9094` (host-facing listener port; containers use `kafka:9092`).
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
