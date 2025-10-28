# Repository Structure Guide - CryptoPanel

CryptoPanel uses a feature-first organisation to keep the MVP modular and easy to extend.

## Top-level layout
```
cryptopanel/
|-- README.md
|-- LLM_START_HERE.md
|-- HOW_TO_USE.md
|-- docs/
|-- src/
|   |-- app/
|   |-- config/
|   |-- features/
|   |-- lib/
|   |-- types/
|-- tests/
|-- scripts/
`-- .github/
```

## How `app/` and `features/` Work Together

**Separation of concerns**:
- `src/app/`: Contains Next.js routes, layouts, and page components (presentation layer)
- `src/features/`: Contains business logic, hooks, services, and API handlers organized by feature

**Example flow**:
1. User visits `/` (route defined in `src/app/page.tsx`)
2. Page component imports `usePrices` hook from `src/features/market/hooks/use-prices.ts`
3. Hook calls `src/features/market/services/prices-service.ts`
4. Service makes request to `src/features/market/api/prices/route.ts` (API handler)
5. API handler validates input, calls CoinGecko, and returns normalized data

**Benefits**:
- Routes are thin wrappers that compose feature modules
- Features are testable in isolation
- Clear dependency graph: `app/` depends on `features/`, never the reverse
- Easy to locate code: business logic lives in `features/`, presentation in `app/`

## Directory descriptions
| Path | Purpose | Notes |
|------|---------|-------|
| `docs/` | Project documentation, policies, runbooks | Keep in sync with implementation |
| `docs/llm/` | Handoff and history for LLM sessions | Update every session |
| `docs/operations/` | Operational runbooks | Document deploy, incident, rollback steps |
| `src/app/` | Next.js routes and layouts | CSR only |
| `src/config/` | Defaults, env parsing, runtime config | Provide typed values |
| `src/features/` | Feature modules (`auth`, `market`, `settings`, `admin`, `infra`) | Each feature has `components/`, `hooks/`, `services/`, `api/`, `types/` |
| `src/lib/` | Shared helpers (date, currency, supabase client) | Keep dependency graph shallow |
| `src/types/` | Shared contracts derived from API/DB | Re-exported where needed |
| `tests/` | Unit, integration, and e2e tests | Subfolders by level |
| `scripts/` | Idempotent scripts (migrations, checks) | No business logic here |
| `.github/` | Issue/PR templates, CI workflows | Align checklists with project rules |

## Feature module layout
```
src/features/<feature>/
|-- components/
|-- hooks/
|-- services/
|-- api/
`-- types/
```
- `components/`: Presentational React components (Tailwind + shadcn/ui).
- `hooks/`: React hooks combining React Query and feature logic.
- `services/`: Calls to internal API or Supabase plus adapters.
- `api/`: Route handlers and helpers for validation, rate limit, error mapping.
- `types/`: Feature specific TypeScript types; expose public contracts here.

## Naming conventions
- Files use `kebab-case.ts` or `kebab-case.tsx`. Hooks use `use-name.ts`.
- Tests use suffix `.test.ts` (unit/integration) and `.spec.ts` (e2e).
- Branch names: `feature/<short>`, `fix/<short>`, `docs/<short>`.
- Environment variables use `NEXT_PUBLIC_` prefix only when required on the client.
- Commit messages follow the template in `LLM_START_HERE.md`.

## Onboarding notes
- Read `docs/PROJECT_CONTEXT.md` and `LLM_START_HERE.md` first.
- Initial deliverables: Supabase migration, Next.js scaffold, API handlers.
- Keep files small; split components or hooks when approaching 100 lines.
- Document decisions or open questions in `docs/llm/HANDOFF.md`.

## MVP validation metrics
- Time to first update (TTFU) under 2 seconds in EU.
- `/api/prices` P95 latency under 600 ms, `/api/history` P95 under 1200 ms.
- API error rate (5xx) under 1 percent.
- Polling and manual refresh both operational.
- Currency/timezone changes persist and show up immediately in UI.
