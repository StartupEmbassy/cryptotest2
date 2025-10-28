# Operations Runbooks - CryptoPanel

Use this directory to store procedures for deploying and operating CryptoPanel. Each runbook should be self contained and reference automation or scripts when available.

## Suggested runbook outline
1. Purpose and scope
2. Prerequisites and required access (Vercel, Supabase, etc.)
3. Step by step procedure (idempotent where possible)
4. Validation and rollback steps
5. Contacts or escalation path

## High priority runbooks to create
- Production deployment on Vercel (including rollback to a previous build).
- Applying Supabase migrations (`supabase db push`) and verifying RLS policies.
- Handling CoinGecko rate limits or downtime (backoff strategy, stale data policy).
- Rotating Supabase anon key or Google OAuth credentials.

Document each procedure as soon as the supporting automation or tooling exists.
