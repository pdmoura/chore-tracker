# Chore Tracker — Implementation Plan

**Status:** Implemented; authorization requirements updated 2026-07-29
**Assessment constraint:** Complete the required scope within 6–8 hours. Work should follow dependency and priority order, not a fixed hourly schedule, and stop when the definition of done is satisfied.

## 1. Goal and Scope

Build a basic chore/task tracker with:

- A separate NestJS REST API.
- A separate React web application.
- PostgreSQL persistence.
- Two roles: `PARENT` and `CHILD`.
- Parent-managed users and tasks.
- Child self-management for tasks they create and completion access for every
  task assigned to them.
- A reproducible local setup through Docker Compose.
- A publicly accessible demonstration deployment.

The priority is correct authorization, complete core flows, and simple setup. 

### Out of Scope

- Public registration.
- Password recovery or email verification.
- Refresh-token rotation.
- Multiple households or multi-tenancy.
- Recurring chores.
- Rewards, points, notifications, or real-time updates.
- File uploads.

## 2. Technical Decisions

- **API:** NestJS with TypeScript.
- **Frontend:** React, Vite, and TypeScript.
- **Database:** PostgreSQL.
- **ORM:** Prisma for schema management, migrations, seed data, and queries.
- **Authentication:** JWT with hashed passwords.
- **Frontend routing:** React Router.
- **Server state:** TanStack Query.
- **Local environment:** Docker Compose.
- **Configuration boundary:** Standard environment variables.

Prisma will be accessed through a small NestJS `PrismaService`. Repository, DAO, CQRS, microservice, and other unnecessary abstraction layers will not be added.

Compatible stable dependency versions will be selected and committed through the lockfile. Using the newest available major version is not itself a project goal.

## 3. Architecture and Repository Structure

The project will use one repository containing two independent applications:

```text
chore-tracker/
├── AGENTS.md
├── api/
│   ├── AGENTS.md
│   ├── Dockerfile
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts
│   └── src/
├── web/
│   ├── AGENTS.md
│   ├── Dockerfile
│   └── src/
├── docs/
│   ├── PLAN.md
│   ├── DEPLOYMENT.md
│   ├── PROMPT_HISTORY.md
│   ├── AGENT_WORKFLOW.md
│   └── tasks/
│       ├── 01-foundation.md
│       ├── 02-backend.md
│       ├── 03-frontend.md
│       ├── 04-qa.md
│       └── 05-release.md
├── compose.yaml
├── .env.example
└── README.md
```

The frontend will communicate with the API through REST. Neither application will use provider-specific hosting or database SDKs.

Docker Compose is the official reproducible local setup. Public hosting services are demonstration targets only.

## 4. Codex Orchestration Files

The repository will contain a small set of instructions and task briefs to help Codex work within the project without introducing a separate agent framework.

- **Root `AGENTS.md`:** Project scope, architecture decisions, coding rules, required commands, verification expectations, and definition of done.
- **`api/AGENTS.md`:** NestJS, Prisma, authentication, validation, authorization, migrations, and backend testing guidance.
- **`web/AGENTS.md`:** React, routing, API integration, role-based UI, accessibility, and frontend verification guidance.
- **`docs/AGENT_WORKFLOW.md`:** Implementation order, work boundaries, handoff rules, and final integration process.
- **`docs/tasks/*.md`:** Short task briefs containing an objective, relevant files, dependencies, acceptance criteria, and verification commands.

These files should divide the implementation into clearly scoped work packages that Codex can execute in dependency order. Independent work may run in parallel only when files and responsibilities do not overlap. They must remain concise, use factual responsibilities rather than fictional personas, and avoid unnecessary process.

## 5. Roles and Permissions

### Parent/Admin

A parent can:

- Log in.
- View all users.
- Create Parent or Child accounts.
- Edit a user’s name, email, and password.
- Delete users when allowed.
- View all tasks.
- Create and assign tasks to children.
- Edit and delete tasks.
- Mark tasks as completed or pending.

### Child/User

A child can:

- Log in.
- View their own profile.
- View only tasks assigned to them.
- Create tasks for themselves; the API sets both creator and assignee from the
  authenticated Child.
