# ZoolGo — Admin Dashboard

Central administration dashboard for ZoolGo (لوحة الإدارة المركزية): overview, bookings and tickets, carriers, broker offices and wallets, financials and settlements, refunds, reports, live tracking, admin team / roles / audit, settings.

- Stack: React 19, TypeScript, Vite, Tailwind 3, React Router 7, TanStack Query 5, Recharts, Leaflet, Radix UI.
- RTL Arabic UI (`<html dir="rtl" lang="ar">`, IBM Plex Sans Arabic).
- Backend API & docs: https://github.com/Abnaa-Syria/zool-backend (plan: `docs/MASTER_PLAN.md`).

> **Status:** UI complete (29 routes) but still running on in-memory mock services (`src/features/*/services`, `src/mocks`). Wiring to the real API is MASTER_PLAN phase 4.

## Run

The dashboard talks to the ZoolGo API. Start the backend first (`zool-go-backend`: `npm run dev`, port 4000), then:

```bash
npm ci
cp .env.example .env   # optional; defaults: VITE_API_BASE_URL=/api/v1, proxy target http://localhost:4000
npm run dev            # http://localhost:5173 — Vite proxies /api to the backend
```

Sign in with an admin phone (dev seed Super Admin: `+249900000001`). In development the OTP is shown on the login screen.

Auth model: access token in memory only; refresh token is an HttpOnly cookie restored on reload; 401 → one shared refresh → retry (`src/lib/api/client.ts`). Pages still on fixtures are tagged **تجريبي** in the sidebar and show a banner.

## Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Typecheck + production build |
| `npm run lint` | oxlint — warnings fail the build |
| `npm test` | Vitest unit tests |
| `npm run preview` | Serve the production build |

## Structure

```text
src/
├── app/          # Router, shell (sidebar, topbar, navigation)
├── components/   # Shared UI (buttons, modals, receipt printer, …)
├── features/     # One folder per domain: pages, components, hooks, services, types
├── lib/          # Utilities
├── mocks/        # Fixtures (to be removed as each domain is wired to the API)
└── services/     # Overview service
```

## Workflow

Commit and push directly to `main`. Run `npm run lint && npx tsc -b && npm test` before pushing; CI (`.github/workflows/ci.yml`) re-runs lint, typecheck, tests and build on every push.
