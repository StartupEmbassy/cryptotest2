/**
 * @fileoverview Market feature shared types for CryptoPanel.
 * - Shapes spot price tickers and historical series points.
 */
export type PriceTicker = Readonly<{
  symbol: string;
  price: number;
  currency: string;
  change24hPct?: number;
  updatedAt: number;
}>;

export type HistoryPoint = Readonly<{
  t: number;
  p: number;
}>;

export type HistoryRange = '24h' | '7d' | '30d';

export type HistoryResponse = Readonly<{
  symbol: string;
  vs: string;
  range: HistoryRange;
  series: HistoryPoint[];
}>;
