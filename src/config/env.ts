/**
 * @fileoverview Environment parsing utilities for CryptoPanel.
 * - Validates required environment variables using Zod.
 * - Exposes typed runtime configuration with sensible defaults.
 */
import { z } from 'zod';

import {
  CACHE_S_MAX_AGE_SECONDS,
  CACHE_STALE_WHILE_REVALIDATE_SECONDS,
  COINGECKO_BASE_URL,
  RATE_LIMIT_REQUESTS_PER_MINUTE
} from './defaults';

const numericString = z
  .string()
  .regex(/^\d+$/)
  .transform((value) => Number.parseInt(value, 10));

const clientSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  NEXT_PUBLIC_RUNTIME_ENV: z.enum(['dev', 'preview', 'prod']).default('dev')
});

const serverSchema = z.object({
  COINGECKO_BASE_URL: z.string().url().default(COINGECKO_BASE_URL),
  RATE_LIMIT_REQUESTS_PER_MINUTE: numericString.optional(),
  CACHE_S_MAX_AGE_SECONDS: numericString.optional(),
  CACHE_STALE_WHILE_REVALIDATE_SECONDS: numericString.optional()
});

type RuntimeConfig = Readonly<{
  supabaseUrl: string;
  supabaseAnonKey: string;
  runtimeEnv: 'dev' | 'preview' | 'prod';
  coinGeckoBaseUrl: string;
  rateLimitRequestsPerMinute: number;
  cache: {
    sMaxAgeSeconds: number;
    staleWhileRevalidateSeconds: number;
  };
}>;

let cachedConfig: RuntimeConfig | null = null;

export const getRuntimeConfig = (): RuntimeConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const clientEnv = clientSchema.safeParse(process.env);
  if (!clientEnv.success) {
    throw new Error(`Invalid client environment: ${clientEnv.error.message}`);
  }

  const serverEnv = serverSchema.safeParse(process.env);
  if (!serverEnv.success) {
    throw new Error(`Invalid server environment: ${serverEnv.error.message}`);
  }

  cachedConfig = {
    supabaseUrl: clientEnv.data.NEXT_PUBLIC_SUPABASE_URL,
    supabaseAnonKey: clientEnv.data.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    runtimeEnv: clientEnv.data.NEXT_PUBLIC_RUNTIME_ENV,
    coinGeckoBaseUrl: serverEnv.data.COINGECKO_BASE_URL,
    rateLimitRequestsPerMinute:
      serverEnv.data.RATE_LIMIT_REQUESTS_PER_MINUTE ?? RATE_LIMIT_REQUESTS_PER_MINUTE,
    cache: {
      sMaxAgeSeconds: serverEnv.data.CACHE_S_MAX_AGE_SECONDS ?? CACHE_S_MAX_AGE_SECONDS,
      staleWhileRevalidateSeconds:
        serverEnv.data.CACHE_STALE_WHILE_REVALIDATE_SECONDS ?? CACHE_STALE_WHILE_REVALIDATE_SECONDS
    }
  };

  return cachedConfig;
};
