# Monitoring and Observability - CryptoPanel

Comprehensive monitoring strategy for production operations.

---

## Overview

**Goals:**
1. Detect issues before users report them.
2. Maintain SLA: 99.5% uptime, P95 latency under 1s.
3. Track MVP validation metrics (TTFU, error rate, latency).

**Tools:**
- **Vercel Analytics:** built-in metrics and Web Vitals.
- **Vercel Logs:** structured server-side logging.
- **Supabase Dashboard:** database health and query performance.
- **Uptime monitoring:** optional services such as UptimeRobot or Checkly.

---

## Key Metrics

### 1. MVP Validation Metrics
| Metric | Target | How to Measure | Alert Threshold |
|--------|--------|----------------|-----------------|
| Time to First Update (TTFU) | < 2s | Vercel Analytics - Largest Contentful Paint | > 3s for P95 |
| API Latency (prices) | P95 < 600 ms | Vercel function logs | > 800 ms for P95 |
| API Latency (history) | P95 < 1200 ms | Vercel function logs | > 1500 ms for P95 |
| Error Rate (5xx) | < 1% | Vercel logs (count 500/502/503) | > 2% over 5 min |
| Polling Success Rate | > 99% | React Query client logs | < 95% over 15 min |

### 2. Application Health Metrics
| Metric | Description | Source |
|--------|-------------|--------|
| Uptime | Percentage of time `/healthz` returns 200 | External monitoring |
| Auth Success Rate | Supabase login success vs. failures | Supabase dashboard |
| CoinGecko Error Rate | 429/5xx responses from provider | Vercel logs (custom metric) |
| Database Query Time | P95 for `SELECT/UPDATE` on profiles | Supabase dashboard |

### 3. User Experience Metrics
| Metric | Description | Target |
|--------|-------------|--------|
| First Contentful Paint (FCP) | Time to first visual element | < 1.5s |
| Cumulative Layout Shift (CLS) | Visual stability score | < 0.1 |
| Time to Interactive (TTI) | Time until page is interactive | < 3s |

*Source:* Vercel Analytics (Web Vitals).

---

## Logging Strategy

### Server-side structured logging
- **Format:** JSON with a consistent schema.
- **Required fields:**
  ```typescript
  interface LogEntry {
    level: 'info' | 'warn' | 'error';
    timestamp: string; // ISO 8601
    requestId: string; // Vercel request ID
    endpoint: string;
    message: string;
    duration?: number; // milliseconds
    statusCode?: number;
    error?: {
      message: string;
      code: string;
      stack?: string; // Only in non-prod
    };
    context?: Record<string, unknown>;
  }
  ```

**Example success log:**
```json
{
  "level": "info",
  "timestamp": "2025-10-28T10:30:45.123Z",
  "requestId": "req_abc123",
  "endpoint": "/api/prices",
  "message": "Fetched prices successfully",
  "duration": 234,
  "statusCode": 200,
  "context": {
    "symbols": "btc,eth",
    "vs": "usd",
    "cached": false
  }
}
```

**Example error log:**
```json
{
  "level": "error",
  "timestamp": "2025-10-28T10:30:45.123Z",
  "requestId": "req_xyz789",
  "endpoint": "/api/history",
  "message": "CoinGecko API timeout",
  "duration": 5234,
  "statusCode": 502,
  "error": {
    "message": "Request timeout after 5000ms",
    "code": "PROVIDER_TIMEOUT"
  },
  "context": {
    "symbol": "btc",
    "range": "7d"
  }
}
```

**Implementation stub:**
```typescript
// src/features/infra/logger.ts
export function log(entry: LogEntry) {
  console.log(JSON.stringify(entry));
}
```

Logs automatically appear in the Vercel dashboard (Logs tab).

---

## Health Check Endpoint
- **Endpoint:** `GET /healthz`.
- **Healthy response:**
  ```json
  {
    "status": "ok",
    "version": "0.1.0",
    "time": "2025-10-28T10:30:45.123Z",
    "env": "prod"
  }
  ```
- **Degraded response:**
  ```json
  {
    "status": "degraded",
    "version": "0.1.0",
    "time": "2025-10-28T10:30:45.123Z",
    "env": "prod",
    "issues": [
      "Supabase connection latency > 1000ms",
      "CoinGecko error rate > 10%"
    ]
  }
  ```

**Monitoring setup:**
- Configure UptimeRobot (or similar) to ping `/healthz` every 5 minutes.
- Alert if three consecutive failures occur or if status returns "degraded".
- Notify on-call engineer via Slack or email.

---

## Alert Definitions

### Critical alerts (immediate response)
| Alert | Condition | Action |
|-------|-----------|--------|
| API down | `/healthz` returns non-200 for three consecutive checks | Check Vercel status, review logs, rollback if needed. |
| High error rate | > 5% of requests return 5xx over 5 min | Investigate logs for root cause (CoinGecko, database, etc.). |
| Auth failure spike | > 20% auth failures over 5 min | Check Supabase status, verify OAuth configuration. |

