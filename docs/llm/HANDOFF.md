# LLM Work Handoff - Panel

## Current Status
- Last Updated: 2025-10-28 - ChatGPT
- Session Focus: Align all documentation with the Panel MVP specification
- Status: Documentation updated; implementation work has not started

## Immediate Context
- Replaced README, LLM_START_HERE, HOW_TO_USE, and all files in `docs/`.
- Architecture defined around Next.js CSR, Supabase, and CoinGecko.
- API routes, contracts, and data model captured for future development.
- Wait for user confirmation before scaffolding code.

## Active Files
- README.md
- LLM_START_HERE.md
- HOW_TO_USE.md
- docs/PROJECT_CONTEXT.md
- docs/STRUCTURE.md
- docs/VERSIONING_RULES.md
- docs/llm/HANDOFF.md
- docs/llm/HISTORY.md
- docs/operations/README.md
- .github/PULL_REQUEST_TEMPLATE.md
- .github/ISSUE_TEMPLATE/bug_report.md

## Current Versions
- package.json: not created yet
- Supabase schema: initial migration pending

## Top Priorities
1. Write Supabase migration (profiles table, enum roles, RLS policies).
2. Scaffold the Next.js App Router project with feature folders and shared config.
3. Implement `/api/prices` and `/api/history` with validation and rate limiting.

## Do Not Touch
- Documentation just updated; coordinate before making structural changes.

## Open Questions
- Confirm the content for the admin section (banner vs user summary).
- Define supported currency list beyond the default USD.
- Decide whether to adopt an external rate limiting service for production later.

## Testing Notes
- No tests executed yet; codebase not scaffolded.
