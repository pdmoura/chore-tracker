# 05 — Release

## Objective

Finish documentation, publish the replaceable-provider demo, and perform final integration verification.

## Scope and relevant files

- `README.md`
- `docs/DEPLOYMENT.md` and `docs/PROMPT_HISTORY.md`
- Environment examples and deployment-only configuration
- Public deployment configuration and links

## Dependencies

- Task 04 accepted
- Local Docker Compose and all required checks passing

## Acceptance criteria

- README and deployment documentation contain every item required by the plan.
- No secret is committed and provider-specific logic is absent from core application code.
- Public frontend, API, and PostgreSQL deployment work through environment configuration.
- The public frontend completes Parent and Child core flows against the public API.
- Final effort and known limitations are recorded.

## Verification commands

```text
git status --short
docker compose config
npm test --prefix api
npm run build --prefix api
npm run build --prefix web
```

Also repeat the manual checklist against the public URLs.

## Expected handoff

Provide release commits, public links, final verification evidence, demo credentials, total effort, known limitations, and rollback or redeploy notes.
