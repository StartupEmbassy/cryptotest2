# Project Context - CryptoPanel

## Vision
Deliver a fast, reliable dashboard for monitoring Bitcoin and Ethereum spot and short range historical prices. CryptoPanel should make market checks effortless for analysts and enthusiasts without forcing them into trading platforms.

## Objectives
- Provide authenticated access through Supabase Google sign-in.
- Show BTC and ETH spot prices with 60 second auto refresh and manual refresh controls.
- Offer historical charts for 24h, 7d, and 30d ranges using CoinGecko as the data source.
- Let each user configure base currency (default USD) and timezone (default Europe/Madrid) with preferences stored in Supabase.
- Expose a minimal admin-only surface on `/admin`.
- Keep the experience CSR only with Next.js App Router and React Query.
- Record server logs and expose a `/healthz` endpoint for monitoring.

Success criteria are the MVP validation metrics listed in `docs/STRUCTURE.md` (TTFU under 2s, latency budgets, error budget, settings persistence).

## Stakeholders
- Product owner: Cristian Del Aguila (`cdela`)
- Technical owner: CryptoPanel engineering team
- Primary users: Market watchers who need quick crypto pricing
- Additional stakeholders: Operations (Supabase and Vercel maintainers), compliance (user profile privacy)

## Architectural Overview
CryptoPanel is a client-side rendered Next.js application organised by feature folders. Supabase provides authentication and the `profiles` table with Row Level Security. Route handlers inside the Next.js project function as a backend-for-frontend layer, validating requests, enforcing rate limits, calling CoinGecko, and normalising responses with cache headers. React Query manages polling and caching on the client. Deployment targets Vercel (EU region) for the app and Supabase (EU-West) for auth and data.

## Key Components
| Component | Purpose | Owner | Notes |
|-----------|---------|-------|-------|
| Next.js app | UI, routing, client logic | Frontend | Tailwind + shadcn/ui, React Query |
| Supabase auth and DB | Google login, profiles table | Backend | RLS ensures per-user access, admins can read all |
| Route handlers (BFF) | `/api/prices`, `/api/history`, `/healthz` | Backend | Perform validation, cache headers, logging |
| CoinGecko | External market data | External | Endpoints `/simple/price` and `/market_chart` |
| Observability utilities | Logging and health checks | Infra | Provide structured logs and `/healthz` |

## Current Status (2025-10-28)
- Documentation baseline created for LLM and human collaboration.
- Architecture, contracts, and data model defined.
- No application code committed yet.
- Open tasks: create Supabase migration, scaffold Next.js project, implement API handlers.

## Upcoming Milestones
1. Complete Supabase schema and RLS policies - **TBD**
2. Scaffold the Next.js project with feature folders and shared config - **TBD**
3. Implement market data flow (API + UI) with React Query polling - **TBD**
4. Finalise settings persistence and admin section - **TBD**
5. Deploy MVP to Vercel and Supabase, validate metrics - **TBD**

## References
- CoinGecko API docs: https://www.coingecko.com/en/api/documentation
- Supabase Auth Helpers for Next.js: https://supabase.com/docs/guides/auth/server/nextjs
- shadcn/ui documentation: https://ui.shadcn.com
- React Query (TanStack Query): https://tanstack.com/query/latest
