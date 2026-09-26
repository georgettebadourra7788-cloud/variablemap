import type { CheckStatus } from '../lib/review';

export const STATUS_META: Record<CheckStatus, { symbol: string; label: string; className: string }> = {
  complete: { symbol: '✓', label: 'Complete', className: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
  review: { symbol: '⚠', label: 'Needs review', className: 'text-amber-800 bg-amber-50 border-amber-200' },
  missing: { symbol: '○', label: 'Not specified', className: 'text-slate-600 bg-slate-50 border-slate-300' },
};

export function StatusPill({ status, showLabel = true }: { status: CheckStatus; showLabel?: boolean }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1 rounded border px-2 py-0.5 text-xs font-medium ${m.className}`}>
      <span aria-hidden="true">{m.symbol}</span>
      {showLabel ? m.label : <span className="sr-only">{m.label}</span>}
    </span>
  );
}
