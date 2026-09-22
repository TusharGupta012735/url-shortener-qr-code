# API Testing

Guide to test URL generation, redirect behavior, and Kafka-based analytics processing.

## Prerequisites

Run all required services first:

```bash
docker compose up -d kafka kafka-ui
npm run start
npm run worker
```

## Base URL

```text
http://localhost:3000
```

## 1. Health check

```bash
curl http://localhost:3000
```

## 2. Create short URL

```bash
curl -X POST http://localhost:3000/shortUrl/generate \
  -H "Content-Type: application/json" \
  -d '{
    "originalUrl": "https://www.example.com",
    "guestId": "guest-123"
  }'
```

Expected: `201` with `shortUrl` in response.

## 3. Redirect using short code

```bash
curl -i http://localhost:3000/shortUrl/<SHORT_CODE>
```

Expected: `302` with `Location` header.

## 4. Validate async analytics

After redirect call:

1. Kafka UI (`http://localhost:8080`): topic `link.visited` should receive messages.
2. Database:
- `analytics` table should contain event (deduped by `eventId`).
- `urls.clickCount` should increment.

## Common failure checks

- Kafka broker not reachable:
- Ensure `.env` has `KAFKA_BROKER=localhost:9092`
- Ensure Docker Kafka container is running

- Redirect works but analytics missing:
- Ensure `npm run worker` is running
- Check worker logs for Prisma or consumer errors