- Edit or delete only tasks they created for themselves.
- Mark any task assigned to them as completed or pending, including tasks
  created by a Parent.

A child cannot:

- Manage users.
- Choose an assignee or assign a task to another user.
- Edit or delete a task created by a Parent.
- View or update another child’s tasks.

User roles are immutable after account creation. User update requests must not accept role changes.

All authorization must be enforced by the API. Frontend route protection and hidden controls are usability measures, not security boundaries.

## 6. Data Model

### User

- `id`
- `name`
- `email`
- `passwordHash`
- `role`: `PARENT | CHILD`
- `createdAt`
- `updatedAt`

### Task

- `id`
- `title`
- `description` — optional
- `dueDate` — optional
- `assignedToId`
- `createdById`
- `completedAt` — optional
- `createdAt`
- `updatedAt`

### Rules

- Tasks can only be assigned to users with the `CHILD` role.
- A child can only view tasks assigned to them.
- A child-created task is automatically assigned to its creator.
- A child can edit or delete an assigned task only when they are also its
  creator.
- A child can update completion for any task assigned to them.
- `completedAt = null` represents a pending task.
- Password hashes must never appear in API responses.
- A parent cannot delete their own active account.
- A user with related tasks cannot be deleted until those tasks are deleted or reassigned.
- Changing an existing user’s role is not supported.

## 7. REST API

Use an `/api` prefix for application endpoints.

### Authentication

- `POST /api/auth/login`
- `GET /api/auth/me`

### Users — Parent Only

- `GET /api/users`
- `POST /api/users`
- `GET /api/users/:id`
- `PATCH /api/users/:id`
- `DELETE /api/users/:id`

### Tasks

- `GET /api/tasks` — parent sees all tasks; child sees only assigned tasks.
- `POST /api/tasks` — parent or child. A Parent must provide `assignedToId`; a
  Child must omit it and is assigned automatically.
- `GET /api/tasks/:id` — parent or assigned child.
- `PATCH /api/tasks/:id` — parent for any task; child only for a task they
  created for themselves. Child requests cannot include `assignedToId`.
- `DELETE /api/tasks/:id` — parent for any task; child only for a task they
  created for themselves.
- `PATCH /api/tasks/:id/completion` — parent or assigned child.

# Completion request body
```json
{
  "completed": true
}
```
Setting it to `false` should reopen the task by setting `completedAt` to `null`.

### Operational

- `GET /health`
- `GET /docs` for Swagger in the demo environment.

### Expected Errors

- `400` — invalid input.
- `401` — missing or invalid authentication.
- `403` — authenticated user lacks permission.
- `404` — resource does not exist or is not visible to the requester.
- `409` — duplicate email or restricted deletion.

## 8. Frontend

### Routes

- `/login`
- `/admin/tasks`
- `/admin/users`
- `/my-tasks`

### Parent Interface

- View, create, edit, and delete users.
- View, create, assign, edit, and delete tasks.
- View assignee, due date, and completion state.
- Receive clear validation and conflict messages.

User editing must not expose role changes.

### Child Interface

- View assigned tasks.
- Distinguish pending and completed tasks.
- Create tasks without assignee or creator controls.
- Edit and delete only self-created tasks.
- Mark any assigned task completed or pending.

The frontend must include loading, empty, error, and disabled mutation states. Correct behavior and accessible interactions take priority over visual polish.

### Demo API Warm-up

- Opening `/login` sends one request to `/health` on the origin of
  `VITE_API_URL`; the `/api` path is not included in the health URL.
- The login page renders immediately and shows a cold-start loading state while
  the request is pending.
- A successful response clears the cold-start notice. A failed, blocked, or
  timed-out request reveals the login form and is not treated as a permanent
  outage.
- The client does not poll repeatedly.

## 9. Implementation Order

Implementation should proceed in dependency order:

1. Finalize planning documents, scaffold the repository, and define package scripts.
2. Configure PostgreSQL, Prisma, the initial migration, and deterministic seed data.
3. Implement authentication, password hashing, JWT guards, role checks, and safe user serialization.
4. Implement user and task endpoints with validation and resource-level authorization.
5. Build login and the Parent and Child interfaces.
6. Add Dockerfiles and the complete Docker Compose setup.
7. Add essential authorization tests and run the manual verification checklist.
8. Complete documentation, deploy the public demo, and perform final integration verification.

