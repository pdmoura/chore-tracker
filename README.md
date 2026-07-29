# Chore Tracker

A small family chore tracker with a NestJS REST API, React web client, and PostgreSQL persistence. Parents manage accounts and chores; children see only their assigned chores and can update completion.

## Quick start

Requirements: Docker Desktop with Docker Compose.

```bash
cp .env.example .env
docker compose up --build -d
docker compose ps
```

On PowerShell, use `Copy-Item .env.example .env` for the first command. Replace `JWT_SECRET` in `.env` with a random value of at least 32 characters before using the stack outside local evaluation.

- Web: http://localhost:5173
- API health: http://localhost:3000/health
- Swagger: http://localhost:3000/docs

Stop the stack with `docker compose down`. Add `--volumes` only when you intentionally want to delete local database data.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Parent | `parent@example.com` | `Parent123!` |
| Child | `child@example.com` | `Child123!` |
| Second child | `child2@example.com` | `Child123!` |

The deterministic seed restores these accounts and the sample chores whenever the API container starts.

## Architecture

| Component | Technology | Responsibility |
| --- | --- | --- |
| `api/` | NestJS, Prisma, JWT, bcrypt | REST API, validation, authentication, and authorization |
| `web/` | React, Vite, React Router, TanStack Query | Role-aware Parent and Child interfaces |
| `db` | PostgreSQL 17 | Users and tasks |

The applications communicate only through REST. Hosting and database providers are configuration choices; core application code contains no provider SDK.

## Development and verification

Common commands:

```bash
npm ci --prefix api
npm run lint --prefix api
npm run build --prefix api
npm test --prefix api

npm ci --prefix web
npm run lint --prefix web
npm run build --prefix web

docker compose config
docker compose up --build -d
```

The API suite contains six end-to-end tests, including all three required child-task authorization cases. Task 04 also verified Parent and Child core flows, refresh/logout, validation and conflict messages, safe serialization, and a migration/seed startup against a disposable Compose database.

## Public deployment

`render.yaml` defines a replaceable demonstration deployment: a Docker API, static React site, and managed PostgreSQL database. Use the branch-specific deployment button after reviewing the free-tier limitations in [the deployment guide](docs/DEPLOYMENT.md).

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fpdmoura%2Fchore-tracker%2Ftree%2Ffeat%2Finitial-implementation)

Deployment status at this handoff: configuration is committed and locally verified, but public resources were not provisioned because no authenticated Render session or API key was available. There are therefore no verified public URLs yet.

## Trade-offs and known limitations

- JWTs are stored in browser local storage and expire after one hour; refresh-token rotation and server-side revocation are out of scope.
- Public registration, password recovery, recurring chores, households, notifications, and rewards are intentionally out of scope.
- The seed is deterministic and resets demo account passwords and sample task state when run.
- The Render free API can cold-start after inactivity, and its free PostgreSQL database expires after 30 days and has no backups.
- `npm audit --omit=dev --prefix web` reports two high findings in React Router 7.18.2 for unstable RSC APIs. This client-only Vite application does not use RSC; the patched 8.3.0 release named by the advisory was not published to npm at verification time.
- Frontend automated tests were optional and omitted; the core frontend flows were verified manually in a browser against the clean Compose stack.

## Assessment effort

Approximately 2 hours 15 minutes on 2026-07-29, measured from the first planning commit through final integration and documentation. External review time is excluded.

See [docs/PLAN.md](docs/PLAN.md) for approved scope and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for local, public, redeploy, and rollback procedures.
