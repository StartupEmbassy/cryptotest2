# How to Use Panel Docs

This repository stores the documentation and operating model for **Panel**, a cryptocurrency price dashboard built with Next.js and Supabase. No application code lives here yet; the goal is to guide humans and LLMs through a consistent implementation of the MVP.

## Quick Orientation
- **Vision and scope** -> `docs/PROJECT_CONTEXT.md`
- **Architecture and structure** -> `docs/STRUCTURE.md`
- **Version and release rules** -> `docs/VERSIONING_RULES.md`
- **Current status** -> `docs/llm/HANDOFF.md`
- **Change history** -> `docs/llm/HISTORY.md`

Always share `LLM_START_HERE.md` with any LLM agent before work starts.

## Suggested implementation flow

1. **Prepare the environment**
   - Node.js 20 or later, pnpm recommended.
   - Supabase project in EU-West with Google OAuth configured.
   - Local `.env` containing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, rate limit and cache parameters.

2. **Bootstrap the Next.js project**
   ```bash
   pnpm create next-app panel --ts --eslint --no-src-dir --app
   cd panel
   pnpm add @supabase/auth-helpers-nextjs @supabase/supabase-js @tanstack/react-query tailwindcss postcss autoprefixer recharts class-variance-authority tailwind-merge @radix-ui/react-slot zod
   pnpm dlx shadcn-ui@latest init
   ```
   - Configure Tailwind and shadcn/ui as documented.
   - Enable strict TypeScript mode.

3. **Lay out the feature folders**
   ```
   src/
     app/               # Next.js routes and layouts
     config/            # Defaults, env readers
     features/
       auth/
       market/
       settings/
       admin/
       infra/
     lib/               # Shared helpers
     types/             # Shared contracts
   ```
   Each feature keeps `components/`, `hooks/`, `services/`, `api/`, `types/`. Aim for files under ~100 lines.

4. **Configuration and infra**
   - `src/config/defaults.ts`: currency/timezone defaults, rate limit, cache values.
   - `src/config/env.ts`: Zod based environment validation.
   - `src/infra/rate-limit.ts`: in-memory limiter (document limitations for serverless).
   - `src/infra/logger.ts`: simple tagged logger.

5. **Authentication and profiles**
   - Use `@supabase/auth-helpers-nextjs` to guard routes.
   - Middleware to enforce auth on `/`, `/settings`, `/admin`.
   - `/login` route with Google button and redirect.
   - Create Supabase migration for `profiles` table, enum roles, trigger for automatic insertion.

6. **Market data**
   - Build `/api/prices` and `/api/history` route handlers; validate queries with Zod.
   - Call CoinGecko, normalise responses, set cache headers, log provider errors.
   - Implement React Query hooks (`usePrices`, `useHistory`) with `refetchInterval` set to 60000 ms.

7. **Settings UI**
   - Form using shadcn/ui components for currency and timezone.
   - Update Supabase via RPC or direct table update.
   - Invalidate React Query caches after save.

8. **Admin surface**
   - Gate the `/admin` UI with role `admin`.
   - MVP content: banner or simple metrics snapshot.

9. **Testing**
   - Choose Vitest or Jest for unit/contract tests.
   - Mock CoinGecko responses for endpoint tests.
   - Cover formatting helpers and auth redirects (Playwright or Cypress for E2E).

10. **Observability**
    - Implement `/api/healthz` returning `{ status, version, time, env }`.
    - Log server errors and provider issues with structured messages.

11. **CI/CD**
    - GitHub Actions workflow running lint and tests.
    - Vercel deployment in EU region from `main`.
    - Supabase migrations applied via `supabase db push` (manual approval if needed).

## Working with LLMs
- Start every session by reading `docs/llm/HANDOFF.md`.
- End every session by updating HANDOFF and appending to HISTORY.
- Follow the guardrails in `LLM_START_HERE.md` for commits, testing, and architecture.

## FAQ
- **Can we use SSR?** No, the MVP requires CSR only.
- **Do we store historical data?** Not in the MVP; fetch on demand only.
- **How do we handle CoinGecko rate limits?** Implement backoff, expose clear messaging, allow short lived stale data.
- **Can we add features?** Propose them in `docs/llm/HANDOFF.md > Open Questions` and wait for approval.

## Recommended next steps
1. Author the initial Supabase migration (`profiles`, roles, RLS).
2. Scaffold the Next.js project with feature folders and shared config.
3. Implement `/api/prices` and `/api/history`.
4. Build the dashboard UI (spot cards + chart) with React Query and Recharts.
5. Add the settings form and persistence.
6. Create the admin section and health endpoint.

Log every decision and deviation so future contributors can follow the same path.
