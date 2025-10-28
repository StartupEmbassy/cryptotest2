# LLM Start Guide - CryptoPanel

Welcome to **CryptoPanel**, a crypto price dashboard project. Read this document from top to bottom before touching any code or docs and keep it open while you work.

## Reading Order
1. This file (rules and expectations)
2. `docs/PROJECT_CONTEXT.md` (vision, architecture, status)
3. `docs/STRUCTURE.md` (repository layout)
4. `docs/VERSIONING_RULES.md` (version policy)
5. `docs/llm/HANDOFF.md` (current focus)

## Critical Rules (non negotiable)

### Language policy
- Code, documentation, and comments: English
- Conversation with the user: Spanish
- File names and commits: English

### Architectural guardrails
- Framework must be Next.js App Router in **CSR** mode. No SSR/SSG.
- Organise code by feature folders (`auth`, `market`, `settings`, `admin`, `infra`).
- Keep files under ~100 lines when practical; factor if they grow.
- Separate concerns: UI components / hooks / services / API handlers / utilities.
- Validate every API input and return controlled errors (400, 429, 500, 502).
- Use React Query for polling (60 seconds) and caching; do not introduce other global state managers.

### Documentation duties
- Update `docs/llm/HANDOFF.md` at the end of every session.
- Append a log entry to `docs/llm/HISTORY.md` using  
  `YYYY-MM-DD - <LLM_NAME> - <Summary> - Files: [list] - Version impact: <yes/no + detail>`

### Commit format
End any response that changes code or docs with:
```
## Commit Info
**Title:** <up to 72 chars>
**Description:** <up to 200 chars explaining what and why>
```

### Versioning
- Review `docs/VERSIONING_RULES.md` before touching versions.
- Keep related version numbers in sync (package.json, migrations, constants).

### Testing expectations
- Contract tests for `/api/prices` and `/api/history` (input validation, shape).
- Utility tests for currency and timezone formatting.
- Access tests proving protected routes redirect to `/login` without a session.

### Environment
- Never commit real secrets.
- Document new environment variables in README and `.env.example`.
- Deployment and script steps must be idempotent.

## Current snapshot
- Last Updated: 2025-10-28 - ChatGPT
- Working on: Documentation baseline for CryptoPanel MVP
- Status: Architecture and contracts captured; implementation not started

Keep this block in sync with `docs/llm/HANDOFF.md`.

## Session checklist
- [ ] Read this file end to end
- [ ] Review `docs/PROJECT_CONTEXT.md`
- [ ] Review `docs/STRUCTURE.md`
- [ ] Review `docs/VERSIONING_RULES.md`
- [ ] Read `docs/llm/HANDOFF.md`
- [ ] Confirm scope with the user
- [ ] Do the work
- [ ] Update HANDOFF and HISTORY

## Feature map
| Feature | Responsibility | Key constraints |
|---------|----------------|-----------------|
| auth | Supabase session, Google login, route guards | Use Supabase JS helpers, handle loading states |
| market | Spot and history data | Consume `/api/prices` and `/api/history`, adapt to UI |
| settings | User preferences (currency, timezone) | Read/write `profiles` with RLS |
| admin | Admin only announcement/banner | Do not expose sensitive user data |
| infra | Rate limiting, config, health check, utilities | Centralise constants and logging |

## API quick reference
- `GET /api/prices?symbols=btc,eth&vs=usd` -> `{ btc: { price, ts }, ... }`
- `GET /api/history?symbol=btc&vs=usd&range=24h|7d|30d` -> `[ { t, p }, ... ]`
- Rate limit: 60 requests per minute per IP. Cache headers: `s-maxage=60`, `stale-while-revalidate=120`.
- `GET /healthz` -> `{ status: "ok", version, time, env }`

## Data model
Supabase `profiles` table:  
`id uuid PK`, `email text unique`, `role text user|admin default user`, `base_currency text default USD`, `tz text default Europe/Madrid`, `created_at timestamptz default now()`.  
RLS: users can access only their row; admins can select all rows.

## Handoff process
1. Finish your task.
2. Update `docs/llm/HANDOFF.md` with status and next steps.
3. Add the HISTORY entry.
4. Ensure this snapshot matches the HANDOFF file.

## Do not touch
- Respect any items listed in `docs/llm/HANDOFF.md > Do Not Touch`.

## Questions
If you hit ambiguity, stop and ask the user before implementing.
