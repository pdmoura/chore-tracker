# 02 — Backend

> Historical implementation brief. Completed on 2026-07-29; do not treat this
> file as an active maintenance task.

## Objective

Implement the approved authentication, user, task, operational, and authorization behavior in the NestJS API.

## Scope and relevant files

- `api/src/**`
- API DTOs, guards, services, controllers, Swagger, and serialization
- `api/test/**` or colocated API tests
- `api/prisma/**` only when a required schema correction is identified

## Dependencies

- Task 01 accepted
- Database migration and seed verified

## Acceptance criteria

- Every endpoint and error class in the plan is implemented.
- JWT authentication, password hashing, validation, role checks, and resource checks are enforced server-side.
- Child visibility, self-created task management, assigned-task completion,
  immutable roles, restricted deletion, and safe serialization rules pass.
- `/health` and `/docs` work in the intended environments.

## Verification commands

```text
npm run lint --prefix api
npm run build --prefix api
npm test --prefix api
```

## Expected handoff

Provide commits, endpoint/DTO summary, migrations if any, verification results, known limitations, and a stable API contract for the frontend.
