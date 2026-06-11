# AGENTS.md

## Cursor Cloud specific instructions

This repo (`sisges-react-app`) is the **frontend only** — a Vite + React 18 + TypeScript SPA for SISGES (school management). The REST API + WebSocket backend lives in a **separate repository** (`sisges-sboot-app`, Spring Boot/Java 21) that is **not present** in this workspace.

### Services & commands
- Dev server: `npm run dev` → Vite on `http://localhost:3000` (the config sets `open: true`; in headless cloud VMs the auto-open browser step is harmless and the server still serves on :3000).
- Build: `npm run build` (`tsc && vite build`).
- Lint: `npm run lint` (ESLint, runs with `--max-warnings 0`).
- E2E: `npm run cypress:run` (Cypress) — requires both the frontend (:3000) and the backend (:8080) running, plus credentials via `cypress/cypress.env.json` or `CYPRESS_*` env vars.

### Backend dependency (non-obvious)
- The app talks to the backend at `VITE_API_BASE_URL` (default `http://localhost:8080/api`; set via `.env`, see `.env.example`). Auth/login, data pages, file uploads, and the realtime announcements feed (STOMP `/ws`) all require this backend.
- `docker-compose.yml` builds the backend from a sibling path `../sisges-sboot-app`. Without that sibling repo (and Docker), the backend and DB cannot be started here, so **login and data-backed flows cannot complete end-to-end** in this workspace. Client-side functionality (UI rendering, routing, theme toggle, form interaction/validation) works without the backend.

### Known pre-existing lint failures
- `npm run lint` currently fails on 2 pre-existing `prefer-const` errors in `src/pages/GradingConfig/GradingConfig.tsx` (plus some `react-refresh`/`react-hooks` warnings). These are unrelated to environment setup.
