/**
 * @fileoverview Shared validation helpers for market API handlers.
 */
import { z } from 'zod';

export const SYMBOL_ID_MAP = {
  btc: 'bitcoin',
  eth: 'ethereum'
} as const;

export type SupportedSymbol = keyof typeof SYMBOL_ID_MAP;

export const defaultSymbols: SupportedSymbol[] = ['btc', 'eth'];

const symbolRegex = /^[a-z0-9]{3,10}$/;
const currencyRegex = /^[a-z]{3,5}$/;

export const parseSymbols = (symbolsParam?: string) => {
  const symbols = (symbolsParam ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const finalSymbols = symbols.length > 0 ? symbols : defaultSymbols;

  const schema = z
    .array(
      z
        .string()
        .regex(symbolRegex, 'Symbols must be lowercase alphanumeric (3-10 chars)')
        .refine((value) => value in SYMBOL_ID_MAP, (value) => ({
          message: `Unsupported symbol: ${value}`
        }))
    )
    .min(1, 'At least one symbol is required')
    .max(10, 'A maximum of 10 symbols is allowed');

  return schema.parse(finalSymbols) as SupportedSymbol[];
};

export const parseVsCurrency = (vsParam?: string) => {
  const value = (vsParam ?? 'usd').toLowerCase();
  return z
    .string()
    .regex(currencyRegex, 'Base currency must be a 3-5 letter ISO code')
    .parse(value);
};

export const historyRangeSchema = z.enum(['24h', '7d', '30d']);

export type HistoryRange = z.infer<typeof historyRangeSchema>;
