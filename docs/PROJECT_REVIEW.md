# Project Review

**Reviewed:** 2026-07-30  
**Scope:** tracked application source, tests, database assets, container and
deployment configuration, documentation, and agent instructions.

## Executive Summary

Chore Tracker has a clear two-application architecture: a NestJS/Prisma API
owns authentication, validation, authorization, and persistence, while a
React/Vite client consumes the API through REST. The implemented Parent and
Child permissions match the approved model, password hashes are selected out
of API responses, the frontend has a coherent responsive design system, and
both applications have meaningful automated coverage.

The review found no implementation-blocking contradiction between the API,
Prisma schema, frontend routes, and `docs/PLAN.md`. It did identify these
maintenance priorities:

1. the global JWT guard converts database lookup failures into `401`, which can
   make the resilient session client discard a valid token during an outage;
2. the web container is served correctly but reports unhealthy because its
   internal health check resolves `localhost` to an address Nginx is not
   listening on;
3. API lint is red because all checked TypeScript files use CRLF while the
   committed Prettier configuration expects LF;
4. the client-only React Router installation is still reported by `npm audit`
   through an RSC action advisory, even though this application does not use
   React Server Components.

## Current System

### Runtime Architecture

| Area | Current implementation |
| --- | --- |
| API | NestJS 11, TypeScript, Prisma 6, PostgreSQL, JWT, bcrypt |
| Web | React 19, Vite 7, React Router 7, TanStack Query 5 |
| UI | Tailwind CSS 4, local shadcn/ui-style components, Radix, Lucide |
| Tests | Jest/Supertest API E2E; Vitest/jsdom, Testing Library, user-event, MSW |
| Local runtime | PostgreSQL 17, API, and Nginx web containers through Compose |
| Public runtime | Vercel web, Render API, Neon PostgreSQL |

The API exposes application routes below `/api`; `/health` and `/docs` remain
at the origin root. The web client reads the public API base from
`VITE_API_URL` and contains no provider SDK.

### Product and Authorization Boundaries

- Parents can manage users and all tasks, except they cannot change roles,
  delete their own active account, or delete users referenced by tasks.
- Children see only assigned tasks. They can create tasks for themselves and
  edit or delete only those self-created tasks.
- Children can complete or reopen any task assigned to them, regardless of
  creator.
- Child assignment and creator identity are derived by the API. Frontend route
  guards and hidden controls are usability measures only.
- Password hashes are excluded with a shared Prisma safe-user selection.
- Public registration, password recovery, profile editing, recurrence,
  categories, uploads, notifications, and multi-household support remain out
  of scope.

### Frontend Behavior

- Routes are limited to `/login`, `/admin/tasks`, `/admin/users`, and
  `/my-tasks`, with role-aware redirects.
- Explicit Light/Dark selection is persisted; otherwise the OS theme is used.
- Desktop uses a fixed shell, tables, and right-side Sheets. Mobile uses a
  compact header, cards, a navigation Sheet, and bottom Drawers.
- Parent task and user data is searched, filtered, sorted, summarized, and
  paginated in the browser in five-row pages.
- Dates are formatted centrally with `Intl.DateTimeFormat('en-US')`.
- “Remember me” stores the JWT in `localStorage`; otherwise it uses
  `sessionStorage`. Login and logout clear stale copies from both stores.
- `/auth/me` has a 15-second timeout. Network, timeout, and 5xx failures retain
  the token and expose Retry/Sign out; a `401` clears both stores.
- Login begins one silent, cached `/health` warm-up with a 65-second bound.

## Verification Snapshot

The following checks were run from the repository root on 2026-07-30. API E2E
used the healthy Compose PostgreSQL service.

| Check | Result |
| --- | --- |
| `npm run build --prefix api` | Passed |
| `npm test --prefix api` | Passed: 7 tests |
| `npm audit --omit=dev --prefix api` | Passed: 0 vulnerabilities |
| `npm run lint --prefix api` | Failed: 1,605 CRLF/Prettier errors |
| `npm run lint --prefix web` | Passed |
| `npm run build --prefix web` | Passed |
| `npm test --prefix web` | Passed in isolation: 25 tests across 13 files |
| `npm audit --omit=dev --prefix web` | Failed: 2 high package findings from one React Router RSC advisory |
| `docker compose config --quiet` | Passed |
| Local API `/health` | `200`; API container healthy |
| Local web `/health` | `200` from host; web container marked unhealthy |
| Published Vercel frontend | `200` |
| Published Render `/health` and `/docs` | First 30-second cold request timed out; retry returned `200` |

