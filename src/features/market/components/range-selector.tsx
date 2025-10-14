/**
 * @fileoverview Range selector buttons for history chart.
 */
import type { HistoryRange } from '../types';

type RangeSelectorProps = Readonly<{
  value: HistoryRange;
  onChange: (next: HistoryRange) => void;
}>;

const RANGES: HistoryRange[] = ['24h', '7d', '30d'];

export const RangeSelector = ({ value, onChange }: RangeSelectorProps) => (
  <div className="flex items-center gap-2">
    {RANGES.map((range) => (
      <button
        key={range}
        type="button"
        onClick={() => onChange(range)}
        className={`rounded-full px-3 py-1 text-sm transition ${
          range === value
            ? 'bg-accent text-slate-950'
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
      >
        {range.toUpperCase()}
      </button>
    ))}
  </div>
);
