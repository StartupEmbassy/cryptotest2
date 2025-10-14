/**
 * @fileoverview Historical price line chart.
 * - Visualises history series using Recharts.
 */
import { useMemo } from 'react';

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';

import type { HistoryPoint, HistoryRange } from '../types';

type HistoryChartProps = Readonly<{
  symbol: string;
  range: HistoryRange;
  data: HistoryPoint[];
  currency: string;
  isLoading?: boolean;
}>;

const formatTimeLabel = (timestamp: number) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(timestamp);

export const HistoryChart = ({ symbol, range, data, currency, isLoading }: HistoryChartProps) => {
  const chartData = useMemo(
    () =>
      data.map((point) => ({
        time: formatTimeLabel(point.t),
        price: point.p
      })),
    [data]
  );

  return (
    <article className="w-full rounded-2xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg">
      <header className="mb-4 flex flex-col gap-1 text-left">
        <h2 className="text-lg font-semibold">
          {symbol.toUpperCase()} history ({range})
        </h2>
        <p className="text-xs text-slate-400">
          {isLoading
            ? 'Loading chart data...'
            : `Data fetched from CoinGecko and displayed in ${currency}.`}
        </p>
      </header>
      <div className="h-72 w-full">
        {chartData.length === 0 && !isLoading ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No data available for the selected range.
          </div>
        ) : (
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#94a3b8" minTickGap={24} />
              <YAxis
                stroke="#94a3b8"
                tickFormatter={(value) =>
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency,
                    maximumFractionDigits: 0
                  }).format(value)
                }
              />
              <Tooltip
                labelStyle={{ color: '#e2e8f0' }}
                formatter={(value: number) =>
                  new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency
                  }).format(value)
                }
              />
              <Line
                type="monotone"
                dataKey="price"
                stroke="#22d3ee"
                strokeWidth={2}
                dot={false}
                isAnimationActive={!isLoading}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </article>
  );
};
