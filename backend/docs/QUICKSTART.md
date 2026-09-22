# Quickstart

Fast local setup for URL Shortener backend with Kafka on localhost.

## 1. Install

```bash
npm install
```

## 2. Configure env

The `.env` file lives at the **repo root** (shared with `frontend/`), not inside `backend/`.

```bash
cp ../.env.example ../.env
```

Set at least:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/url-shortener?schema=public"
PORT=3000
NODE_ENV="development"
KAFKA_BROKER="localhost:9094"
```

## 3. Start Postgres + Kafka (Docker)

`docker-compose.yml` lives at the **repo root**. Run it from there, starting only the infra services (not `api`/`worker`, since you'll run those on the host in the next steps):

```bash
cd ..
docker compose up -d postgres kafka kafka-ui
cd backend
```

- Postgres: `localhost:5432`
- Kafka broker: `localhost:9094` (host-facing listener; containers use `kafka:9092`)
- Kafka UI: `http://localhost:8080`

## 4. Apply database migrations

```bash
npx prisma migrate deploy
npx prisma generate
```

## 5. Run API and worker

Start both in separate terminals:

```bash
npm run start
npm run worker
```

### Alternative: run everything in Docker

Instead of steps 3-5, run the whole stack (Postgres, Kafka, Kafka UI, API, worker) with one command from the repo root:

```bash
cd ..
docker compose up --build
```

The `api` service applies migrations on startup automatically.

## 6. Quick test

```bash
curl http://localhost:3000
```

Expected response:

```json
{ "message": "URL Shortener API" }
```

## 7. Verify analytics pipeline

1. Create short URL with `POST /shortUrl/generate`.
2. Open `GET /shortUrl/:shortCode`.
3. Confirm events in Kafka UI topic `link.visited`.
4. Confirm `analytics` row and `urls.clickCount` update in Prisma Studio.
