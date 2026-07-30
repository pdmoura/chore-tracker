# Chore Tracker

A small family chore tracker with a NestJS REST API, React web client, and PostgreSQL persistence. Parents manage accounts and every chore; children can manage tasks they create for themselves and update completion for any task assigned to them.

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
| `web/` | React, Vite, Tailwind CSS, shadcn/ui, TanStack Query | Responsive role-aware Parent and Child interfaces |
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
npm test --prefix web

docker compose config
docker compose up --build -d
```

The API suite contains seven end-to-end tests covering Child visibility,
automatic self-assignment, ownership-restricted edits/deletes, assigned-task
completion, Parent access, safe serialization, and user-management boundaries.
The frontend Vitest suite covers session recovery, persistent and tab-only
login, role redirects, light/dark themes, localization, summaries, filters,
sorting, pagination, responsive overlays, immutable roles, permissions, and
destructive confirmations. Task 04 also verified Parent and Child core flows,
refresh/logout, validation and conflict messages, and a migration/seed startup
against a disposable Compose database.

## Public deployment

The intended demonstration uses three replaceable providers:

- Vercel serves the React/Vite application from `web/`.
- Render runs only the NestJS API from `api/Dockerfile`.
- Neon supplies a standard PostgreSQL `DATABASE_URL`.

`render.yaml` declares only the API. `web/vercel.json` supplies the Vite build output and SPA rewrite when `web` is selected as the Vercel project root. Exact environment values and deployment order are in [the deployment guide](docs/DEPLOYMENT.md).

### Published demo

- Frontend:
  [https://choretracker-test.vercel.app/](https://choretracker-test.vercel.app/)
- API:
  [https://chore-tracker-api-keyp.onrender.com](https://chore-tracker-api-keyp.onrender.com)

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2Fpdmoura%2Fchore-tracker%2Ftree%2Ffeat%2Finitial-implementation)

## Trade-offs and known limitations

- JWTs expire after one hour and are stored in local storage when “Remember me”
  is selected or session storage otherwise; refresh-token rotation and
  server-side revocation are out of scope.
- Public registration, password recovery, recurring chores, households, notifications, and rewards are intentionally out of scope.
- The seed is deterministic and resets demo account passwords and sample task state when run.
- A free Render API spins down after inactivity and can take about one minute to
  start. Opening the login page silently sends one root `/health` request. The
  warm-up state appears only if the user submits the form while that request is
  pending, and the same sign-in attempt continues when it settles.
- `npm audit --omit=dev --prefix web` reports two high findings in React Router
  7.18.2 for RSC action handling. This client-only `BrowserRouter` application
  does not use RSC; npm currently proposes a forced downgrade to 7.11.0.
- Frontend tests run in Vitest/jsdom with Testing Library and MSW. A persistent
  browser-level end-to-end suite remains out of scope.

## Assessment effort

Approximately 2 hours 15 minutes on 2026-07-29, measured from the first planning commit through final integration and documentation. External review time is excluded.

The screen-driven frontend modernization completed on 2026-07-30 is follow-up
work and is excluded from the original assessment measurement.

See [docs/PLAN.md](docs/PLAN.md) for approved scope and [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for local, public, redeploy, and rollback procedures.