Each stage should move forward once its acceptance criteria and verification commands pass.

When the assessment limit is approaching, remove optional frontend tests, advanced styling, filters, and secondary UX improvements first.

Do not remove:

- Server-side authorization.
- Input validation.
- Password hashing.
- Database migrations and deterministic seed data.
- Parent and child core flows.
- Docker Compose reproducibility.
- Required planning, deployment, README, and prompt-history documentation.

## 10. Testing and Verification

### Required Automated API Tests

Automated tests will focus on the highest-risk authorization rules:

1. A child sees only tasks assigned to them.
2. A child-created task is automatically assigned to its authenticated creator,
   and a Child cannot submit an assignee.
3. A child can edit and delete a task they created for themselves.
4. A child receives `403` when editing or deleting a visible Parent-created task
   and `404` for another child’s hidden task.
5. A child can update completion for any assigned task but not another child’s
   task.
6. A Parent can continue viewing, editing, and deleting every task.

Additional automated coverage is optional unless required to fix or protect discovered defects.

### Manual Verification Checklist

- Parent login succeeds.
- Child login succeeds.
- Parent user create, view, edit, and delete flows work.
- User roles cannot be changed after creation.
- Parent task create, assign, view, edit, and delete flows work.
- Child sees only assigned tasks.
- Child creates a task without assignee or creator fields and the API assigns it
  to that Child.
- Child can edit and delete a self-created task.
- Child cannot edit or delete a Parent-created assigned task.
- Child can mark an assigned task completed and pending.
- Child cannot access another child’s task.
- Unauthorized API operations are rejected.
- Refresh and logout behavior works.
- Validation, empty states, conflicts, and API errors are displayed clearly.
- Password hashes are absent from every API response.
- A clean environment starts through Docker Compose.
- The public frontend can communicate with the public API.

## 11. Deployment and Portability

Possible public demonstration platforms are:

- **Vercel:** React frontend.
- **Render:** NestJS API.
- **Neon:** Hosted PostgreSQL.

These services are optional and replaceable. The application depends on PostgreSQL, not Neon, and should work with another compatible provider by changing configuration only.

Expected environment variables include:

- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`
- `CORS_ORIGINS`
- `VITE_API_URL`

`VITE_API_URL` is a public frontend build-time variable and must never contain secrets. The web Dockerfile should accept it as a build argument or use another documented public runtime configuration mechanism.

No hosting provider should be referenced from core application logic.

## 12. Documentation

The repository will include:

- `README.md` with setup, architecture, scripts, demo credentials, trade-offs, known limitations, deployment links, and total time spent.
- `docs/PLAN.md` containing this implementation plan.
- `docs/DEPLOYMENT.md` covering Docker Compose, local development, and public deployment.
- `docs/PROMPT_HISTORY.md` will be a concise chronological index of the prompts used, decisions made, manual adjustments, and resulting artifacts. The complete exported chat will be supplied separately.
- `docs/AGENT_WORKFLOW.md` defining the practical Codex execution and integration workflow.
- `docs/tasks/*.md` containing the five implementation task briefs.
- `.env.example` containing configuration names without secrets.
- Committed Prisma migrations and deterministic seed data.

The complete chat or exported prompt history can be supplied separately from the concise repository index.

## Definition of Done

The project is complete when:

- A clean checkout starts through documented Docker Compose commands.
- Parent and child demo accounts can log in.
- The parent can manage users and tasks.
- Existing user roles cannot be changed.
- The child sees only their assigned tasks.
- The child can create, edit, and delete tasks they created for themselves
  without choosing an assignee.
- The child cannot edit or delete Parent-created tasks.
- The child can update completion only for their assigned tasks.
- Unauthorized operations are rejected by the API.
- Password hashes are never exposed.
- Prisma migrations and deterministic seed data are included.
- The public frontend communicates with the public API.
- Hosting services can be replaced through environment configuration.
- The README, plan, deployment guide, prompt-history index, Codex workflow, and task briefs are included.
- Required authorization tests and the manual verification checklist pass.
- Total assessment effort remains within the 6–8 hour limit.
