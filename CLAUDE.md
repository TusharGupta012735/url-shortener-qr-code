# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working conventions

- **Never run git commands** (`git add`, `commit`, `push`, `checkout`, `reset`, branch operations, etc.) in this repo. The user manages git themselves — do not stage, commit, or push on their behalf, even if asked to "save" or "finish up" work, unless they explicitly type a git command for you to run.
- **Always propose a plan before making changes.** For any non-trivial task (new features, refactors, multi-file edits, config/setup changes), lay out the plan first and get confirmation before editing files. Trivial one-line fixes or the user explicitly asking you to "just do it" are exceptions.

## Repository layout

This is a monorepo-by-folder (not an npm workspace — each side has its own `package.json`, `node_modules`, and lockfile):

- `backend/` — Express + TypeScript API (URL shortening, QR codes, Kafka-based click analytics). Fully implemented.
- `frontend/` — Vite + React 19 + TypeScript app. A minimal dark-themed single page for manually exercising the backend (shorten a URL, copy/visit the short link, generate its QR code). No router, no state library, no UI framework — plain `fetch` + React state.

Run backend and frontend commands from inside their respective directories.

A single root `.env` (see `.env.example`) is shared by both apps:

- Backend loads it explicitly via `backend/src/config/env.ts` (`dotenv.config({ path: ... })` resolved relative to that file, so it works regardless of cwd). This module is imported first in `backend/src/server.ts`, `backend/src/workers/analytics.worker.ts`, and `backend/prisma.config.ts`. Don't reintroduce bare `import "dotenv/config"` in other backend files — import `./config/env.js` (or a relative path to it) instead if a new entry point needs env vars loaded.
- Frontend reads it via `envDir: '../'` in `frontend/vite.config.ts`. Only vars prefixed `VITE_` are exposed to client code.

The repo root also holds the single `.gitignore` for both apps (there are no per-folder `.gitignore`/`.env` files anymore).

## Commands

### Backend (`backend/`)

```bash
npm install                    # install deps
npm run start                  # run the API (tsx src/server.ts), connects to Kafka on boot
npm run worker                 # run the analytics Kafka consumer (separate process)
npx prisma migrate deploy      # apply migrations
npx prisma generate            # regenerate Prisma client into src/generated/prisma
```

There is no real test suite yet (`npm test` is a placeholder that exits 1) and no lint script. `backend/postman-collection.json` and `backend/docs/API_TESTING.md` are the way to exercise endpoints manually.

Both the API and worker processes must be running for redirects to produce analytics/click-count updates.

#### Running via Docker

`docker-compose.yml` lives at the **repo root** (not `backend/`), so it can share the root `.env`. Two ways to use it:

```bash
docker compose up -d postgres kafka kafka-ui   # infra only - run api/worker on the host as above
docker compose up --build                      # everything - postgres, kafka, kafka-ui, api, worker
```

`backend/Dockerfile` builds a single `node:22-alpine` image (no compiled build step — runs `tsx` directly, same as the npm scripts) used by both the `api` and `worker` compose services. The `api` service runs `prisma migrate deploy` before starting. Kafka has two listeners: containers reach it at `kafka:9092`, the host (e.g. `npm run start` outside Docker) at `localhost:9094` — don't collapse these back to one listener, host and container DNS resolve differently inside `docker-compose.yml`.

### Frontend (`frontend/`)

```bash
npm install
npm run dev        # vite dev server
npm run build       # tsc -b && vite build
npm run lint        # eslint .
npm run preview     # preview production build
```

`frontend/src/lib/api.ts` wraps the two backend calls (`shortenUrl`, `getQrCode`) and reads `VITE_API_URL`/`VITE_APP_ENV` from `import.meta.env` (typed in `frontend/src/vite-env.d.ts`). `frontend/src/lib/guest.ts` generates and persists a per-browser `guestId` in `localStorage`, since the backend requires a `userId` or `guestId` on every shorten request and there's no auth yet. `App.tsx` holds an in-memory (not persisted) list of links created in the current session.

## Backend architecture

Module layout under `backend/src/modules/<name>/` follows route → controller → service → repository:

- `*.route.ts` — Express router, wires paths to controller functions.
- `*.controller.ts` — thin HTTP layer, calls the service and shapes the response.
- `*.service.ts` — business logic; catches/normalizes errors into `AppError`.
- `*.repository.ts` — Prisma queries only (see `url-shortener` module).
- `dto/` — request/response type shapes (e.g. `urlShortener.request.ts`, `urlShortener.response.ts`).

Existing modules: `url-shortener` (`/shortUrl`) and `qr-code` (`/qrCode`).

