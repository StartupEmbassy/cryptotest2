# LLM Work Handoff - CryptoPanel

## Current Status
- Last Updated: 2025-10-28 - ChatGPT
- Session Focus: Implement live market APIs and wire dashboard to CoinGecko
- Status: /api/prices, /api/history, and /healthz implemented with rate limiting, cache headers, and logging; UI now consumes real data

## Immediate Context
ChatGPT provisioned the Next.js App Router scaffold (CSR only), Tailwind setup, and feature-first directory structure. Shared configuration modules, Supabase client factories, logger, and in-memory rate limiter remain as before. Market API handlers now validate input with Zod, enforce limits, call CoinGecko, and return normalized payloads that match docs/API_CONTRACTS.md (history response now includes symbol, vs, range, and a series array). React Query hooks and services call the internal API instead of mocks, and the dashboard renders real prices and charts. Supabase migration 20251028_init_profiles.sql remains ready for auth/settings work. Vitest, Testing Library, and Playwright configs are unchanged.

## Active Files
- `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `.eslintrc.js`
- `src/app/api/{prices,history}/route.ts`, `src/app/healthz/route.ts`
- `src/features/market/api/{prices,history}/route.ts`, `src/features/market/api/shared.ts`
- `src/features/market/{components,hooks,services,types}` (live integrations)
- `src/features/infra/api/healthz/route.ts`, `src/features/infra/{errors,logger,rate-limit}.ts`
- `.env.example`
- `supabase/migrations/20251028_init_profiles.sql`
- Testing configs: `vitest.config.ts`, `playwright.config.ts`, `tests/setup/vitest.setup.ts`
## Current Versions
- package.json: 0.1.0

## Top Priorities
1. Implement Supabase authentication (Google login) and protect /, /settings, /admin routes.
2. Persist user settings (currency, timezone) via Supabase profiles and update the settings UI.
3. Build the admin-only surface and guard components with role checks.
4. Add contract tests for /api/prices and /api/history plus unit tests for formatters/rate-limit utilities.

## Do Not Touch
- Core documentation structure (maintain LLM-DocKit workflow)
- Architectural principles (CSR only, feature-first organization)

## Open Questions
- Exact Vercel deployment region (EU-West specific country?)
- Initial admin user creation process (manual DB insert?)
- CoinGecko rate limit handling: implement backoff from day 1 or wait for 429 errors?
- Node runtime upgrade plan (local dev currently on v19.6.0; tooling targets >=20.10.0)

## Testing Notes
- No feature tests implemented yet; API handlers still lack automated coverage.
- Testing strategy documented in docs/TESTING_STRATEGY.md.
- Minimum coverage: 70% overall, 100% for utilities and validation.
