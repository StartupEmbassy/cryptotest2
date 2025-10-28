/**
 * @fileoverview Supabase browser client factory for CryptoPanel.
 * - Lazily initialises the browser client using public keys.
 * - Keeps creation logic centralised for hooks to use.
 */
'use client';

import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs';
import type { SupabaseClient } from '@supabase/supabase-js';

import { getRuntimeConfig } from '@/config';

let browserClient: SupabaseClient | null = null;

export const getSupabaseBrowserClient = () => {
  if (browserClient) {
    return browserClient;
  }

  const config = getRuntimeConfig();
  browserClient = createBrowserSupabaseClient({
    supabaseUrl: config.supabaseUrl,
    supabaseKey: config.supabaseAnonKey
  });

  return browserClient;
};
