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

## Public demonstration: Neon, Render, and Vercel

The public deployment keeps the same REST and PostgreSQL boundaries as Docker Compose:

- Neon hosts PostgreSQL.
- Render runs only the NestJS API Docker image.
- Vercel builds and serves only the React application.

No provider SDK is used. Prisma reads `DATABASE_URL`, and the web client reads the public build-time `VITE_API_URL`.

### 1. Neon PostgreSQL

1. Create a Neon project and select its branch, role, and database.
2. In the Neon [**Connect** dialog](https://neon.com/docs/connect/connect-from-any-app), copy the direct connection string. It should use the normal PostgreSQL format and include TLS parameters, for example:

   ```text
   postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require&channel_binding=require
   ```

3. Keep this value private. It is used only as Render's `DATABASE_URL`.

The application needs no Neon SDK or schema change. `api/prisma/schema.prisma` uses `provider = "postgresql"` and `url = env("DATABASE_URL")`.

### 2. Render API

1. Push the reviewed commit to an accessible Git branch.
2. Create a [Render Blueprint](https://render.com/docs/infrastructure-as-code) from that branch or use the README's Render button.
3. Confirm that the Blueprint contains only `chore-tracker-api`.
4. Enter the values requested by `sync: false`:

   | Variable | Value |
   | --- | --- |
   | `DATABASE_URL` | Complete Neon connection string |
   | `JWT_SECRET` | Random secret of at least 32 characters |
   | `CORS_ORIGINS` | Final Vercel production origin, such as `https://chore-tracker-web.vercel.app` |

   `PORT=3000` is already declared in `render.yaml`.

5. Deploy and wait for `/health` to return `{"status":"ok"}`.
6. Confirm `/docs` loads and the startup log reports the committed Prisma migration and `Seeded demo users and tasks.`

Render builds `api/Dockerfile` and uses its `CMD`. Each API start runs:

```text
npm run db:migrate
node dist/prisma/seed.js
node dist/src/main.js
```

This applies pending migrations before restoring the deterministic demo data and starting NestJS.

### 3. Vercel frontend

1. Import the same Git repository as a Vercel project.
2. Set [**Root Directory**](https://vercel.com/docs/monorepos#add-a-monorepo-through-the-vercel-dashboard) to `web`.
3. Keep the detected Vite framework settings. `web/vercel.json` explicitly sets `npm run build`, output directory `dist`, and the SPA rewrite to `/index.html`.
4. Add this Production environment variable:

   | Variable | Value |
   | --- | --- |
   | `VITE_API_URL` | Public Render API URL followed by `/api`, for example `https://chore-tracker-api.onrender.com/api` |

5. Deploy the project and verify direct navigation to `/login`, `/admin/tasks`, `/admin/users`, and `/my-tasks`.

Set `/api` exactly once: no trailing slash and no second `/api` segment. [Vite embeds `VITE_*` values](https://vite.dev/guide/env-and-mode) into the public browser bundle, so `VITE_API_URL` must not contain credentials or other secrets.

[Render Free web services](https://render.com/docs/free) spin down after 15
minutes without inbound traffic and can take about one minute to start again. On
`/login`, the frontend sends one request to `/health` on the origin of
`VITE_API_URL`. For example,
`https://chore-tracker-api.onrender.com/api` produces
`https://chore-tracker-api.onrender.com/health`, never `/api/health`. The loading
state clears on success; failure, CORS blocking, or timeout restores the login
form without declaring an outage. No polling is used.

If Vercel assigns a different production origin than the one configured on Render, update `CORS_ORIGINS` on Render and redeploy the API. If the Render API hostname changes, update `VITE_API_URL` on Vercel and rebuild the frontend.

### Provider environment summary

| Provider | Variables |
| --- | --- |
| Neon | No application variables; copy its private PostgreSQL connection string |
| Render | `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGINS`; `PORT=3000` comes from the Blueprint |
| Vercel | Public `VITE_API_URL=https://RENDER_HOST/api` only |

Do not add `DATABASE_URL` or `JWT_SECRET` to Vercel. Do not add `VITE_API_URL` to Render. No external service was authenticated or provisioned during preparation of this configuration.

## Replace the provider

The deployment boundary is standard configuration:

1. Provision any PostgreSQL-compatible database and set `DATABASE_URL`.
2. Run the API Docker image with `JWT_SECRET`, `PORT`, and `CORS_ORIGINS`.
3. Build `web/` with the public API base in `VITE_API_URL`.
4. Serve `web/dist` from any static host with an SPA fallback to `index.html`.

No database or hosting SDK changes are required.

## Redeploy and rollback

Automatic Render deploys are disabled in the Blueprint. Sync the Blueprint or trigger an API deploy after pushing an approved commit. Vercel rebuilds the `web` project from its configured production branch; redeploy it whenever `VITE_API_URL` changes.

For application rollback, redeploy a previously verified Git commit through Render and Vercel. Database migrations are committed and run forward on API startup; take a Neon backup or create a restore point before schema changes according to the selected Neon plan.

After redeploy or rollback, repeat:

```bash
npm test --prefix api
npm run build --prefix api
npm run build --prefix web
```

Then verify health, both logins, Parent user/task management, Child self-created
task management, Child isolation and completion, refresh/logout, error states,
and absence of password hashes.
