/**
 * @fileoverview Default configuration values for CryptoPanel.
 * - Keeps hard-coded MVP defaults centralised for reuse.
 * - Aligns with documentation in docs/API_CONTRACTS.md and docs/PROJECT_CONTEXT.md.
 */
export const DEFAULT_BASE_CURRENCY = 'USD';
export const DEFAULT_TIMEZONE = 'Europe/Madrid';

export const RATE_LIMIT_REQUESTS_PER_MINUTE = 60;
export const CACHE_S_MAX_AGE_SECONDS = 60;
export const CACHE_STALE_WHILE_REVALIDATE_SECONDS = 120;

export const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
export const HEALTH_ENVIRONMENT = 'prod';
