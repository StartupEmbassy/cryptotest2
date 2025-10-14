/**
 * @fileoverview React Query hook returning historical price data via `/api/history`.
 */
import { useQuery } from '@tanstack/react-query';

import { fetchHistory } from '../services/history-service';
import type { HistoryRange, HistoryResponse } from '../types';

type UseHistoryOptions = Readonly<{
  vs?: string;
  enabled?: boolean;
}>;

const DEFAULT_VS = 'usd';

export const HISTORY_QUERY_KEY = (symbol: string, range: HistoryRange, vs: string) =>
  ['market', 'history', symbol.toLowerCase(), range, vs.toLowerCase()] as const;

export const useHistory = (symbol: string, range: HistoryRange, options: UseHistoryOptions = {}) => {
  const lowerSymbol = symbol.toLowerCase();
  const vs = (options.vs ?? DEFAULT_VS).toLowerCase();

  return useQuery<HistoryResponse>({
    queryKey: HISTORY_QUERY_KEY(lowerSymbol, range, vs),
    queryFn: () => fetchHistory({ symbol: lowerSymbol, range, vs }),
    keepPreviousData: true,
    enabled: options.enabled ?? true
  });
};