### Warning alerts (respond within 1 hour)
| Alert | Condition | Action |
|-------|-----------|--------|
| Elevated latency | P95 > target for 10 min | Check CoinGecko response times and database performance. |
| Cache miss rate high | < 50% cache hits over 15 min | Review cache headers and React Query configuration. |
| CoinGecko rate limit | > 5 provider 429 responses in 1 min | Implement backoff and revisit rate limit configuration. |

### Informational alerts (daily review)
| Alert | Condition | Action |
|-------|-----------|--------|
| New user signups | Daily count | Track growth. |
| Admin access | Admin role logs in | Security audit log. |

---

## Dashboard Setup

### Vercel Analytics dashboard
Pin these metrics:
- Web Vitals: FCP, LCP, CLS, TTI.
- Top pages: `/`, `/settings`, `/admin`.
- Error rate: 4xx/5xx breakdown.
- Function execution time: `/api/prices`, `/api/history`.

Access: https://vercel.com/team/cryptopanel/analytics

### Supabase dashboard
Monitor:
- Database load: active connections and query time.
- Auth stats: daily active users and login success rate.
- Storage: database size growth.
- RLS performance: query timing with policies enabled.

Access: https://supabase.com/dashboard/project/<project-id>

### Custom metrics (future)
Optional: export logs to Grafana or Datadog for advanced dashboards (for example, average API latency by endpoint, CoinGecko error rate by hour, user preference changes per day).

---

## Incident Response

### Runbook: API downtime
Symptoms: `/healthz` returns 503 or users report "data unavailable".
1. Check Vercel status: https://vercel-status.com
2. Check Supabase status: https://status.supabase.com
3. Check CoinGecko status: https://status.coingecko.com
4. Review Vercel logs for error patterns (last 15 min).
5. If CoinGecko is down: display stale data banner in UI.
6. If Supabase is down: disable settings updates, show read-only mode.
7. If Vercel is down: wait for recovery and communicate via status page.
8. Escalate after 30 min; rollback to previous deployment if unresolved.

### Runbook: High latency
Symptoms: users report slow loading; P95 > 2s.
1. Check Vercel function logs for slow endpoints.
2. Review Supabase query performance.
3. Inspect CoinGecko response times.
4. If CoinGecko is slow: increase cache TTL temporarily.
5. If Supabase is slow: review RLS policies and indexes.
6. If Vercel shows cold starts: consider plan upgrade.

### Runbook: CoinGecko rate limit
Symptoms: logs show 429 errors from CoinGecko.
1. Increase stale-while-revalidate cache window (for example to 300s).
2. Implement exponential backoff in API handler.
3. Display "data may be delayed" banner in UI.
4. Monitor error rate. If persistent, consider paid CoinGecko tier.

---

## Performance Optimization

### Caching strategy review
- Current server cache: `s-maxage=60`, `stale-while-revalidate=120`.
- Current client cache: React Query `staleTime=60000`, `cacheTime=300000`.
- If latency persists: increase `staleTime` to 90s, add Vercel edge caching (KV), prefetch additional ranges on dashboard load.

### Database query optimization
- Add composite index `(id, role)` for admin queries if needed.
- Review RLS policy complexity; consider materialized views for heavy reads.
- Enable connection pooling in Supabase (Database -> Connection Pooling).

### Cost monitoring
- **Vercel limits (Hobby plan):** 100 GB bandwidth/month, 100 serverless function invocation units/day.
- **Supabase limits (Free tier):** 500 MB database size, 2 GB bandwidth/month.
- **Alerts:** send email when Vercel hits 80% of limits or Supabase database > 400 MB.
- **Upgrade triggers:** Vercel requests > 10,000/day sustained; Supabase database > 450 MB.

### Compliance and security monitoring
- Log security events: failed login bursts, admin role changes, profile updates, rate limit breaches.
- Do not log user emails in plain text; use hashed identifiers when possible.
- Scrub sensitive data from error logs and rotate logs every 30 days.

---

## Testing the Monitoring Setup

### Pre-production checklist
- Verify `/healthz` returns 200.
- Test uptime monitor alerts on simulated downtime.
- Simulate high error rate (return 500) and confirm alert triggers.
- Check Vercel Analytics for Web Vitals data.
- Confirm Supabase logs show query times.
- Ensure structured logs appear in Vercel dashboard.

### Post-deployment checklist
- Monitor TTFU for the first 100 users.
- Review P95 latency for 24 hours.
- Confirm error rate remains < 1%.
- Verify auto-refresh polling works for 10 minutes.
- Test manual refresh triggers a fresh data fetch.
