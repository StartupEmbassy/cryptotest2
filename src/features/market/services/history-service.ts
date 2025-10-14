/**
 * @fileoverview Client-side service for `/api/history`.
 */
import type { HistoryRange, HistoryResponse } from '../types';

type FetchHistoryOptions = Readonly<{
  symbol: string;
  range: HistoryRange;
  vs?: string;
}>;

type ApiResponse = Readonly<{
  symbol: string;
  vs: string;
  range: string;
  series: Array<{
    t: number;
    p: number;
  }>;
}>;

const DEFAULT_VS = 'usd';

const buildQuery = ({ symbol, range, vs }: FetchHistoryOptions) => {
  const params = new URLSearchParams();
  params.set('symbol', symbol);
  params.set('range', range);
  params.set('vs', vs ?? DEFAULT_VS);
  return params.toString();
};

export const fetchHistory = async (options: FetchHistoryOptions): Promise<HistoryResponse> => {
  const symbol = options.symbol.toLowerCase();
  const vs = (options.vs ?? DEFAULT_VS).toLowerCase();

  const response = await fetch(`/api/history?${buildQuery({ ...options, symbol, vs })}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json'
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Failed to load history (${response.status}): ${
        errorBody || response.statusText || 'Unknown error'
      }`
    );
  }

  const json = (await response.json()) as ApiResponse;
  if (!Array.isArray(json.series)) {
    throw new Error('Invalid history payload: missing series');
  }

  const responseRange =
    (['24h', '7d', '30d'] as const).includes(json.range as HistoryRange)
      ? (json.range as HistoryRange)
      : options.range;

  return {
    symbol: (json.symbol ?? symbol).toUpperCase(),
    vs: (json.vs ?? vs).toUpperCase(),
    range: responseRange,
    series: json.series.map((item) => ({
      t: item.t,
      p: item.p
    }))
  };
};
