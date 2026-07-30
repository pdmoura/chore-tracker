# Web Instructions

Follow the root `AGENTS.md` and `docs/PLAN.md`.

## Boundaries

- Own files under `web/`; coordinate before changing shared root files.
- Use React, Vite, TypeScript, React Router, TanStack Query, Tailwind CSS v4,
  shadcn/ui-style local components, Radix primitives, and Lucide icons.
- Consume the REST API through `VITE_API_URL`; do not use hosting-provider SDKs or expose secrets.
- Treat route guards and hidden controls as usability features, not authorization.

## Interface rules

- Implement only `/login`, `/admin/tasks`, `/admin/users`, and `/my-tasks`.
- Do not expose role editing.
- Do not expose assignee or creator fields in Child task forms.
- Include accessible controls plus loading, empty, error, validation, conflict, and disabled-mutation states.
- Keep visible copy and date formatting in English with the `en-US` locale.
- Maintain semantic light/dark tokens, the desktop sidebar, mobile navigation
  Sheet, responsive table/card layouts, and desktop-Sheet/mobile-Drawer forms.
- Use AlertDialog for destructive confirmation; do not use `window.confirm`.
- Prefer correct parent and child flows over optional styling or secondary features.

## Verification

Run web lint, type-check/build, and tests before handoff. Verify refresh,
remember-me storage, logout, session timeout/recovery, theme persistence, role
routing, responsive behavior, and API error handling.
