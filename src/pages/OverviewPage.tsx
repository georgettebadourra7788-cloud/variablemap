import type { Project } from '../types';
import { useProjects } from '../state/ProjectsContext';
import { paths } from '../router';
import { countItems } from '../lib/factory';
import { reviewProject } from '../lib/review';
import { Card, LinkButton } from '../components/ui';
import { ProjectFields } from '../components/ProjectFields';
import { ProComingSoonCard, UsageMeter } from '../components/Plans';
import { STATUS_META } from '../components/StatusIcon';
import { LocalStorageNotice } from '../components/LocalStorageNotice';

export function OverviewPage({ project }: { project: Project }) {
  const { projects, updateProject } = useProjects();
  const review = reviewProject(project);
  const items = countItems(project);

  const steps = [
    { label: 'Project details', done: !!project.researchQuestion.trim(), href: '#details' },
    { label: 'Add variables', done: project.variables.length > 0, href: paths.variables(project.id) },
    { label: 'Add dimensions & items', done: items > 0, href: paths.variables(project.id) },
    { label: 'Review', done: project.variables.length > 0 && review.counts.missing === 0 && review.counts.review === 0, href: paths.review(project.id) },
    { label: 'Codebook', done: false, href: paths.codebook(project.id) },
    { label: 'Data Dictionary & export', done: false, href: paths.dictionary(project.id) },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        {project.isExample && (
          <div className="rounded-lg border border-navy-100 bg-white p-4 text-sm text-slate-700">
            <strong className="text-navy-900">This is the example project.</strong> Items were written for this demonstration and are not from a published
            instrument. Some fields are intentionally incomplete so the review has something to show. Edit it freely or delete it from My projects.
          </div>
        )}

        <Card className="p-5 sm:p-6">
          <h2 className="font-serif text-xl font-semibold">Workflow</h2>
          <ol className="mt-4 grid gap-2 sm:grid-cols-2">
            {steps.map((s, i) => (
              <li key={s.label}>
                <a
                  href={s.href}
                  onClick={(e) => {
                    if (s.href === '#details') {
                      e.preventDefault();
                      document.getElementById('details')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="flex items-center gap-3 rounded-md border border-slate-200 px-3 py-2.5 text-sm hover:border-navy-300 hover:bg-navy-50"
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                      s.done ? 'bg-emerald-600 text-white' : 'bg-navy-100 text-navy-800'
                    }`}
                    aria-hidden="true"
                  >
                    {s.done ? '✓' : i + 1}
                  </span>
                  <span className="font-medium text-slate-800">{s.label}</span>
                  {s.done && <span className="sr-only">(done)</span>}
                </a>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-5 sm:p-6">
          <h2 id="details" className="scroll-mt-20 font-serif text-xl font-semibold">
            Project details
          </h2>
          <p className="mb-4 mt-1 text-sm text-slate-500">Changes save automatically.</p>
          <ProjectFields
            value={project}
            onChange={(patch) => updateProject(project.id, patch)}
          />
        </Card>
      </div>

      <aside className="space-y-4">
        <Card className="p-5">
          <h2 className="font-semibold">Usage (Free plan)</h2>
          <div className="mt-4 space-y-4">
            <UsageMeter kind="projects" count={projects.length} />
            <UsageMeter kind="variables" count={project.variables.length} />
            <UsageMeter kind="indicators" count={items} />
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="font-semibold">Review summary</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {(['complete', 'review', 'missing'] as const).map((s) => (
              <li key={s} className="flex justify-between">
                <span>
                  <span aria-hidden="true">{STATUS_META[s].symbol}</span> {STATUS_META[s].label}
                </span>
                <span className="font-semibold">{review.counts[s]}</span>
              </li>
            ))}
          </ul>
          <LinkButton href={paths.review(project.id)} variant="secondary" size="sm" className="mt-4 w-full">
            Open review
          </LinkButton>
        </Card>
        <LocalStorageNotice />
        <ProComingSoonCard compact />
      </aside>
    </div>
  );
}
