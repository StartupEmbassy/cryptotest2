# Testing Strategy - CryptoPanel

Comprehensive testing approach for the MVP with minimum viable coverage.

---

## Testing Principles

1. **Test the contract, not the implementation:** focus on inputs and outputs.
2. **Mock external dependencies:** CoinGecko API and Supabase in unit tests.
3. **Prioritize high-risk areas:** authentication, API validation, data formatting.
4. **Automate what matters:** continuous integration runs tests on every PR.
5. **Document test gaps:** known limitations are better than unknown bugs.

---

## Test Levels

### 1. Unit Tests
- **Scope:** pure functions, utilities, helpers.  
- **Framework:** Vitest (recommended) or Jest.  
- **Location:** `tests/unit/`.

**Coverage targets:**
- Currency formatting (`lib/format-currency.ts`) - 100%.
- Timezone formatting (`lib/format-datetime.ts`) - 100%.
- Validation schemas (`features/*/api/validation.ts`) - 100%.
- Rate limit logic (`features/infra/rate-limit.ts`) - 80%.

**Example test:**
```typescript
// tests/unit/format-currency.test.ts
import { describe, it, expect } from 'vitest';
import formatCurrency from '@/lib/format-currency';

describe('formatCurrency', () => {
  it('formats USD with 2 decimals', () => {
    expect(formatCurrency(1234.567, 'USD')).toBe('$1,234.57');
  });

  it('formats EUR with symbol', () => {
    expect(formatCurrency(1234.567, 'EUR')).toBe('EUR 1,234.57');
  });

  it('handles zero values', () => {
    expect(formatCurrency(0, 'USD')).toBe('$0.00');
  });
});
```
**Run command:**
```bash
pnpm test:unit
```

### 2. Integration Tests (API contract tests)
- **Scope:** API route handlers with mocked external services.  
- **Framework:** Vitest + MSW (Mock Service Worker).  
- **Location:** `tests/integration/`.

**Coverage targets:**
- `/api/prices` - input validation, response shape, cache headers.
- `/api/history` - input validation, response shape, error handling.
- `/healthz` - response format.

**Example test:**
```typescript
// tests/integration/api-prices.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { GET as getPrices } from '@/features/market/api/prices/route';

const server = setupServer(
  http.get('https://api.coingecko.com/api/v3/simple/price', () =>
    HttpResponse.json({
      bitcoin: { usd: 45230.5 },
      ethereum: { usd: 2345.75 }
    })
  )
);

beforeAll(() => server.listen());
afterAll(() => server.close());

describe('GET /api/prices', () => {
  it('returns normalized price data', async () => {
    const request = new Request('http://localhost:3000/api/prices?symbols=btc,eth&vs=usd');
    const response = await getPrices(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toMatchObject({
      btc: { price: expect.any(Number), ts: expect.any(Number) },
      eth: { price: expect.any(Number), ts: expect.any(Number) }
    });
  });

  it('validates invalid symbols', async () => {
    const request = new Request('http://localhost:3000/api/prices?symbols=INVALID!!!');
    const response = await getPrices(request);

    expect(response.status).toBe(400);
    expect(await response.json()).toMatchObject({
      error: expect.any(String),
      code: 'INVALID_INPUT'
    });
  });

  it('includes cache headers', async () => {
    const request = new Request('http://localhost:3000/api/prices');
    const response = await getPrices(request);

    expect(response.headers.get('Cache-Control')).toContain('s-maxage=60');
    expect(response.headers.get('Cache-Control')).toContain('stale-while-revalidate=120');
  });
});
```
**Run command:**
```bash
pnpm test:integration
```

### 3. Component Tests (UI)
- **Scope:** React components in isolation.  
- **Framework:** Vitest + Testing Library.  
- **Location:** `tests/components/`.

**Coverage targets:**
- Dashboard price cards rendering.
- Historical chart with range selector.
- Settings form validation.
- Admin gate behavior (show/hide based on role).

**Example test:**
```tsx
// tests/components/price-card.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PriceCard from '@/features/market/components/price-card';

describe('PriceCard', () => {
  it('displays formatted price', () => {
    render(
      <PriceCard
        symbol="BTC"
        price={45230.5}
        currency="USD"
        timestamp={Date.now()}
      />
    );

    expect(screen.getByText('BTC')).toBeInTheDocument();
    expect(screen.getByText('$45,230.50')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<PriceCard symbol="BTC" loading />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});
```
**Run command:**
```bash
pnpm test:components
```

