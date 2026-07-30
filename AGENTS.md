## Git workflow

- Make atomic commits after each complete and verified unit of work.
- Each commit should have one clear purpose and leave the repository in a working state.
- Use Conventional Commit-style messages such as `feat(api):`, `feat(web):`, `test:`, `docs:`, and `chore:`.
- Run the relevant lint, type-check, test, or build commands before committing.
- Do not combine unrelated backend, frontend, documentation, and infrastructure changes in one commit.
- Do not amend, squash, reorder, or rewrite existing commits.
- Do not create, rename, switch, merge, or delete branches unless explicitly instructed by the user.
- Leave the working tree clean after completing an approved task.
- If verification fails, report the failure and fix it before committing whenever reasonably possible.

## Plan authority

- Treat `docs/PLAN.md` as the approved source of scope and architecture.
- Use `docs/PROJECT_REVIEW.md` as the current verification, known-defect, and
  accepted-risk snapshot; update it when a listed finding changes.
- Keep the NestJS API and React web application independent and communicate through REST.
- Report any implementation-blocking contradiction before changing an approved decision.

## Project invariants

- Preserve the four public web routes: `/login`, `/admin/tasks`,
  `/admin/users`, and `/my-tasks`.
- Keep application API endpoints below `/api`; keep `/health` and `/docs` at
  the origin root.
- Enforce authentication, roles, resource visibility, ownership, and immutable
  user roles in the API. Frontend guards and hidden controls are not security
  boundaries.
- Never serialize password hashes or accept assignee/creator identity from a
  Child task form.
- Do not add public registration, password recovery, profile editing,
  recurrence, categories, uploads, notifications, or multi-household behavior
  without an approved plan change.
- Keep hosting replaceable: core code may depend on REST and PostgreSQL, not
  Vercel, Render, Neon, or another provider SDK.

## Verification baseline

- Run an affected application's lint, build, and tests sequentially before
  committing. API E2E requires a reachable PostgreSQL database.
- For cross-application or release work, also run
  `docker compose config --quiet` and verify all service health plus host
  `/health` endpoints.
- Current known blockers are documented in `docs/PROJECT_REVIEW.md`: API lint
  has a repository-wide CRLF/Prettier mismatch, and the web container's
  `localhost` health probe fails although `127.0.0.1` succeeds.
- Treat normalization of API line endings as a dedicated mechanical change;
  never mix a repository-wide format rewrite with behavior changes.
- Run the web suite independently when diagnosing lazy-route timeouts; a
  resource-saturated parallel verification run is not a reliable failure
  signal.

## Documentation

- Update `README.md` for user-facing setup, capabilities, scripts, and known
  limitations.
- Update `docs/DEPLOYMENT.md` for environment, container, provider, health, or
  rollback changes.
- Update `docs/PLAN.md` before changing approved scope, contracts, roles, or
  architecture.
- Append material decisions and verification outcomes to
  `docs/PROMPT_HISTORY.md`.
- Treat `docs/tasks/*.md` as completed historical briefs, not the active
  maintenance queue.
