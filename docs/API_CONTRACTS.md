# API Contracts - CryptoPanel

Complete specification of internal API endpoints with request/response examples and error handling.

## GET /api/prices

**Purpose:** Fetch current spot prices for specified cryptocurrency symbols.

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `symbols` | string | No | `btc,eth` | Comma-separated list of symbols (for example `btc,eth,ltc`). |
| `vs` | string | No | `usd` | Base currency for prices (for example `usd`, `eur`, `gbp`). |

### Request Example
```bash
curl "https://cryptopanel.vercel.app/api/prices?symbols=btc,eth&vs=usd"
```

### Response (200 OK)
```json
{
  "btc": {
    "price": 45230.5,
    "ts": 1699876543210
  },
  "eth": {
    "price": 2345.75,
    "ts": 1699876543210
  }
}
```

### Response Headers
- `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`
- `Content-Type: application/json`
- Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)

### Error Responses
- **400 Bad Request - Invalid input**
  ```json
  {
    "error": "Invalid symbols parameter",
    "message": "Symbols must be comma-separated alphanumeric strings",
    "code": "INVALID_INPUT"
  }
  ```
- **429 Too Many Requests - Rate limit exceeded**
  ```json
  {
    "error": "Rate limit exceeded",
    "message": "Maximum 60 requests per minute per IP",
    "retryAfter": 42,
    "code": "RATE_LIMIT_EXCEEDED"
  }
  ```
- **502 Bad Gateway - CoinGecko provider error**
  ```json
  {
    "error": "Provider unavailable",
    "message": "Upstream data provider temporarily unavailable",
    "code": "PROVIDER_ERROR"
  }
  ```
- **500 Internal Server Error - Unexpected error**
  ```json
  {
    "error": "Internal server error",
    "message": "An unexpected error occurred",
    "code": "INTERNAL_ERROR"
  }
  ```

### Rate Limiting
- Limit: 60 requests per minute per IP address.
- Implementation: In-memory counter (note: not shared across serverless instances).
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

## GET /api/history

**Purpose:** Fetch historical price data for a single cryptocurrency symbol over a specified time range.

### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `symbol` | string | Yes | - | Cryptocurrency symbol (for example `btc`, `eth`). |
| `vs` | string | No | `usd` | Base currency. |
| `range` | string | No | `24h` | Time range: `24h`, `7d`, or `30d`. |

### Request Example
```bash
curl "https://cryptopanel.vercel.app/api/history?symbol=btc&vs=usd&range=7d"
```

### Response (200 OK)
```json
{
  "symbol": "btc",
  "vs": "usd",
  "range": "7d",
  "series": [
    { "t": 1699790143000, "p": 44850.25 },
    { "t": 1699793743000, "p": 44920.5 },
    { "t": 1699797343000, "p": 45100.75 }
  ]
}
```
*Field notes:* The response includes the requested metadata and a chronological `series` array of `{ "t": <epoch_ms>, "p": <number> }` pairs expressed in the requested base currency.

### Response Headers
- `Cache-Control: public, s-maxage=60, stale-while-revalidate=120`
- `Content-Type: application/json`
- Rate limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`)

### Error Responses
Same structure as `/api/prices` with endpoint-specific messages:
- **400 Bad Request - Invalid symbol or range**
- **429 Too Many Requests - Rate limit exceeded**
- **502 Bad Gateway - CoinGecko provider error**
- **500 Internal Server Error - Unexpected error**

### Rate Limiting
- Same limit and headers as `/api/prices` (60 requests per minute per IP).

## GET /healthz

**Purpose:** Health check endpoint for monitoring and load balancers.

### Request Example
```bash
curl "https://cryptopanel.vercel.app/healthz"
```

### Response (200 OK)
```json
{
  "status": "ok",
  "version": "0.1.0",
  "time": "2025-10-28T10:30:45.123Z",
  "env": "prod"
}
```

### Response Headers
- `Cache-Control: no-cache`
- `Content-Type: application/json`

### Error Response (503 Service Unavailable)
```json
{
  "status": "degraded",
  "version": "0.1.0",
  "time": "2025-10-28T10:30:45.123Z",
  "env": "prod",
  "issues": "Database connection timeout"
}
```

## Validation Rules
- Symbols: alphanumeric, lowercase, 3-10 characters.
- Currency codes: ISO 4217 codes (`usd`, `eur`, `gbp`, etc.).
- Range values: exact match of `24h`, `7d`, or `30d`.
- Query string length: maximum 1024 characters total.
- Validation library: use Zod schemas for all API handlers.

## Cache Strategy
- **Client-side (React Query):** `staleTime = 60000 ms`, `gcTime = 300000 ms`, `refetchInterval = 60000 ms`.
- **Server-side (HTTP headers):** `s-maxage=60`, `stale-while-revalidate=120`.
- **Rationale:** balance freshness with reduced CoinGecko API calls.

## Error Handling Standards
- Return consistent error objects with `error`, `message`, and `code` fields.
- Log errors using structured JSON that includes the request ID.
- Never expose internal stack traces or sensitive data.
- Use appropriate HTTP status codes (400, 429, 500, 502).
- Include `retryAfter` in 429 responses when possible.

### Example error log entry
```json
{
  "level": "error",
  "timestamp": "2025-10-28T10:30:45.123Z",
  "requestId": "req_abc123",
  "endpoint": "/api/prices",
  "error": "CoinGecko API timeout",
  "statusCode": 502,
  "duration": 5234
}
```
