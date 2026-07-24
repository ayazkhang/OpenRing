# OpenRing — Wearable Research Platform

## Layout

- `docs/` — architecture + debugging write-up
- `backend/` — API and tests
- `frontend/` — researcher console
- `examples/` — sample GraphQL calls
- `docker-compose.yml`

## Run with Docker

- `docker compose up -d --build`
- Console: http://localhost:3000
- GraphQL: http://localhost:4000/graphql
- Health: http://localhost:4000/health
- Stop: `docker compose down`

## Run without Docker (local apps)

1. Start Postgres: `docker compose up -d postgres` (or use your own Postgres)
2. Create DBs `openring` and `openring_test` (Compose already creates `openring`)

```bash
docker compose exec postgres psql -U openring -d openring -c "CREATE DATABASE openring_test;"
```

3. Backend:

```bash
cd backend
cp .env.example .env
npm install
npm run dev
npm test
```

4. Frontend (optional):

```bash
cd frontend
npm install
npm run dev
```

## API flow

1. `registerDevice`
2. `createSession`
3. `ingestBatch`
4. `sessionReadings` or CSV export (`exportSessionCsv` / `GET /sessions/:id/export`)

See `examples/sample-operations.graphql`.
