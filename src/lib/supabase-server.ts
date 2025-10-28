/**
 * @fileoverview Supabase server client factory for CryptoPanel.
 * - Provides a typed client for route handlers and server utilities.
 * - Uses the public anon key until a service role is introduced.
 */
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

import { getRuntimeConfig } from '@/config';

export const createSupabaseServerClient = (): SupabaseClient => {
  const config = getRuntimeConfig();
  return createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
      persistSession: false
    }
  });
};