### 4. End-to-End Tests (E2E)
- **Scope:** critical user flows in a full browser.  
- **Framework:** Playwright (recommended) or Cypress.  
- **Location:** `tests/e2e/`.

**Minimum coverage:**
- Auth flow: login with Google and redirect to dashboard.
- Dashboard flow: view prices, manual refresh, auto-refresh (wait 60s).
- Settings flow: change currency, save, verify UI updates.
- Admin flow: login as admin, access `/admin`, verify content visible.

**Example test:**
```typescript
// tests/e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test('dashboard displays prices and refreshes', async ({ page }) => {
  // Assumes user is already authenticated (use storage state)
  await page.goto('/');

  // Check initial prices load
  await expect(page.getByTestId('btc-price')).toBeVisible();
  await expect(page.getByTestId('eth-price')).toBeVisible();

  // Manual refresh
  await page.getByRole('button', { name: 'Refresh' }).click();
  await expect(page.getByTestId('btc-price')).toContainText('$');

  // Wait for auto-refresh (60 seconds)
  await page.waitForTimeout(61000);
  const timestamp = await page.getByTestId('btc-timestamp').textContent();
  expect(timestamp).toBeTruthy();
});

test('unauthenticated users redirect to login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL('/login');
});
```
**Run command:**
```bash
pnpm test:e2e
```
> Note: E2E tests are optional for the MVP but strongly recommended before production.

---

## Test Coverage Goals
| Area | Target | Priority |
|------|--------|----------|
| Utility functions | 100% | High |
| API validation | 100% | High |
| API handlers | 80% | High |
| React hooks | 70% | Medium |
| UI components | 60% | Medium |
| E2E flows | 4 critical paths | High |

- Continuous integration fails if overall coverage drops below 70%.
- Use `vitest --coverage` to generate reports.

## Test Data and Mocking

### Mock CoinGecko responses
```typescript
// tests/fixtures/coingecko.ts
export const mockPricesResponse = {
  bitcoin: { usd: 45230.5 },
  ethereum: { usd: 2345.75 }
};

export const mockHistoryResponse = {
  prices: [
    [1699790143000, 44850.25],
    [1699793743000, 44920.5]
  ]
};
```

### Mock Supabase client
```typescript
// tests/mocks/supabase.ts
import { vi } from 'vitest';

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn().mockResolvedValue({ data: { session: { user: { id: 'test-user-id' } } } })
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockResolvedValue({ data: [], error: null })
  }))
};
```

## CI/CD Integration
File: `.github/workflows/test.yml`
```yaml
name: Tests

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
        with:
          version: 8
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm test:unit --coverage
      - run: pnpm test:integration
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```
> E2E tests run separately on deployment preview environments.

## Testing Commands
Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:unit": "vitest run tests/unit",
    "test:integration": "vitest run tests/integration",
    "test:components": "vitest run tests/components",
    "test:e2e": "playwright test",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

## Known Gaps and Limitations
- No E2E tests for settings persistence (manual testing acceptable for MVP).
- No performance tests (monitor in production).
- No accessibility tests (schedule for future iteration).
- Rate limiting not fully tested (in-memory limits are hard to exercise in serverless environments).

**Future improvements:** visual regression tests, load tests (k6 or Artillery), and mutation testing (Stryker) to assess test quality.

## Debugging Failed Tests
- **Timeout errors:** increase timeout in `vitest.config.ts`:
  ```typescript
  export default defineConfig({
    test: {
      testTimeout: 10000
    }
  });
  ```
- **MSW not intercepting:** ensure `server.listen()` is called in `beforeAll`.
- **React Query cache pollution:** reset between tests:
  ```typescript
  import { QueryClient } from '@tanstack/react-query';

  afterEach(() => {
    const queryClient = new QueryClient();
    queryClient.clear();
  });
  ```

## Test Review Checklist
Before merging any PR, ensure:
- All new code has corresponding tests.
- Tests are isolated (no shared state).
- External APIs are mocked.
- Tests pass locally and in CI.
- Coverage did not decrease.
- Test names clearly describe behaviour.
