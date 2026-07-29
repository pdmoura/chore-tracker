# Web Instructions

Follow the root `AGENTS.md` and `docs/PLAN.md`.

## Boundaries

- Own files under `web/`; coordinate before changing shared root files.
- Use React, Vite, TypeScript, React Router, and TanStack Query.
- Consume the REST API through `VITE_API_URL`; do not use hosting-provider SDKs or expose secrets.
- Treat route guards and hidden controls as usability features, not authorization.

## Interface rules

- Implement only `/login`, `/admin/tasks`, `/admin/users`, and `/my-tasks`.
- Do not expose role editing.
- Do not expose assignee or creator fields in Child task forms.
- Include accessible controls plus loading, empty, error, validation, conflict, and disabled-mutation states.
- Prefer correct parent and child flows over optional styling or secondary features.

## Verification

Run the web lint, type-check/build, and available tests before handoff. Verify refresh, logout, role routing, and API error handling.
