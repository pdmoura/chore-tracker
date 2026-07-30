# 01 — Foundation

> Historical implementation brief. Completed on 2026-07-29; do not treat this
> file as an active maintenance task.

## Objective

Create the two independent application foundations, package scripts, database model, migration, and deterministic seed without implementing product endpoints or screens.

## Scope and relevant files

- `api/package.json`, lockfile, NestJS configuration and minimal bootstrap
- `api/prisma/**` and `api/src/prisma/**`
- `web/package.json`, lockfile, Vite configuration and minimal bootstrap
- `compose.yaml` database service and `.env.example`

Use separate atomic commits for API, web, and infrastructure changes.

## Dependencies

- Approved `docs/PLAN.md`
- Orchestration files reviewed

## Acceptance criteria

- Stable compatible dependencies and lockfiles are committed.
- Both applications build with documented scripts.
- Prisma models, initial migration, and deterministic Parent/Child seed data match the plan.
- PostgreSQL starts locally and the migration and seed succeed.
- No feature endpoints or role interfaces are implemented.

## Verification commands

```text
npm ci --prefix api
npm run build --prefix api
npm ci --prefix web
npm run build --prefix web
docker compose up -d db
npm run prisma:validate --prefix api
npm run db:migrate --prefix api
npm run seed --prefix api
```

## Expected handoff

Provide commits, package versions, seed credentials, changed files, verification results, and the commands required for backend development.
