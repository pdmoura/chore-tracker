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
- Preserve the assignment, completion, and deletion rules in `docs/PLAN.md`.
- Commit schema changes with migrations and deterministic seed updates.

## Verification

Run the API lint, type-check/build, and tests before handoff. Include the required child-task authorization tests and report any commands that could not run.
