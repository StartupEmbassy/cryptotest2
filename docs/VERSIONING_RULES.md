# Versioning Rules - CryptoPanel

## Version format
We follow **Semantic Versioning (SemVer)**: `MAJOR.MINOR.PATCH`.

## Where versions live
| Artifact | Location | Notes |
|----------|----------|-------|
| Web app | `package.json > version` | Mirror in any runtime config if required |
| Supabase schema | `supabase/migrations/` timestamped folders | Each migration must be idempotent |
| API contracts | `src/features/*/api/*.ts` exported `API_VERSION` constants (when introduced) | Used for compatibility checks |

Initial baseline: **0.1.0** (pre-MVP).

## When to bump
### Patch (`x.y.Z`)
- Bug fixes, documentation updates, logging tweaks
- Non breaking refactors or dependency patch bumps

### Minor (`x.Y.z`)
- Backward compatible features (extra chart ranges, admin widgets)
- Optional configuration flags with safe defaults
- Dependency upgrades that add capabilities without breaking behaviour

### Major (`X.y.z`)
- Breaking API changes or UI flows
- Schema migrations requiring operator action
- Removal or renaming of public routes or endpoints

## Synchronisation rules
- Update `package.json`, mirrored constants, and docs references in the same commit.
- Document migration impacts in `docs/llm/HISTORY.md` and point to the migration folder.
- If API contracts change, update types, tests, and note the version in `docs/llm/HANDOFF.md > Current Versions`.

## Update checklist
1. Decide the bump level (patch, minor, major).
2. Update `package.json` and any mirrored constants.
3. Annotate migrations with comments about required follow up.
4. Run linting and tests; confirm compatibility.
5. Record the change in HISTORY and refresh the snapshot in HANDOFF.

## Environment variables
- Do not commit real secrets.
- Add new variables to `.env.example` with comments.
- Document configuration changes in README and `docs/llm/HISTORY.md`.

## Tips
- When uncertain, pick the higher impact bump.
- Group related version edits together to avoid drift.
- Align Vercel deployments with tagged versions for easier rollback.
