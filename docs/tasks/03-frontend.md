# 03 — Frontend

> Historical implementation brief. Completed on 2026-07-29 and superseded for
> current UI details by `docs/PLAN.md` and `docs/PROJECT_REVIEW.md`.

## Objective

Build the approved Parent and Child interfaces against the stable REST API contract.

## Scope and relevant files

- `web/src/**`
- `web/index.html` and web configuration when required
- Frontend tests, if retained within the assessment priority

## Dependencies

- Task 02 accepted
- API routes, request bodies, responses, errors, and demo credentials handed off

## Acceptance criteria

- Login and role-aware navigation reach the four approved routes.
- Parent user/task flows and Child self-created task management and completion
  flows work.
- Child forms expose neither assignee nor creator fields.
- Role editing is absent.
- Loading, empty, error, validation, conflict, and disabled-mutation states are clear and accessible.
- Refresh and logout behavior work with `VITE_API_URL`.

## Verification commands

```text
npm run lint --prefix web
npm run build --prefix web
npm test --prefix web --if-present
```

## Expected handoff

Provide commits, route and component summary, verification results, manual scenarios exercised, and any API integration risks.
