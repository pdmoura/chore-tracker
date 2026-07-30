# Codex Maintenance Workflow

## Authority

Use these sources in order:

1. the user’s current approved request;
2. root `AGENTS.md` for repository-wide Git, architecture, and verification
   rules;
3. the nearest `api/AGENTS.md` or `web/AGENTS.md`;
4. `docs/PLAN.md` for approved scope, contracts, and authorization;
5. `docs/PROJECT_REVIEW.md` for the latest verification baseline and known
   risks.

The numbered files in `docs/tasks/` are completed historical implementation
briefs. Use them for provenance only; do not execute them as an active queue.

## Change routing

| Change | Primary scope | Required coordination |
| --- | --- | --- |
| DTO, endpoint, authorization, Prisma | `api/` | Plan approval for contract/schema changes; update web and docs |
| Route, session, page, component, theme | `web/` | Preserve API contract and role rules |
| Compose, Docker, hosting | root, Dockerfiles | Verify both apps and deployment docs |
| User-facing setup or limitations | `README.md` | Keep review/deployment docs consistent |
| Scope or architecture | `docs/PLAN.md` | Report contradictions before implementation |
| Verified risk status | `docs/PROJECT_REVIEW.md` | Include commands and observed evidence |

Assign one owner to a file at a time. Parallel work is appropriate only when
dependencies are satisfied and file ownership is disjoint. API and web changes
may overlap only while the REST contract remains stable.

## Work cycle

1. Inspect the working tree and preserve unrelated user changes.
2. Read the governing instructions and relevant current implementation.
3. Confirm the request is inside the approved plan; stop on a material
   contradiction or unapproved contract expansion.
4. Make the smallest coherent change, including focused tests and documentation
   where behavior or operations changed.
5. Run the affected checks sequentially.
6. Review the diff for secrets, accidental generated files, unrelated
   formatting, and contract drift.
7. Commit a verified unit with a Conventional Commit-style message.

Do not combine API, web, infrastructure, broad formatting, and documentation
work unless they are inseparable parts of one behavior change. In particular,
the known API LF/CRLF normalization must be its own mechanical commit.

## Verification matrix

### API

```text
npm run lint --prefix api
npm run build --prefix api
npm test --prefix api
```

API E2E needs a reachable PostgreSQL `DATABASE_URL`. The current lint baseline
and remediation constraint are in `docs/PROJECT_REVIEW.md`.

### Web

```text
npm run lint --prefix web
npm run build --prefix web
npm test --prefix web
```

Run the web test suite without simultaneous builds and audits when diagnosing
lazy-route timeouts. UI changes also require real-browser viewport, keyboard,
focus, overflow, theme, and role checks.

### Integration and release

```text
docker compose config --quiet
docker compose up --build -d
docker compose ps
```

Require healthy database, API, and web services plus host checks for
`http://localhost:3000/health` and `http://localhost:5173/health`. The current
web health-check defect is documented in `docs/PROJECT_REVIEW.md` and
`docs/DEPLOYMENT.md`; an externally reachable page does not by itself satisfy
container health acceptance.

## Handoff

Each handoff must state:

- the outcome and commit hashes;
- material files or areas changed;
- exact verification commands and results;
- environment-dependent checks that did not run;
- assumptions, remaining risks, and deliberately deferred work.

The final integration pass runs automated checks, the applicable manual
checklist, Docker Compose startup from a clean state, and public
frontend-to-API verification when release or deployment behavior is in scope.
