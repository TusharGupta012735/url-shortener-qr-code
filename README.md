# URL Shortener + QR Code

- `backend/` — Express + TypeScript API. See [backend/README.md](backend/README.md) and [backend/DOCS.md](backend/DOCS.md).
- `frontend/` — Vite + React + TypeScript app. See [frontend/README.md](frontend/README.md).

## Setup

```bash
cp .env.example .env   # fill in real values
cd backend && npm install
cd ../frontend && npm install
```

The `.env` file at the repo root is shared by both apps (backend via `backend/src/config/env.ts`, frontend via `envDir` in `frontend/vite.config.ts`).

See [backend/docs/QUICKSTART.md](backend/docs/QUICKSTART.md) for the full local setup (PostgreSQL + Kafka).
