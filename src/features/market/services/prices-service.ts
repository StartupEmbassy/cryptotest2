/**
 * @fileoverview Client-side service for `/api/prices`.
 */
import type { PriceTicker } from '../types';

type FetchSpotPricesOptions = Readonly<{
  symbols?: string[];
  vs?: string;
}>;

type ApiResponse = Record<
  string,
  {
    price: number;
    ts: number;
  }
>;

const DEFAULT_SYMBOLS = ['btc', 'eth'];
const DEFAULT_VS = 'usd';

const normaliseSymbols = (symbols: string[]) =>
  symbols.map((symbol) => symbol.trim().toLowerCase()).filter(Boolean);

const buildQuery = (symbols: string[], vs: string) => {
  const params = new URLSearchParams();
  if (symbols.length > 0) {
    params.set('symbols', symbols.join(','));
  }
  params.set('vs', vs);
  return params.toString();
};

export const fetchSpotPrices = async (
  options: FetchSpotPricesOptions = {}
): Promise<PriceTicker[]> => {
  const symbols = normaliseSymbols(options.symbols ?? DEFAULT_SYMBOLS);
  const vs = (options.vs ?? DEFAULT_VS).toLowerCase();
  const response = await fetch(`/api/prices?${buildQuery(symbols, vs)}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to load prices (${response.status}): ${
        errorBody || response.statusText || 'Unknown error'
      }`
    );
  }

  const json = (await response.json()) as ApiResponse;
  const upperVs = vs.toUpperCase();

  return symbols.map((symbol) => {
    const details = json[symbol];
    if (!details) {
      throw new Error(`Provider response missing ${symbol} price`);
    }

    return {
      symbol: symbol.toUpperCase(),
      price: details.price,
      currency: upperVs,
      updatedAt: details.ts,
      change24hPct: undefined
    } satisfies PriceTicker;
  });
};
