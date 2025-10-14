/**
 * @fileoverview Dashboard route for CryptoPanel.
 * - Renders live pricing and history using internal API endpoints backed by CoinGecko.
 */
'use client';

import { useMemo, useState } from 'react';

import { HistoryChart } from '@/features/market/components/history-chart';
import { PriceCard } from '@/features/market/components/price-card';
import { RangeSelector } from '@/features/market/components/range-selector';
import { useHistory } from '@/features/market/hooks/use-history';
import { usePrices } from '@/features/market/hooks/use-prices';
import type { HistoryRange } from '@/features/market/types';

const DEFAULT_SYMBOL = 'BTC';
const DEFAULT_RANGE: HistoryRange = '24h';
const FALLBACK_SYMBOLS = ['BTC', 'ETH'] as const;

const buildFallbackPrices = () =>
  FALLBACK_SYMBOLS.map((symbol) => ({
    symbol,
    price: 0,
    currency: 'USD',
    updatedAt: Date.now(),
    change24hPct: undefined as number | undefined
  }));

const DashboardPage = () => {
  const [selectedSymbol, setSelectedSymbol] = useState(DEFAULT_SYMBOL);
  const [range, setRange] = useState<HistoryRange>(DEFAULT_RANGE);

  const pricesQuery = usePrices({ symbols: ['btc', 'eth'], vs: 'usd' });
  const priceList = pricesQuery.data ?? buildFallbackPrices();

  const activePrice = useMemo(() => {
    return priceList.find((price) => price.symbol === selectedSymbol) ?? priceList[0];
  }, [priceList, selectedSymbol]);

  const historyQuery = useHistory(selectedSymbol, range, {
    vs: activePrice?.currency?.toLowerCase(),
    enabled: Boolean(activePrice) && !pricesQuery.isError
  });

  return (
    <main className="flex min-h-screen flex-col gap-8 p-8">
      <section className="flex flex-col gap-2">
        <h1 className="text-3xl font-semibold">CryptoPanel Dashboard</h1>
        <p className="text-slate-300">
          Prices and historical series are fetched on demand every 60 seconds. Select a symbol or
          range to explore the latest data.
        </p>
        {pricesQuery.isError ? (
          <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-3 text-sm text-rose-200">
            Unable to load spot prices. Please try again in a few moments.
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {priceList.map((price) => (
          <PriceCard
            key={price.symbol}
            symbol={price.symbol}
            price={price.price}
            currency={price.currency}
            change24hPct={price.change24hPct}
            updatedAt={price.updatedAt}
            isLoading={pricesQuery.isLoading}
            isActive={price.symbol === activePrice?.symbol}
            onSelect={() => setSelectedSymbol(price.symbol)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">{selectedSymbol.toUpperCase()} history</h2>
          <RangeSelector value={range} onChange={setRange} />
        </div>
        {historyQuery.isError ? (
          <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-sm text-rose-200">
            Unable to load historical data. Try selecting another range or refresh the page.
          </div>
        ) : (
          <HistoryChart
            symbol={selectedSymbol}
            range={range}
            currency={historyQuery.data?.vs ?? activePrice?.currency ?? 'USD'}
            data={historyQuery.data?.series ?? []}
            isLoading={historyQuery.isLoading}
          />
        )}
      </section>
    </main>
  );
};

export default DashboardPage;
