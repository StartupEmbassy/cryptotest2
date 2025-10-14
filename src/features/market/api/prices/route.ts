/**
 * @fileoverview `/api/prices` handler for CryptoPanel.
 * - Validates incoming query parameters.
 * - Applies rate limiting and cache headers.
 * - Fetches spot prices from CoinGecko and normalises the response.
 */
import { NextRequest } from 'next/server';

import { getRuntimeConfig } from '@/config';
import { createErrorBody, respondWithError } from '@/features/infra/errors';
import { log } from '@/features/infra/logger';
import { consumeRateLimit, toRateLimitHeaders } from '@/features/infra/rate-limit';

import { parseSymbols, parseVsCurrency, SYMBOL_ID_MAP, type SupportedSymbol } from '../shared';

const MAX_QUERY_STRING_LENGTH = 1024;
const DEFAULT_HEADERS = { 'Content-Type': 'application/json' };

type CoinGeckoPriceResponse = Record<
  string,
  {
    [currency: string]: number;
    last_updated_at?: number;
    [`${string}_24h_change`]?: number;
  }
>;

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

  const ip = request.headers.get('x-forwarded-for') ?? request.ip ?? 'unknown';
  const runtime = getRuntimeConfig();
  const rateLimit = consumeRateLimit(`prices:${ip}`);
  const { rateLimitRequestsPerMinute, cache } = runtime;

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
          limit: rateLimitRequestsPerMinute,
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt
        })
      }
    );
  }

  let symbols: SupportedSymbol[];
  let vs: string;

  try {
    const searchParams = request.nextUrl.searchParams;
    symbols = parseSymbols(searchParams.get('symbols') ?? undefined);
    vs = parseVsCurrency(searchParams.get('vs') ?? undefined);
  } catch (error) {
    log({
      level: 'warn',
      timestamp: new Date().toISOString(),
      requestId: request.headers.get('x-request-id') ?? undefined,
      endpoint: '/api/prices',
      message: 'Invalid input for /api/prices',
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
          error instanceof Error ? error.message : 'Check symbols and base currency parameters',
        code: 'INVALID_INPUT'
      }),
      DEFAULT_HEADERS
    );
  }

  const coinIds = symbols.map((symbol) => SYMBOL_ID_MAP[symbol]);

  const url = new URL(`${runtime.coinGeckoBaseUrl}/simple/price`);
  url.searchParams.set('ids', coinIds.join(','));
  url.searchParams.set('vs_currencies', vs);
  url.searchParams.set('include_last_updated_at', 'true');
  url.searchParams.set('include_24hr_change', 'true');

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
      endpoint: '/api/prices',
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
      endpoint: '/api/prices',
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

  const json = (await providerResponse.json()) as CoinGeckoPriceResponse;
  const now = Date.now();

  const payload: Record<
    string,
    {
      price: number;
      ts: number;
    }
  > = {};

  for (const symbol of symbols) {
    const id = SYMBOL_ID_MAP[symbol];
    const fromProvider = json[id];

    if (!fromProvider || typeof fromProvider[vs] !== 'number') {
      return respondWithError(
        502,
        createErrorBody({
          error: 'Provider unavailable',
          message: `Missing data for symbol ${symbol}`,
          code: 'PROVIDER_ERROR'
        }),
        DEFAULT_HEADERS
      );
    }

    const lastUpdatedAtSeconds = fromProvider.last_updated_at ?? Math.floor(now / 1000);
    payload[symbol] = {
      price: fromProvider[vs],
      ts: lastUpdatedAtSeconds * 1000
    };
  }

  const responseHeaders = {
    ...DEFAULT_HEADERS,
    'Cache-Control': `public, s-maxage=${cache.sMaxAgeSeconds}, stale-while-revalidate=${cache.staleWhileRevalidateSeconds}`,
    ...toRateLimitHeaders({
      limit: rateLimitRequestsPerMinute,
      remaining: rateLimit.remaining,
      resetAt: rateLimit.resetAt
    })
  };

  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: responseHeaders
  });
};