Errors: throw `AppError(message, statusCode)` (`src/utils/AppError.ts`) from services; the global handler (`src/middlewares/errorMiddleware.ts`) catches it and returns `{ status, message, stack? }` (stack only when `NODE_ENV=development`). Prisma unique-constraint violations (`error.code === "P2002"`) are translated to a 409 in service catch blocks — follow this pattern for new services rather than letting raw Prisma errors escape.

### Short code generation (Snowflake + Base62)

- `src/utils/snowflakeId.ts` — Snowflake ID generator (`timestamp | worker id | sequence` bit layout), instantiated per-service with a worker id (e.g. `new Snowflake(1)` in `urlShortener.service.ts`).
- `src/utils/base62.ts` — encodes the Snowflake `BigInt` into a URL-safe short code.
- Flow: generate Snowflake ID → Base62-encode → persist `Url` row with both `snowflakeId` (string) and `shortCode` → return `shortCode` to the client.
- Details/rationale: `backend/docs/snowflake-base62.md`.

### Async analytics via Kafka

- `src/kafka/client.ts` — Kafka client, configured via `KAFKA_BROKER`.
- `src/kafka/producer.ts` — connected once at server startup (`src/server.ts`); publishes to the `link.visited` topic when a short URL is resolved.
- `src/kafka/consumer.ts` — consumer factory used by the worker.
- `src/workers/analytics.worker.ts` — separate process (`npm run worker`), consumes `link.visited`, upserts an `Analytics` row keyed by `eventId` (idempotency key) and increments `Url.clickCount`, both inside one `prisma.$transaction`.
- The API process (`npm run start`) and the worker are independent runtimes — the API never writes analytics synchronously.

### Data model (`prisma/schema.prisma`)

- `User` / `Guest` — a `Url` belongs to exactly one of these (`userId` or `guestId`), enforced in application code, not a DB constraint (see the check in `urlShortener.service.ts`).
- `Url` — `snowflakeId` and `shortCode` are both unique; `clickCount` is only mutated by the analytics worker.
- `Analytics` — one row per click event, `eventId` unique for idempotent upserts from Kafka, `@@index([urlId])`.
- Prisma client is generated to `src/generated/prisma` (gitignored, must run `npx prisma generate` after cloning or changing the schema) and re-exported from `src/lib/db.ts` as `prisma`.

### Server bootstrap (`src/server.ts`)

Middleware order: `helmet` → `cors` → rate limiter (100 req/15min per IP) → `express.json`/`urlencoded` → routes → `globalErrorHandler`. Kafka producer connects before `app.listen`; if that connect fails the process exits (`process.exit(1)`).

## Documentation map (backend)

`backend/DOCS.md` indexes everything below and states the recommended read order (`docs/QUICKSTART.md` → `README.md` → `docs/API_TESTING.md` → `docs/STRUCTURE.md`):

- `backend/docs/QUICKSTART.md` — local Postgres + Kafka setup via Docker.
- `backend/docs/API_TESTING.md` — endpoint tests and analytics verification.
- `backend/docs/STRUCTURE.md` — up-to-date file tree.
- `backend/docs/snowflake-base62.md` — short-code ID design deep dive.

When changing `package.json` scripts, Docker services, required env vars, or the `link.visited` event contract, update these docs (this is an explicit convention stated in `DOCS.md`).

## Environment variables

From the root `.env.example` (copy to root `.env`, not `backend/.env`):

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/url-shortener?schema=public"
PORT=3000
NODE_ENV="development"
BASE_URL="http://localhost:3000/shortUrl"
KAFKA_BROKER=localhost:9094

# Only used by docker-compose to initialize the Postgres container - keep in
# sync with the credentials embedded in DATABASE_URL above.
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password
POSTGRES_DB=url-shortener

VITE_APP_ENV=development       # development | preprod | production - shown as a badge in the UI
VITE_API_URL="http://localhost:3000"   # point at your deployed Render backend for preprod/production
```

Inside `docker-compose.yml`, the `api`/`worker` services override `DATABASE_URL` and `KAFKA_BROKER` to point at the `postgres`/`kafka` service names (built from `POSTGRES_*`) rather than using the host-oriented values above verbatim.

`NODE_ENV` must stay lowercase (`development`/`production`) — Vite reads this same root `.env` and rejects other casings, and the backend's own stack-trace check in `errorMiddleware.ts` also compares against the lowercase value.

When deploying, set `VITE_API_URL` (and `VITE_APP_ENV`) as environment variables in the Vercel project settings (frontend) and `BASE_URL`/`DATABASE_URL`/`KAFKA_BROKER`/etc. in the Render service settings (backend) — the committed root `.env` is for local dev only.
