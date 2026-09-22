# Documentation Index

This file maps all project documentation and when to use each file.

## Files

1. `README.md`
- Main setup and runtime guide.
- Includes Kafka + worker flow.

2. `docs/QUICKSTART.md`
- Fast local setup (PostgreSQL + Kafka via Docker).

3. `docs/API_TESTING.md`
- Endpoint tests and analytics verification steps.

4. `docs/STRUCTURE.md`
- Updated codebase structure including `src/kafka` and `src/workers`.

5. `docs/snowflake-base62.md`
- Deep dive on short code ID strategy.

6. `../.env.example` (repo root)
- Environment variable template, shared by `backend/` and `frontend/`.

## Recommended Read Order

1. `docs/QUICKSTART.md`
2. `README.md`
3. `docs/API_TESTING.md`
4. `docs/STRUCTURE.md`

## Keep Docs Updated When You Change

- `package.json` scripts (`start`, `worker`, etc.)
- Docker services (`docker-compose.yml`, Kafka/Postgres additions)
- Required env vars (`KAFKA_BROKER`, DB config)
- Event contracts/topics (`link.visited`)

Last updated: 2026-03-03
