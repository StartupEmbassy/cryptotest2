/**
 * @fileoverview Error helpers for CryptoPanel API handlers.
 * - Normalises error payloads and HTTP status codes.
 * - Keeps response shapes aligned with docs/API_CONTRACTS.md.
 */
type ErrorCode = 'INVALID_INPUT' | 'RATE_LIMIT_EXCEEDED' | 'PROVIDER_ERROR' | 'INTERNAL_ERROR';

type ErrorBody = Readonly<{
  error: string;
  message: string;
  code: ErrorCode;
  retryAfter?: number;
}>;

export const createErrorBody = (body: ErrorBody) => body;

export const respondWithError = (
  status: number,
  body: ErrorBody,
  headers?: HeadersInit
): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  });
