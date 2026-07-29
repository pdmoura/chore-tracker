# Deployment Guide

## Configuration

Copy `.env.example` to `.env` for Docker Compose. Do not commit `.env` or real credentials.

| Variable | Purpose |
| --- | --- |
| `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | Local Compose database |
| `POSTGRES_PORT` | PostgreSQL host port |
| `DATABASE_URL` | API PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret; use at least 32 random characters |
| `PORT`, `API_PORT` | API container and host ports |
| `CORS_ORIGINS` | Comma-separated allowed web origins |
| `VITE_API_URL` | Public API base URL baked into the web build |
| `WEB_PORT` | Web host port |

`VITE_API_URL` is public configuration, not a secret. Changing it requires rebuilding the frontend.

## Docker Compose

```bash
cp .env.example .env
docker compose config
docker compose up --build -d
docker compose ps
```

PowerShell users can run `Copy-Item .env.example .env`. The API waits for PostgreSQL, applies committed Prisma migrations, runs the deterministic seed, and then starts NestJS. The web container waits for API health.

Verify:

```bash
curl http://localhost:3000/health
curl http://localhost:5173/health
```

Open http://localhost:5173 and use the demo credentials in the README. Stop services with:

```bash
docker compose down
```

Use `docker compose down --volumes` only to intentionally remove the named PostgreSQL volume.

## Local development

Start only PostgreSQL with `docker compose up -d db`. Export the API variables from `.env`, then run:

```bash
npm ci --prefix api
npm run db:migrate --prefix api
npm run seed --prefix api
npm run start:dev --prefix api
```

In another terminal, set `VITE_API_URL=http://localhost:3000/api` and run:

```bash
npm ci --prefix web
npm run dev --prefix web
```

## Render demonstration

`render.yaml` declares:

- `chore-tracker-api-pdmoura-demo`: free Docker web service;
- `chore-tracker-web-pdmoura-demo`: free static site with SPA rewrites;
- `chore-tracker-db-pdmoura-demo`: free PostgreSQL database.

The Blueprint generates `JWT_SECRET`, injects the database connection, and configures the public API and CORS origins. No provider-specific logic exists under `api/src` or `web/src`.

To deploy:

1. Push the reviewed commit to an accessible Git branch.
2. Open the Deploy to Render button in `README.md` and sign in.
3. Review the three free resources and approve the Blueprint.
4. Wait for database creation, API migration/seed, and static-site build.
5. Confirm `/health` and `/docs` on the API URL.
6. Run the full Parent and Child checklist against the public web URL.

If Render changes a service name because the requested name is unavailable, update both `CORS_ORIGINS` and `VITE_API_URL`, then redeploy the API and rebuild the static site.

At the 2026-07-29 handoff, provisioning was blocked at provider authentication: the environment had neither a Render session nor `RENDER_API_KEY`. The Blueprint and frontend production build were verified locally, but no public URL or public-flow result is claimed.

### Free-tier limitations

- The API sleeps after inactivity and may take about a minute to wake.
- Free PostgreSQL expires after 30 days, is limited to 1 GB, and has no backups.
- The deterministic startup seed restores demo credentials and sample task state.
- Use a paid or alternative compatible PostgreSQL service for a durable deployment.

## Replace the provider

The deployment boundary is standard configuration:

1. Provision any PostgreSQL-compatible database and set `DATABASE_URL`.
2. Run the API Docker image with `JWT_SECRET`, `PORT`, and `CORS_ORIGINS`.
3. Build `web/` with the public API base in `VITE_API_URL`.
4. Serve `web/dist` from any static host with an SPA fallback to `index.html`.

No database or hosting SDK changes are required.

## Redeploy and rollback

Automatic Render deploys are disabled in the Blueprint. Sync the Blueprint or trigger each service deploy after pushing an approved commit. Rebuild the web service whenever `VITE_API_URL` changes.

For application rollback, redeploy a previously verified Git commit or use the provider's deployment history. Database migrations are committed and run forward on startup; take a database backup before schema changes in durable environments. The free Render database does not provide backups, so recovery there is limited to reseeding or replacing the database.

After redeploy or rollback, repeat:

```bash
npm test --prefix api
npm run build --prefix api
npm run build --prefix web
```

Then verify health, both logins, Parent user/task management, Child isolation and completion, refresh/logout, error states, and absence of password hashes.
