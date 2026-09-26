import { FREE_PLAN, LIMITS, PRO_PLAN, type LimitKind } from '../config/plans';
import { paths } from '../router';
import { Badge, Card, LinkButton } from './ui';

const Check = () => (
  <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-navy-600" aria-hidden="true">
    <path fill="currentColor" d="M7.6 13.4 4.2 10l-1.4 1.4 4.8 4.8 10-10-1.4-1.4z" />
  </svg>
);

export function FreePlanCard({ showCta = true }: { showCta?: boolean }) {
  return (
    <Card className="flex flex-col p-6">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-xl font-semibold">{FREE_PLAN.name}</h3>
        <Badge tone="green">{FREE_PLAN.tagline}</Badge>
      </div>
      <p className="mt-3">
        <span className="font-serif text-4xl font-semibold text-navy-900">{FREE_PLAN.price}</span>
        <span className="ml-2 text-sm text-slate-500">{FREE_PLAN.tagline}</span>
      </p>
      <ul className="mt-5 space-y-2 text-sm text-slate-700">
        {FREE_PLAN.features.map((f) => (
          <li key={f} className="flex gap-2">
            <Check />
            {f}
          </li>
        ))}
      </ul>
      {showCta && (
        <div className="mt-6">
          <LinkButton href={paths.projects()} className="w-full">
            {FREE_PLAN.cta}
          </LinkButton>
          <p className="mt-2 text-center text-xs text-slate-500">{FREE_PLAN.smallPrint}</p>
        </div>
      )}
    </Card>
  );
}

export function ProComingSoonCard({ compact = false }: { compact?: boolean }) {
  return (
    <Card className={`flex flex-col border-dashed ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between gap-2">
        <h3 className={`font-serif font-semibold ${compact ? 'text-base' : 'text-xl'}`}>
          {PRO_PLAN.name} — {PRO_PLAN.status}
        </h3>
        <Badge tone="slate">In development</Badge>
      </div>
      {!compact && <p className="mt-3 text-sm font-medium text-slate-700">Planned features</p>}
      <ul className={`mt-2 grid gap-x-4 gap-y-1.5 text-sm text-slate-600 ${compact ? 'sm:grid-cols-2' : ''}`}>
        {PRO_PLAN.plannedFeatures.map((f) => (
          <li key={f} className="flex gap-2">
            <span aria-hidden="true" className="text-slate-400">
              •
            </span>
            {f}
          </li>
        ))}
      </ul>
      <p className="mt-4 rounded-md bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">{PRO_PLAN.disclaimer}</p>
    </Card>
  );
}

export function UsageMeter({ kind, count }: { kind: LimitKind; count: number }) {
  const { max, label } = LIMITS[kind];
  const pct = Math.min(100, Math.round((count / max) * 100));
  const atLimit = count >= max;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className={atLimit ? 'font-semibold text-amber-800' : 'text-slate-600'}>
          {count} / {max}
        </span>
      </div>
      <div
        className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100"
        role="progressbar"
        aria-label={`${label} used`}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={count}
      >
        <div className={`h-full rounded-full ${atLimit ? 'bg-amber-500' : 'bg-navy-600'}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function LimitNotice({ kind }: { kind: LimitKind }) {
  const { max, unit } = LIMITS[kind];
  return (
    <div role="status" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
      <p className="font-semibold">Free plan limit reached: {max} {unit}.</p>
      <p className="mt-1">
        Your existing work is safe — nothing has been deleted or locked, and you can keep editing everything you have.
        {kind === 'projects'
          ? ' To start another project, delete one you no longer need (export it first if you want a copy).'
          : ' To add more, remove entries you no longer need.'}
      </p>
      <p className="mt-2">
        <span className="font-semibold">Pro — Coming Soon</span> will offer larger limits. {PRO_PLAN.disclaimer}
      </p>
    </div>
  );
}
