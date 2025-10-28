# Database Schema - CryptoPanel

Complete Supabase PostgreSQL schema definition with Row Level Security policies.

---

## Overview

**Database:** Supabase PostgreSQL (EU-West region)  
**Schema version:** 0.1.0 (initial)  
**Public tables:** `profiles`  
**Authentication:** Supabase Auth with Google OAuth

---

## Table: `public.profiles`

Stores user preferences and roles. Automatically populated via trigger when a user signs up.

### Column definitions
| Column | Type | Nullable | Default | Constraints | Description |
|--------|------|----------|---------|-------------|-------------|
| `id` | `uuid` | NOT NULL | - | PRIMARY KEY, FOREIGN KEY `auth.users(id)` | User identifier, matches Supabase Auth user. |
| `email` | `text` | NOT NULL | - | UNIQUE | User email from Google OAuth. |
| `role` | `text` | NOT NULL | `'user'` | CHECK IN (`'user'`, `'admin'`) | User role for authorization. |
| `base_currency` | `text` | NOT NULL | `'USD'` | - | Preferred display currency (ISO 4217). |
| `tz` | `text` | NOT NULL | `'Europe/Madrid'` | - | Timezone (IANA format). |
| `created_at` | `timestamptz` | NOT NULL | `now()` | - | Account creation timestamp. |

### Indexes
```sql
CREATE UNIQUE INDEX profiles_email_idx ON public.profiles(email);
CREATE INDEX profiles_role_idx ON public.profiles(role); -- For admin queries
```

### SQL migration (idempotent)
File: `supabase/migrations/20251028_init_profiles.sql`
```sql
-- Create profiles table if not exists
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  base_currency text NOT NULL DEFAULT 'USD',
  tz text NOT NULL DEFAULT 'Europe/Madrid',
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes if not exists
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY IF NOT EXISTS "Users can view own profile"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY IF NOT EXISTS "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy: Admins can read all profiles
CREATE POLICY IF NOT EXISTS "Admins can view all profiles"
  ON public.profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Trigger function: Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, base_currency, tz)
  VALUES (
    NEW.id,
    NEW.email,
    'user', -- Default role
    'USD',  -- Default currency
    'Europe/Madrid' -- Default timezone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Call function on new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, UPDATE ON public.profiles TO authenticated;
```

### Row Level Security (RLS) policies
- **Policy 1:** Users can view own profile  
  - Operation: `SELECT`  
  - Rule: `auth.uid() = profiles.id`  
  - Effect: Users can only see their own row.
- **Policy 2:** Users can update own profile  
  - Operation: `UPDATE`  
  - Rule: `auth.uid() = profiles.id`  
  - Effect: Users can only modify their `base_currency` and `tz` fields. Role changes remain application controlled.
- **Policy 3:** Admins can view all profiles  
  - Operation: `SELECT`  
  - Rule: current user has `role = 'admin'` in their own profile  
  - Effect: Admin users can query all profiles for the admin dashboard.

**Security considerations:**
- Users cannot insert rows directly (trigger handles creation).
- Users cannot delete their own profile (no DELETE policy).
- Users cannot change their own role (application validation required).
- Admins cannot update other users' profiles (no admin UPDATE policy).

### Data validation
Application-level validation (in addition to database constraints):
- Email: must match Google OAuth email (enforced by trigger).
- Role: only admins can be promoted via manual database update.
- Base currency: validate against supported CoinGecko currencies (`usd`, `eur`, `gbp`, etc.).
- Timezone: validate using `Intl.supportedValuesOf('timeZone')` in Node.js.

**Zod schema example (API validation):**
```typescript
import { z } from 'zod';

export const UpdateProfileSchema = z.object({
  base_currency: z
    .string()
    .regex(/^[A-Z]{3}$/, 'Invalid currency code'),
  tz: z.string().min(1).max(50)
});
```

### Seeding test data (development only)
> Do **not** run in production.
```sql
-- Create test users (after authentication)
INSERT INTO public.profiles (id, email, role, base_currency, tz) VALUES
  ('00000000-0000-0000-0000-000000000001', 'user@example.com', 'user', 'USD', 'Europe/Madrid'),
  ('00000000-0000-0000-0000-000000000002', 'admin@example.com', 'admin', 'EUR', 'Europe/London')
ON CONFLICT (id) DO NOTHING;
```

### Migration rollback
To rollback this migration:
```sql
-- Drop trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Drop policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Drop table (WARNING: deletes all data)
DROP TABLE IF EXISTS public.profiles CASCADE;
```
> Note: only rollback in development. Production rollbacks require data migration planning.

### Backup and recovery
- **Supabase automated backups:** enable daily backups in the Supabase dashboard with at least 7-day retention (30 days recommended for production).
- **Manual backup command:**
  ```bash
  supabase db dump -f backup_$(date +%Y%m%d).sql
  ```
- **Restore command:**
  ```bash
  psql $DATABASE_URL < backup_20251028.sql
  ```

### Future schema changes
Planned additions (not in MVP):
- `profiles.notification_preferences` (`jsonb`) for alert settings.
- `profiles.watchlist` (`text`) for custom symbol lists.
- `market_data` table for persistent historical data (with TimescaleDB extension).

**Migration versioning:**
- Use timestamped migration files (`YYYYMMDD_description.sql`).
- Keep migrations idempotent with `IF NOT EXISTS` clauses.
- Document version impact in `docs/llm/HISTORY.md`.
