# API Instructions

Follow the root `AGENTS.md` and `docs/PLAN.md`.

## Boundaries

- Own files under `api/`; coordinate before changing shared root files.
- Use NestJS, TypeScript, Prisma, PostgreSQL, JWT, and hashed passwords.
- Access Prisma through a small `PrismaService`; do not add repository, DAO, CQRS, or service-boundary abstractions without a demonstrated need.
- Keep endpoints under `/api`, except `/health` and `/docs`.

## Security and data rules

- Validate request data and enforce role and resource authorization in the API.
- Never serialize password hashes or accept role changes for existing users.
- Use `safeUserSelect` (or an equally explicit safe selection) for every
  serialized user relation; do not return raw Prisma users.
- Preserve the creator/assignee ownership, completion, and deletion rules in
  `docs/PLAN.md`.
- Parent task creation requires a Child `assignedToId`. Child task creation
  derives both assignee and creator from the authenticated user and rejects
  assignment fields.
- Return `404` for resources hidden from a Child, `403` for visible resources a
  Child cannot manage, and `409` for duplicate email or restricted user
  deletion.
- Do not translate Prisma, database, or other infrastructure failures into
  `401`. JWT verification failures and deleted/missing authenticated users are
  authentication failures; unexpected dependencies must remain server errors.
- Commit schema changes with migrations and deterministic seed updates.

## API contracts

- Keep login and current-session endpoints at `POST /api/auth/login` and
  `GET /api/auth/me`.
- Keep Parent-only user CRUD below `/api/users`.
- Keep role-aware task CRUD below `/api/tasks` and completion at
  `PATCH /api/tasks/:id/completion`.
- Keep the public operational endpoint at `/health` and Swagger at `/docs`,
  outside the `/api` prefix.
- Preserve the current DTO limits: user name 100 characters, password 8–72,
  task title 200, and task description 2,000.
- Treat REST payload or Prisma schema changes as plan-level contract changes;
  coordinate the web client and documentation before implementing them.

## Verification

- Run `npm run lint`, `npm run build`, and `npm test` from `api/` before
  handoff. Tests require `DATABASE_URL` to point to a reachable PostgreSQL
  database and clean only deterministic `@e2e.test` fixtures.
- Run `npm audit --omit=dev` for dependency or release work.
- API lint currently reports repository-wide CRLF/Prettier errors documented in
  `docs/PROJECT_REVIEW.md`. Fix line endings only in a dedicated mechanical
  commit, then rerun lint, build, and all seven E2E tests.
- Never claim API regression verification from build alone; report database or
  environment blockers explicitly.