The first web test run was launched concurrently with builds, audits, API tests,
and both linters; its two lazy-route tests exceeded Vitest's five-second test
limit. The same complete suite passed when rerun without that resource
contention. Run the web suite independently when diagnosing a failure.

## Findings and Recommendations

### High: Authentication Guard Masks Database Failures

`JwtAuthGuard.canActivate` places JWT verification and the Prisma user lookup
inside one broad `try/catch`. A PostgreSQL or Prisma failure is therefore
translated into `401 Missing or invalid authentication`. On `/api/auth/me`,
that response causes the frontend to clear both token stores even though the
JWT may still be valid, undermining the intended timeout/network/5xx recovery
behavior.

Catch only JWT verification failures. Let infrastructure exceptions propagate
as server errors, and return `401` explicitly only for an invalid token or a
token whose user no longer exists. Add an E2E or focused guard test proving a
Prisma failure is not rewritten as `401`.

### High: Web Container Health Status Is Incorrect

`docker compose ps` reports the web service as unhealthy even while
`http://localhost:5173/health` returns `200`. Inside the container:

- `wget http://localhost/health` exits `1` with connection refused.
- `wget http://127.0.0.1/health` exits `0`.

The same `localhost` target exists in `web/Dockerfile` and `compose.yaml`.
Change both targets together to `127.0.0.1`, rebuild the image, and require all
three Compose services to become healthy before declaring clean-start
verification complete.

### Medium: API Lint Baseline Is Red

The API compiles and all E2E tests pass, but ESLint's Prettier integration
expects LF and reports every CRLF line. Normalize the API TypeScript files in a
dedicated mechanical commit, add an explicit repository line-ending policy
(for example `.gitattributes`), then rerun lint/build/tests. Do not mix this
repository-wide rewrite with feature work.

### Medium: React Router Audit Advisory

The web production audit reports two high package findings through
`react-router` and `react-router-dom` for RSC action handling. The application
uses client-only `BrowserRouter` and no RSC actions, which reduces practical
exposure, but the advisory should still be tracked. Do not apply npm's proposed
forced downgrade automatically; evaluate a patched compatible release and
rerun lint, build, tests, and role-routing checks.

### Medium: No Browser-Level Regression Suite

Component tests cover session behavior, themes, route redirects, view helpers,
forms, responsive overlay selection, and destructive confirmation. They do not
prove actual layout, overflow, focus behavior in a real browser, or
frontend-to-API flows. Keep the documented manual viewport and keyboard matrix
until a small Playwright suite is explicitly approved.

### Medium: Expired Sessions Are Not Handled During Page API Calls

The client clears an invalid token only when `/auth/me` returns `401`.
Authenticated task and user queries call `apiRequest` directly; if the
one-hour JWT expires while the application remains open, those requests show a
page error but do not transition the authentication context to anonymous.

Route authenticated `401` responses through one session-invalidating path, or
trigger a current-session recheck, without clearing tokens for network, timeout,
or 5xx errors. Cover an expired-token page query in frontend tests.

### Low: Client-Side Collection Operations

Task and user endpoints return complete authorized collections; the browser
performs summaries, search, sorting, filters, and pagination. This is
appropriate for the current family-scale product, but it will not scale to
large households or multi-tenant datasets. Any server-side pagination work
would be an API contract change and requires plan approval.

### Low: Browser Token Storage

JWT storage in `localStorage` or `sessionStorage` makes the selected persistence
behavior simple but leaves tokens accessible to successful script injection.
The application mitigates authorization risk on the server, but refresh-token
rotation or HTTP-only cookie sessions would require a separately approved
authentication redesign.

## Maintenance Baseline

For routine changes:

1. read the root and nearest application `AGENTS.md`;
2. confirm the change fits `docs/PLAN.md`;
3. preserve REST payloads and authorization unless a contract change is
   explicitly approved;
4. run the affected application's lint, build, and tests sequentially;
5. run API E2E only with a reachable disposable or local PostgreSQL database;
6. for container changes, require `docker compose config --quiet`, healthy
   services, and host-level health checks;
7. update this review when a listed finding is fixed or a new material risk is
   accepted.
