# Prompt History

## 2026-07-29 — Planning and orchestration foundation

- Request: create the planned repository directories, scoped Codex instructions, workflow, five dependency-ordered task briefs, and initial environment example without scaffolding applications.
- Decision: preserve the approved plan and add only a small plan-authority guardrail to the root instructions.
- Artifacts: `api/AGENTS.md`, `web/AGENTS.md`, `docs/AGENT_WORKFLOW.md`, `docs/tasks/*.md`, `.env.example`, and placeholders for planned empty directories.

## 2026-07-29 — Task 01 foundation

- Request: scaffold only the independent NestJS and React foundations, PostgreSQL, Prisma migration, and deterministic seed.
- Decisions: use npm lockfiles, PostgreSQL 17, NestJS 11 with Prisma 6, and React 19 with Vite 7; retain a client-only React Router setup.
- Artifacts: database-only Compose service, minimal API bootstrap and `PrismaService`, initial schema/migration/seed, and a neutral web bootstrap with Router and Query providers.
- Verification: clean installs, lint, builds, database health, migration deploy, idempotent seed, and API/web smoke checks passed.
- Adjustment: added explicit Prisma client generation after install and corrected root-level Prisma verification commands.

## 2026-07-29 — Task 02 backend

- Request: implement only the authenticated NestJS REST API and required authorization tests.
- Decisions: keep authorization in controllers/services, make roles immutable, use safe Prisma selections, and return hidden resources as `404`.
- Artifacts: JWT login/profile, Parent user management, role-aware task management, validation, Swagger, and six PostgreSQL-backed end-to-end tests.
- Verification: API lint/build and all six tests passed; the production dependency audit was clean.

## 2026-07-29 — Task 03 frontend

- Request: implement only the React Parent and Child interfaces against the approved API.
- Decisions: keep the access token in local storage for the assessment, use route guards for usability, and leave security enforcement to the API.
- Artifacts: login/session shell, role routing, Parent user/task CRUD, Child completion flows, and loading/empty/error/disabled states.
- Verification: web lint/build and browser checks for Parent and Child flows passed.

## 2026-07-29 — Task 04 QA

- Request: complete the container stack and verify the authorization and end-to-end checklist.
- Decisions: use multi-stage Docker builds, Nginx SPA fallback, configurable host ports, and an isolated disposable Compose project for clean-start testing.
- Artifacts: API/web Dockerfiles, Docker ignore files, Nginx configuration, complete Compose services, and a corrected cross-platform API lockfile.
- Verification: lint/build/tests passed; a fresh database migrated and seeded; browser and direct API checks covered Parent/Child flows, conflicts, `400/401/403/404/409` boundaries, task isolation, and safe serialization.

## 2026-07-29 — Task 05 release

- Request: finish documentation, deployment configuration, and final integration verification.
- Decisions: add a provider-only Render Blueprint while keeping core code portable; retain React Router 7.18.2 because its remaining advisory affects unused RSC APIs and the named patched release was not yet published.
- Artifacts: `README.md`, `docs/DEPLOYMENT.md`, expanded `.env.example`, and `render.yaml`.
- Verification: deployment YAML structure, production frontend configuration, Compose config, API tests/build, and web lint/build passed.
- Blocker: no Render session or API key was available, so the public resources and public manual checklist could not be completed.

## 2026-07-29 — Public deployment correction

- Request: align the release configuration with Vercel for React, Render for the NestJS API only, and Neon for PostgreSQL without provisioning services.
- Decisions: keep Docker Compose unchanged; make external Render values dashboard-supplied; add a Vercel project configuration under `web/`; retain standard Prisma/PostgreSQL and REST boundaries.
- Artifacts: API-only `render.yaml`, `web/vercel.json`, and corrected README/deployment instructions.
- Verification: external `DATABASE_URL` startup migrated and seeded successfully; Vercel-root production build used one public `/api` base; Compose, builds, tests, and secret checks passed.

## 2026-07-29 — Child-owned task management

- Request: let Child users create tasks for themselves, manage only their own
  creations, and retain completion access for every assigned task.
- Decisions: derive Child creator/assignee ownership from the JWT, reject Child
  assignment fields with `403`, return `403` for visible Parent-created tasks
  and `404` for hidden tasks, and keep Parent access unchanged.
- Artifacts: role-aware task DTO/service authorization, seven API end-to-end
  tests, Child create/edit/delete controls without ownership fields, and updated
  plan/guidance.
- Verification: API and web lint/build passed, all seven API tests passed, and
  browser checks covered both role-specific forms plus Child create/edit/delete.

## 2026-07-29 — Render login warm-up

- Request: wake the free Render API from the login page without turning an
  initial health-check failure into a permanent outage.
- Decisions: make one bounded request to the `VITE_API_URL` origin’s `/health`,
  cache it to avoid duplicate Strict Mode calls, and reveal login after failure
  without polling.
- Artifacts: accessible warm-up indicator, fallback advisory, API health URL
  helper, and cold-start documentation.
- Verification: web lint/build passed; a production build confirmed root
  `/health` without `/api/health`; the public health endpoint returned `200`.
