# LLM Work Handoff - CryptoPanel

## Current Status
- Last Updated: 2025-10-28 - ChatGPT
- Session Focus: Project scaffolding, shared config, and testing tooling
- Status: Next.js CSR skeleton, config helpers, rate limiting stub, and testing configs added

## Immediate Context
ChatGPT provisioned the Next.js App Router scaffold (CSR only), Tailwind setup, and feature-first directory structure. Shared configuration modules, Supabase client factories, logger, and in-memory rate limiter were added following the documented architecture. Supabase migration `20251028_init_profiles.sql` matches the schema doc. Vitest, Testing Library, and Playwright configs are in place per `docs/TESTING_STRATEGY.md`.

## Active Files
- `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `.eslintrc.js`
- `src/app/**/*` scaffolded routes and providers
- `src/config/**/*`, `src/lib/supabase-*.ts`, `src/features/infra/*`
- `supabase/migrations/20251028_init_profiles.sql`
- Testing configs: `vitest.config.ts`, `playwright.config.ts`, `tests/setup/vitest.setup.ts`

## Current Versions
- package.json: 0.1.0

## Top Priorities
1. Implement `/api/prices` route handler with validation, CoinGecko call, cache headers, and rate limiting.
2. Build React Query hooks (`usePrices`, `useHistory`, `useUserSettings`) and supporting services.
3. Flesh out settings persistence (Supabase profiles read/write) and Google auth flow.
4. Construct dashboard UI (spot cards, history chart, refresh controls) leveraging feature modules.

## Do Not Touch
- Core documentation structure (maintain LLM-DocKit workflow)
- Architectural principles (CSR only, feature-first organization)

## Open Questions
- Exact Vercel deployment region (EU-West specific country?)
- Initial admin user creation process (manual DB insert?)
- CoinGecko rate limit handling: implement backoff from day 1 or wait for 429 errors?
- Node runtime upgrade plan (local dev currently on v19.6.0; tooling targets >=20.10.0)

## Testing Notes
- No feature tests implemented yet; configs and directories ready.
- Testing strategy documented in `docs/TESTING_STRATEGY.md`.
- Minimum coverage: 70% overall, 100% for utilities and validation.
