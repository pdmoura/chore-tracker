# 03 — Frontend

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
- Parent user and task flows and Child assigned-task completion flows work.
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
