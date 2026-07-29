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
