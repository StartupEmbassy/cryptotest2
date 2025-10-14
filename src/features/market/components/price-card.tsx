/**
 * @fileoverview Presentational card for spot prices.
 * - Displays symbol, price, change percentage, and last update timestamp.
 */
type PriceCardProps = Readonly<{
  symbol: string;
  price: number;
  currency: string;
  change24hPct?: number;
  updatedAt: number;
  isLoading?: boolean;
  isActive?: boolean;
  onSelect?: () => void;
}>;

const formatPrice = (value: number, currency: string) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2
  }).format(value);

const formatDelta = (delta: number) => `${delta >= 0 ? '+' : ''}${delta.toFixed(2)}%`;

const formatTimestamp = (timestamp: number) =>
  new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(timestamp);

export const PriceCard = ({
  symbol,
  price,
  currency,
  change24hPct,
  updatedAt,
  isLoading,
  isActive,
  onSelect
}: PriceCardProps) => {
  const deltaColor =
    change24hPct === undefined ? 'text-slate-400' : change24hPct >= 0 ? 'text-emerald-400' : 'text-rose-400';
  const deltaLabel =
    change24hPct === undefined ? '—' : isLoading ? '---' : formatDelta(change24hPct);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full max-w-sm rounded-2xl border bg-slate-900/70 p-5 text-left shadow-lg transition ${
        isActive
          ? 'border-accent shadow-accent/40 ring-2 ring-accent/40'
          : 'border-slate-800 hover:border-accent/40'
      } ${onSelect ? 'cursor-pointer' : 'cursor-default'}`}
    >
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">{symbol}</h2>
        <span className={`text-sm font-medium ${deltaColor}`}>{deltaLabel}</span>
      </header>
      <p className="mt-4 text-3xl font-bold">
        {isLoading ? 'Loading...' : formatPrice(price, currency)}
      </p>
      <p className="mt-2 text-xs text-slate-400">
        {isLoading ? 'Updating data...' : `Updated at ${formatTimestamp(updatedAt)}`}
      </p>
    </button>
  );
};
