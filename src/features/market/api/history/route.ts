/**
 * @fileoverview `/api/history` handler for CryptoPanel.
 * - Validates symbol, range, and base currency query parameters.
 * - Applies rate limiting and cache headers.
 * - Fetches historical data from CoinGecko and normalises to `{ symbol, vs, range, series }`.
 */
import { NextRequest } from 'next/server';

import { getRuntimeConfig } from '@/config';
import { createErrorBody, respondWithError } from '@/features/infra/errors';
import { log } from '@/features/infra/logger';
import { consumeRateLimit, toRateLimitHeaders } from '@/features/infra/rate-limit';

import {
  historyRangeSchema,
  parseSymbols,
  parseVsCurrency,
  SYMBOL_ID_MAP,
  type HistoryRange,
  type SupportedSymbol
} from '../shared';

const MAX_QUERY_STRING_LENGTH = 1024;
const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

type CoinGeckoHistoryResponse = {
  prices: Array<[number, number]>;
};

const DAYS_BY_RANGE: Record<HistoryRange, string> = {
  '24h': '1',
  '7d': '7',
  '30d': '30'
};

const INTERVAL_BY_RANGE: Partial<Record<HistoryRange, string>> = {
  '24h': 'hourly'
};

const pickPrimarySymbol = (symbols: SupportedSymbol[]) => symbols[0];

export const GET = async (request: NextRequest) => {
  if (request.url.length > MAX_QUERY_STRING_LENGTH) {
    return respondWithError(
      400,
      createErrorBody({
        error: 'Invalid query string length',
        message: 'Query parameters must not exceed 1024 characters',
        code: 'INVALID_INPUT'
      }),
      DEFAULT_HEADERS
    );
  }

  const runtime = getRuntimeConfig();
  const ip = request.headers.get('x-forwarded-for') ?? request.ip ?? 'unknown';
  const rateLimit = consumeRateLimit(`history:${ip}`);

  if (!rateLimit.allowed) {
    return respondWithError(
      429,
      createErrorBody({
        error: 'Rate limit exceeded',
        message: 'Maximum 60 requests per minute per IP',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: rateLimit.retryAfterSeconds
      }),
      {
        ...DEFAULT_HEADERS,
        ...toRateLimitHeaders({
          limit: runtime.rateLimitRequestsPerMinute,
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt
        })
      }
    );
  }

  let symbol: SupportedSymbol;
  let vs: string;
  let range: HistoryRange;

  try {
    const searchParams = request.nextUrl.searchParams;
    const symbolParam = searchParams.get('symbol');
    if (!symbolParam) {
      throw new Error('Symbol parameter is required');
    }
    const symbols = parseSymbols(symbolParam);
    if (symbols.length !== 1) {
      throw new Error('Provide exactly one symbol for history queries');
    }
    symbol = pickPrimarySymbol(symbols);
    vs = parseVsCurrency(searchParams.get('vs') ?? undefined);
    range = historyRangeSchema.parse(searchParams.get('range') ?? '24h');
  } catch (error) {
    log({
      level: 'warn',
      timestamp: new Date().toISOString(),
      requestId: request.headers.get('x-request-id') ?? undefined,
      endpoint: '/api/history',
      message: 'Invalid input for /api/history',
      error: {
        message: error instanceof Error ? error.message : 'Unknown validation error',
        code: 'INVALID_INPUT'
      },
      context: {
        query: request.nextUrl.search
      }
    });

    return respondWithError(
      400,
      createErrorBody({
        error: 'Invalid input',
        message:
          error instanceof Error ? error.message : 'Check symbol, base currency, and range',
        code: 'INVALID_INPUT'
      }),
      DEFAULT_HEADERS
    );
  }

  const coinId = SYMBOL_ID_MAP[symbol];
  const url = new URL(`${runtime.coinGeckoBaseUrl}/coins/${coinId}/market_chart`);
  url.searchParams.set('vs_currency', vs);
  url.searchParams.set('days', DAYS_BY_RANGE[range]);
  if (INTERVAL_BY_RANGE[range]) {
    url.searchParams.set('interval', INTERVAL_BY_RANGE[range]!);
  }

  let providerResponse: Response;
  try {
    providerResponse = await fetch(url.toString(), {
      headers: { Accept: 'application/json' },
      cache: 'no-store'
    });
  } catch (error) {
    log({
      level: 'error',
      timestamp: new Date().toISOString(),
      requestId: request.headers.get('x-request-id') ?? undefined,
      endpoint: '/api/history',
      message: 'Failed to call CoinGecko',
      statusCode: 502,
      error: {
        message: error instanceof Error ? error.message : 'Unknown fetch error',
        code: 'PROVIDER_ERROR'
      },
      context: {
        url: url.toString()
      }
    });

    return respondWithError(
      502,
      createErrorBody({
        error: 'Provider unavailable',
        message: 'Upstream data provider temporarily unavailable',
        code: 'PROVIDER_ERROR'
      }),
      DEFAULT_HEADERS
    );
  }

  if (!providerResponse.ok) {
    const body = await providerResponse.text();

    log({
      level: 'error',
      timestamp: new Date().toISOString(),
      requestId: request.headers.get('x-request-id') ?? undefined,
      endpoint: '/api/history',
      message: `CoinGecko responded with ${providerResponse.status}`,
      statusCode: providerResponse.status,
      error: {
        message: body,
        code: 'PROVIDER_ERROR'
      },
      context: {
        url: url.toString()
      }
    });

    return respondWithError(
      502,
      createErrorBody({
        error: 'Provider unavailable',
        message: 'Upstream data provider temporarily unavailable',
        code: 'PROVIDER_ERROR'
      }),
      DEFAULT_HEADERS
    );
  }

  const json = (await providerResponse.json()) as CoinGeckoHistoryResponse;
  if (!Array.isArray(json.prices)) {
    return respondWithError(
      502,
      createErrorBody({
        error: 'Provider unavailable',
        message: 'Provider response missing price series',
        code: 'PROVIDER_ERROR'
      }),
      DEFAULT_HEADERS
    );
  }

  const series = json.prices
    .map(([timestamp, price]) => ({
      t: Math.trunc(timestamp),
      p: Number(price)
    }))
    .filter((point) => Number.isFinite(point.t) && Number.isFinite(point.p))
    .sort((a, b) => a.t - b.t);

  const responseHeaders = {
    ...DEFAULT_HEADERS,
    'Cache-Control': `public, s-maxage=${runtime.cache.sMaxAgeSeconds}, stale-while-revalidate=${runtime.cache.staleWhileRevalidateSeconds}`,
    ...toRateLimitHeaders({
      limit: runtime.rateLimitRequestsPerMinute,
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt
    })
  };

  const responseBody = {
    symbol,
    vs,
    range,
    series
  };

  return new Response(JSON.stringify(responseBody), {
    status: 200,
    headers: responseHeaders
  });
};
