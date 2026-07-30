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

## State and session rules

- Keep server state in TanStack Query and HTTP access behind
  `src/lib/api.ts`; do not call `fetch` directly from pages.
- Preserve the `chore-tracker-token` contract: “Remember me” uses
  `localStorage`, tab-only login uses `sessionStorage`, and login/logout clear
  stale copies from both.
- Preserve the 15-second `/auth/me` timeout. Clear stored tokens automatically
  only for `401`; retain them and expose Retry/Sign out for timeout, network, or
  5xx failures.
- When centralizing authenticated request errors, route a genuine endpoint
  `401` through session invalidation so an already-open page does not remain
  stuck with an expired JWT. Do not generalize that behavior to non-401 errors.
- Preserve the single cached 65-second root `/health` warm-up. It must remain
  silent until a sign-in attempt is waiting on it and must never become polling
  or a permanent outage state.
- Keep role redirects aligned with the API roles: Parent defaults to
  `/admin/tasks`; Child defaults to `/my-tasks`.

## View behavior

- Parent Tasks search title, description, and assignee; filter by completion and
  assignee; sort title/due date; and paginate five items at a time.
- Users search name, email, and role; sort supported columns; and paginate five
  items at a time. Search/filter/sort changes reset page one.
- Compute summaries from the complete authorized collection. “Due soon” is
  today through the next three local calendar days; “Due today” is the current
  local calendar date.
- Keep Parent Complete/Reopen, Edit, and Delete actions in the overflow menu.
  Child completion stays visible; Child Edit/Delete appears only when assignee
  and creator both match the authenticated Child.
- At `md` (`768px`) and above, use tables and right-side form Sheets. Below
  `md`, use cards and bottom Drawers. Maintain `sm` 640px and `lg` 1024px
  boundaries where needed; do not reintroduce a single global breakpoint.
- Preserve form focus on open, trigger focus restoration on close, fixed
  overlay headers/footers, scrollable bodies, and dismissal locking while a
  mutation is pending.

## Verification

Run `npm run lint`, `npm run build`, and `npm test` from `web/` sequentially
before handoff. The current baseline is 25 tests across 13 files. Run the suite
without concurrent builds/audits when diagnosing lazy-route timeouts.

For UI changes, additionally verify refresh, remember-me storage, logout,
session timeout/recovery, theme persistence, role routing, English dates,
responsive table/card switching, Sheet/Drawer focus behavior, overflow, and API
errors. Component tests do not replace real-browser checks at 1440px, 768px,
and 375px.

Run `npm audit --omit=dev` for dependency or release work. The current React
Router RSC advisory and rationale are documented in
`docs/PROJECT_REVIEW.md`; do not apply the proposed forced downgrade without
compatibility verification.
