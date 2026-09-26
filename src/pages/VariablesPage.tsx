import { canAdd } from '../config/plans';
import type { Project } from '../types';
import { useProjects } from '../state/ProjectsContext';
import { navigate, paths } from '../router';
import { countItems } from '../lib/factory';
import { roleLabel, scaleLabel } from '../lib/options';
import { reviewVariable } from '../lib/review';
import { Badge, Button, Card, EmptyState, SectionHeading } from '../components/ui';
import { LimitNotice, UsageMeter } from '../components/Plans';
import { StatusPill } from '../components/StatusIcon';
import { useToast } from '../components/Toast';

export function VariablesPage({ project }: { project: Project }) {
  const { addVariable } = useProjects();
  const toast = useToast();
  const atLimit = !canAdd('variables', project.variables.length);
  const itemsAtLimit = !canAdd('indicators', countItems(project));

  const onAdd = () => {
    const res = addVariable(project.id);
    if (res.ok) navigate(paths.variable(project.id, res.id));
    else toast('Variable limit reached.', 'error');
  };

  return (
    <div>
      <SectionHeading
        title="Variables"
        description="Document each variable in your study. Open a variable to add definitions, measurement, dimensions, items, and coding."
        action={
          <Button onClick={onAdd} disabled={atLimit}>
            + Add variable
          </Button>
        }
      />

      <Card className="mb-5 grid gap-4 p-4 sm:grid-cols-2">
        <UsageMeter kind="variables" count={project.variables.length} />
        <UsageMeter kind="indicators" count={countItems(project)} />
      </Card>

      {(atLimit || itemsAtLimit) && (
        <div className="mb-5 space-y-3">
          {atLimit && <LimitNotice kind="variables" />}
          {itemsAtLimit && <LimitNotice kind="indicators" />}
        </div>
      )}

      {project.variables.length === 0 ? (
        <EmptyState title="No variables yet" action={<Button onClick={onAdd}>+ Add your first variable</Button>}>
          Start with the key variables in your research question — for example, your independent and dependent variables.
        </EmptyState>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {project.variables.map((v) => {
            const r = reviewVariable(v, project.variables);
            const status = r.counts.missing > 0 ? 'missing' : r.counts.review > 0 ? 'review' : 'complete';
            return (
              <li key={v.id}>
                <a href={paths.variable(project.id, v.id)} className="block h-full rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:border-navy-300">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate font-serif text-lg font-semibold">{v.name || 'Untitled variable'}</h3>
                      {v.construct && <p className="truncate text-sm text-slate-500">{v.construct}</p>}
                    </div>
                    <StatusPill status={status} showLabel={false} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge>{roleLabel(v.role)}</Badge>
                    <Badge tone="slate">{scaleLabel(v.measurementScale)}</Badge>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    {v.dimensions.length} dimension{v.dimensions.length === 1 ? '' : 's'} · {v.items.length} item{v.items.length === 1 ? '' : 's'} ·{' '}
                    {r.counts.complete}/{r.checks.length} checks complete
                  </p>
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
