# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Auth**: Replit Auth (OIDC with PKCE)

## Application

**Endometriosis Toolkit** — A health PWA for tracking pain, symptoms, and medications with doctor report generation.

- **Frontend**: React + Vite, deployed at `/` (`artifacts/endo-toolkit`)
- **Backend**: Express API at `/api` (`artifacts/api-server`)

### Features
- Pain tracker with 1-10 score slider, location, type, notes
- Symptom tracker with severity slider, common presets, triggers
- Medication tracker with relief levels
- Doctor report generator (30-day summary, charts, print view)
- PWA manifest + service worker support
- Mobile-first bottom navigation
- Recharts for data visualization

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server
│   └── endo-toolkit/       # React+Vite PWA frontend
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── replit-auth-web/    # Replit Auth browser hooks
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Database Schema

- `users` — Replit Auth users
- `sessions` — Session storage for auth
- `pain_logs` — Pain entries with score, location, type, notes
- `symptom_logs` — Symptom entries with type, severity, triggers
- `medication_logs` — Medication entries with dose, time, relief level

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only emit `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in its `references` array

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## API Endpoints

All routes prefixed with `/api`:

- `GET /healthz` — health check
- `GET /auth/user` — current auth state
- `GET /login` — OIDC login redirect
- `GET /callback` — OIDC callback
- `GET /logout` — logout
- `GET /pain-logs` — list pain logs
- `POST /pain-logs` — create pain log
- `DELETE /pain-logs/:id` — delete pain log
- `GET /symptom-logs` — list symptom logs
- `POST /symptom-logs` — create symptom log
- `DELETE /symptom-logs/:id` — delete symptom log
- `GET /medication-logs` — list medication logs
- `POST /medication-logs` — create medication log
- `DELETE /medication-logs/:id` — delete medication log
- `GET /reports/summary` — 30-day summary report

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with Replit Auth, session management, and all tracker routes.

### `artifacts/endo-toolkit` (`@workspace/endo-toolkit`)

React + Vite PWA with mobile-first design. Uses generated React Query hooks for data fetching.

### `lib/replit-auth-web` (`@workspace/replit-auth-web`)

Browser auth hooks. Use `useAuth()` for authentication state. Do NOT use generated API client hooks for auth operations.

### `lib/db` (`@workspace/db`)

Database layer using Drizzle ORM with PostgreSQL.
- `pnpm --filter @workspace/db run push` — sync schema to DB
- `pnpm --filter @workspace/db run push-force` — force sync

### `lib/api-spec` (`@workspace/api-spec`)

OpenAPI 3.1 spec and Orval codegen config.
- `pnpm --filter @workspace/api-spec run codegen` — generate client and Zod schemas
