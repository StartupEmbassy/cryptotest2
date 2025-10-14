/**
 * @fileoverview React Query hook returning spot prices from `/api/prices`.
 */
import { useQuery } from '@tanstack/react-query';

import { fetchSpotPrices } from '../services/prices-service';
import type { PriceTicker } from '../types';

type UsePricesOptions = Readonly<{
  symbols?: string[];
  vs?: string;
}>;

const DEFAULT_SYMBOLS = ['btc', 'eth'];
const DEFAULT_VS = 'usd';

const buildQueryKey = (symbols: string[], vs: string) =>
  ['market', 'prices', symbols.join(','), vs] as const;

export const usePrices = (options: UsePricesOptions = {}) => {
  const symbols = (options.symbols ?? DEFAULT_SYMBOLS).map((symbol) => symbol.toLowerCase());
  const vs = (options.vs ?? DEFAULT_VS).toLowerCase();

  return useQuery<PriceTicker[]>({
    queryKey: buildQueryKey(symbols, vs),
    queryFn: () => fetchSpotPrices({ symbols, vs }),
    refetchInterval: 60_000,
    refetchOnWindowFocus: false
  });
};
