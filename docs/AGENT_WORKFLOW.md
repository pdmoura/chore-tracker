# Codex Implementation Workflow

## Authority and sequence

Use `docs/PLAN.md` for approved scope and architecture, the root `AGENTS.md` for Git rules, and the nearest application `AGENTS.md` for local guidance. Execute the briefs in order:

1. `01-foundation.md`
2. `02-backend.md`
3. `03-frontend.md`
4. `04-qa.md`
5. `05-release.md`

Do not begin a dependent brief until its dependencies and acceptance criteria pass.

## Ownership and commits

Assign one owner to a file at a time. Parallel work is allowed only after dependencies are satisfied and file ownership is disjoint; API and web work may overlap only when the API contract is stable. Stop and coordinate before editing shared root files or another task's active files.

Make atomic Conventional Commit-style commits after verified units. Do not mix API, web, infrastructure, test, or documentation changes in one commit.

## Handoff

Each handoff must state:

- completed scope and commit hashes;
- files changed;
- verification commands and results;
- assumptions, remaining risks, and follow-up work.

The final integration pass runs automated checks, the manual checklist, Docker Compose startup from a clean state, and public frontend-to-API verification.
