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
NODE_ENV="DEVELOPMENT"
KAFKA_BROKER="localhost:9092"
```

## 3. Start Kafka (Docker)

```bash
docker compose up -d kafka kafka-ui
```

- Kafka broker: `localhost:9092`
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
