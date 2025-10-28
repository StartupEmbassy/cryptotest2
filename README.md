# Panel Dashboard

Panel is a web dashboard that shows real-time and historical prices for Bitcoin (BTC) and Ethereum (ETH). The MVP targets a fast, secure client-side Next.js application backed by Supabase for authentication and user preferences. Users choose their base currency and timezone, refresh data manually or automatically, and admins get a small role-gated section.

This repository hosts the complete documentation blueprint. Implementation work should follow the contracts and constraints described here.

## MVP Scope
- Google login through Supabase (EU-West project)
- Dashboard with two spot price cards (BTC, ETH) and a historical chart
- Historical ranges: 24h, 7d, 30d fetched on demand through our backend
- Auto refresh every 60 seconds plus manual refresh controls
- User-level settings: base currency (default USD) and timezone (default Europe/Madrid)
- Roles: `user` and `admin`; `/admin` displays content only to admins
- No SEO requirements; everything renders client-side
- Market data pulled from CoinGecko per request (no local persistence)

## Architecture Overview
Panel follows a modular-by-feature structure with clear layering:

| Layer | Responsibilities | Notes |
|-------|------------------|-------|
| Client (Next.js App Router, CSR) | Routes `/`, `/login`, `/settings`, `/admin`; UI components for cards, chart, controls | Uses React Query for polling and cache |
| Feature Hooks and Services | `usePrices`, `useHistory`, `useUserSettings`; orchestrate data fetching | Convert API responses into typed view models |
| Backend-for-Frontend (Route Handlers) | `/api/prices`, `/api/history`, `/healthz`; validate input, enforce limits, normalize data | Add cache headers, log provider errors |
| Supabase Auth and DB | Google OAuth, `profiles` table with preferences and roles | RLS ensures users can only view their own row |
| External Provider | CoinGecko `/simple/price` and `/market_chart` | Handle rate limits and provider degradation gracefully |

See `docs/PROJECT_CONTEXT.md` for extended context.

## Feature Modules
Repository code will live under `src/features/<feature>`:

- `auth` - Session helpers, Google login, route guards
- `market` - Spot and historical price fetching along with chart adapters
- `settings` - User preference forms and Supabase updates
- `admin` - Admin-only UI banner or user summary
- `infra` - Rate limiting, shared config, health check, logging utilities

Each module should separate UI (`components/`), hooks (`hooks/`), services (`services/`), API handlers (`api/`), and shared types (`types/`) with files kept close to 100 lines.

## Key Contracts
### Pages
- `/login` - Google sign-in, redirects to `/` after a valid session
- `/` - Dashboard with BTC/ETH spot cards and a history chart with range selector
- `/settings` - Form to edit base currency and timezone; session required
- `/admin` - Visible only to admins; otherwise shows blocked message

### API Routes
- `GET /api/prices?symbols=btc,eth&vs=usd`
  - Response: `{ "<symbol>": { "price": number, "ts": epoch_ms } }`
  - Cache headers: `s-maxage=60`, `stale-while-revalidate=120`
  - Rate limit: 60 requests per minute per IP
- `GET /api/history?symbol=btc&vs=usd&range=24h`
  - Response: ordered array of `{ "t": epoch_ms, "p": number }`
  - Same cache headers and rate limit as `/api/prices`
- `GET /healthz`
  - Response: `{ "status": "ok", "version": string, "time": ISO string, "env": "prod" }`

Any invalid input returns `400`, rate limit exhaustions return `429`, provider errors return `502`, and unexpected failures return `500`.

### Data Model
Supabase `profiles` table:

| Column | Type | Notes |
|--------|------|-------|
| `id` | `uuid` | Primary key, matches `auth.users.id` |
| `email` | `text` | Unique |
| `role` | `text` enum (`user`, `admin`) | Default `user`; admins can read all rows |
| `base_currency` | `text` | Default `USD` |
| `tz` | `text` | Default `Europe/Madrid` |
| `created_at` | `timestamptz` | Default `now()` |

RLS policies: users can read/update only their record; admins can select all rows.

## Tech Stack
- Framework: Next.js (App Router) with client-side rendering only
- Language: TypeScript with strict configuration
- UI: Tailwind CSS plus shadcn/ui primitives
- State and fetching: React Query with 60 second polling
- Charts: Recharts line chart
- Auth and DB: Supabase (Google OAuth, Postgres with RLS)
- Deployment: Vercel (EU) for app, Supabase (EU-West) for auth/DB
- Observability: structured server logs, `/healthz` endpoint

## Configuration
- Environment variables: Supabase URL, Supabase anon key, rate limit and cache defaults
- Store defaults in `src/config`
- Do not commit secrets; `.env.example` will document placeholders

## Testing Strategy
- Contract tests for `/api/prices` and `/api/history` with mocked CoinGecko responses
- Utility tests covering currency and timezone formatting helpers
- Access control tests ensuring protected routes redirect to `/login` when no session is present

## Operations and Deployment
- Single production environment initially
- Vercel preview deployments optional; production deploys from `main`
- Supabase migration script must be idempotent
- Rate limiting implemented in the BFF with caveats documented for serverless scale-out
- Rollbacks: revert to previous Vercel deployment and use reversible DB migrations

## Documentation Map
- LLM Guide: `LLM_START_HERE.md`
- Getting Started: `HOW_TO_USE.md`
- Project Context: `docs/PROJECT_CONTEXT.md`
- Repository Structure: `docs/STRUCTURE.md`
- Version Policy: `docs/VERSIONING_RULES.md`
- Active Work: `docs/llm/HANDOFF.md`
- Change Log: `docs/llm/HISTORY.md`
- Runbooks: `docs/operations/`

---

Panel is currently in planning. Follow these documents to keep the implementation aligned with the agreed specification.
