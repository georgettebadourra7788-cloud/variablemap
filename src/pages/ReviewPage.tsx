import { useState } from 'react';
import type { Project } from '../types';
import { paths } from '../router';
import { reviewProject, type ReviewCheck } from '../lib/review';
import { Card, EmptyState, LinkButton, SectionHeading } from '../components/ui';
import { STATUS_META, StatusPill } from '../components/StatusIcon';

function CheckList({ checks, issuesOnly }: { checks: ReviewCheck[]; issuesOnly: boolean }) {
  const shown = issuesOnly ? checks.filter((c) => c.status !== 'complete') : checks;
  if (shown.length === 0)
    return (
      <p className="mt-3 flex items-center gap-2 text-sm text-emerald-800">
        <StatusPill status="complete" showLabel={false} /> All {checks.length} checks complete.
      </p>
    );
  return (
    <ul className="divide-y divide-slate-100">
      {shown.map((c) => (
        <li key={c.id} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="sm:w-52 sm:shrink-0">
            <StatusPill status={c.status} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-800">{c.label}</p>
            {c.status !== 'complete' && <p className="text-sm text-slate-600">{c.message}</p>}
            <p className="mt-0.5 text-xs text-slate-400">Rule: {c.rule}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

export function ReviewPage({ project }: { project: Project }) {
  const review = reviewProject(project);
  const issueCount = review.counts.review + review.counts.missing;
  const [issuesOnly, setIssuesOnly] = useState(issueCount > 0);

  return (
    <div>
      <SectionHeading
        title="Review checklist"
        description="A transparent, rule-based check of which documentation fields are complete. Each rule is shown so you can see exactly why an item is flagged."
        action={
          <LinkButton href={paths.codebook(project.id)} variant="secondary">
            Generate codebook →
          </LinkButton>
        }
      />

      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        This review only checks whether information has been documented. It does <strong>not</strong> assess whether the research is scientifically
        valid, whether an instrument is valid or reliable, or whether a planned analysis is correct. Additional methodological review may be
        appropriate — for example with your supervisor or a methodologist.
      </div>

      <div className="mb-6 grid grid-cols-3 gap-3">
        {(['complete', 'review', 'missing'] as const).map((s) => (
          <Card key={s} className="p-4 text-center">
            <p className={`text-2xl font-semibold ${s === 'complete' ? 'text-emerald-700' : s === 'review' ? 'text-amber-700' : 'text-slate-600'}`}>
              {review.counts[s]}
            </p>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              <span aria-hidden="true">{STATUS_META[s].symbol}</span> {STATUS_META[s].label}
            </p>
          </Card>
        ))}
      </div>

      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-600">
          {issueCount === 0
            ? 'No issues found.'
            : `${issueCount} item${issueCount === 1 ? '' : 's'} to look at${issuesOnly ? ' — completed checks are hidden.' : '.'}`}
        </p>
        <div role="group" aria-label="Which checks to show" className="inline-flex self-start rounded-md border border-slate-300 bg-white p-0.5 text-sm">
          {[
            { value: true, label: 'Issues only' },
            { value: false, label: 'All checks' },
          ].map((o) => (
            <button
              key={o.label}
              type="button"
              aria-pressed={issuesOnly === o.value}
              onClick={() => setIssuesOnly(o.value)}
              className={`rounded px-3 py-1.5 font-medium ${issuesOnly === o.value ? 'bg-navy-800 text-white' : 'text-slate-600 hover:bg-navy-50'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <Card className="mb-6 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold">Project</h3>
          <LinkButton href={paths.overview(project.id)} variant="ghost" size="sm">
            Edit details
          </LinkButton>
        </div>
        <CheckList checks={review.project} issuesOnly={issuesOnly} />
      </Card>

      {review.variables.length === 0 ? (
        <EmptyState title="No variables to review" action={<LinkButton href={paths.variables(project.id)}>Add variables</LinkButton>} />
      ) : (
        <div className="space-y-6">
          {review.variables.map((vr) => (
            <Card key={vr.variableId} className="p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="font-serif text-lg font-semibold">{vr.variableName}</h3>
                  <p className="text-xs text-slate-500">
                    ✓ {vr.counts.complete} · ⚠ {vr.counts.review} · ○ {vr.counts.missing}
                  </p>
                </div>
                <LinkButton href={paths.variable(project.id, vr.variableId)} variant="secondary" size="sm">
                  Edit variable
                </LinkButton>
              </div>
              <CheckList checks={vr.checks} issuesOnly={issuesOnly} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
