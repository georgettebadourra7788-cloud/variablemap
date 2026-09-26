import { useState, type ReactNode } from 'react';
import type { Project, Variable } from '../types';
import { useProjects } from '../state/ProjectsContext';
import { navigate, paths } from '../router';
import { DATA_TYPE_OPTIONS, ROLE_OPTIONS, SCALE_OPTIONS } from '../lib/options';
import { reviewVariable } from '../lib/review';
import { toDatasetName } from '../lib/codebook';
import { Button, Card, EmptyState, LinkButton, SelectField, TextAreaField, TextField } from '../components/ui';
import { ConfirmDialog } from '../components/Dialog';
import { DimensionsItemsEditor } from '../components/DimensionsItemsEditor';
import { StatusPill } from '../components/StatusIcon';
import { useToast } from '../components/Toast';

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="font-serif text-lg font-semibold">{title}</h2>
      {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

export function VariableEditorPage({ project, variableId }: { project: Project; variableId: string }) {
  const { updateVariable, deleteVariable } = useProjects();
  const toast = useToast();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const v = project.variables.find((x) => x.id === variableId);

  if (!v) {
    return (
      <EmptyState title="Variable not found" action={<LinkButton href={paths.variables(project.id)}>Back to variables</LinkButton>}>
        It may have been deleted.
      </EmptyState>
    );
  }

  const set = (patch: Partial<Variable>) => updateVariable(project.id, v.id, patch);
  const review = reviewVariable(v, project.variables);
  const index = project.variables.findIndex((x) => x.id === v.id);
  const prev = project.variables[index - 1];
  const next = project.variables[index + 1];

  return (
    <div>
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <a href={paths.variables(project.id)} className="text-sm text-navy-700 hover:underline">
            ← All variables
          </a>
          <h2 className="mt-1 font-serif text-2xl font-semibold">{v.name || 'Untitled variable'}</h2>
          <p className="text-sm text-slate-500">
            Variable {index + 1} of {project.variables.length} · saves automatically
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {prev && (
            <LinkButton variant="secondary" size="sm" href={paths.variable(project.id, prev.id)}>
              ← Previous
            </LinkButton>
          )}
          {next && (
            <LinkButton variant="secondary" size="sm" href={paths.variable(project.id, next.id)}>
              Next →
            </LinkButton>
          )}
          <Button variant="danger" size="sm" onClick={() => setConfirmDelete(true)}>
            Delete variable
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <Card className="space-y-8 p-5 sm:p-6">
          <Section title="Basics">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField label="Variable name" value={v.name} onChange={(name) => set({ name })} placeholder="e.g. AI Anxiety" autoFocus={!v.name} />
              <TextField
                label="Dataset variable name"
                value={v.datasetName}
                onChange={(datasetName) => set({ datasetName })}
                placeholder={v.name ? toDatasetName(v.name) : 'e.g. AIANX_TOTAL'}
                hint="Short name used in your dataset and data dictionary. Leave blank to use the placeholder."
                maxLength={64}
              />
              <SelectField label="Variable role" value={v.role} onChange={(role) => set({ role })} options={ROLE_OPTIONS} />
              <TextField label="Construct/concept" value={v.construct} onChange={(construct) => set({ construct })} placeholder="The underlying concept" />
            </div>
          </Section>

          <Section title="Definitions" description="How the concept is understood, and how it will be observed or measured.">
            <div className="grid gap-4">
              <TextAreaField
                label="Conceptual definition"
                value={v.conceptualDefinition}
                onChange={(conceptualDefinition) => set({ conceptualDefinition })}
                placeholder="The theoretical meaning of the concept, ideally grounded in literature."
              />
              <TextAreaField
                label="Operational definition"
                value={v.operationalDefinition}
                onChange={(operationalDefinition) => set({ operationalDefinition })}
                placeholder="Exactly how the variable will be measured or observed in your study."
              />
            </div>
          </Section>

          <Section title="Measurement">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Measurement instrument / method"
                value={v.measurementInstrument}
                onChange={(measurementInstrument) => set({ measurementInstrument })}
                placeholder="e.g. Self-report questionnaire"
              />
              <TextField
                label="Instrument source"
                value={v.instrumentSource}
                onChange={(instrumentSource) => set({ instrumentSource })}
                placeholder="Author(s), year, or 'developed for this study'"
              />
              <SelectField label="Measurement scale" value={v.measurementScale} onChange={(measurementScale) => set({ measurementScale })} options={SCALE_OPTIONS} />
              <SelectField
                label="Data type"
                value={v.dataType}
                onChange={(dataType) => set({ dataType })}
                options={DATA_TYPE_OPTIONS}
                hint="How values will be stored in your dataset."
              />
              <TextField label="Response format" value={v.responseFormat} onChange={(responseFormat) => set({ responseFormat })} placeholder="e.g. 5-point agreement scale" />
              <TextField label="Scoring method" value={v.scoringMethod} onChange={(scoringMethod) => set({ scoringMethod })} placeholder="e.g. Mean of items after reverse coding" />
            </div>
          </Section>

          <Section title="Dimensions & indicators/items" description="Optional. Group items under dimensions (sub-scales), or list items directly.">
            <DimensionsItemsEditor project={project} variable={v} />
          </Section>

          <Section title="Coding & missing data">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextAreaField
                className="sm:col-span-2"
                label="Coding notes"
                value={v.codingNotes}
                onChange={(codingNotes) => set({ codingNotes })}
                placeholder="Value labels, category codes, recoding rules…"
              />
              <TextField
                label="Missing-data code"
                value={v.missingDataCode}
                onChange={(missingDataCode) => set({ missingDataCode })}
                placeholder="e.g. -99 = No response; -98 = Not applicable"
              />
            </div>
          </Section>

          <Section title="Analysis & sources">
            <div className="grid gap-4">
              <TextAreaField
                label="Planned analysis"
                value={v.plannedAnalysis}
                onChange={(plannedAnalysis) => set({ plannedAnalysis })}
                placeholder="e.g. Descriptive statistics; correlation with …"
                rows={2}
              />
              <TextAreaField
                label="Source/citation"
                value={v.sourceCitation}
                onChange={(sourceCitation) => set({ sourceCitation })}
                placeholder="Reference(s) supporting the definition or instrument"
                rows={2}
              />
              <TextAreaField label="Notes" value={v.notes} onChange={(notes) => set({ notes })} rows={2} />
            </div>
          </Section>
        </Card>

        <aside className="lg:sticky lg:top-20 lg:self-start">
          <Card className="p-5">
            <h2 className="font-semibold">Review for this variable</h2>
            <p className="mt-1 text-xs text-slate-500">Rule-based completeness check — not an assessment of validity.</p>
            <ul className="mt-3 space-y-2">
              {review.checks.map((c) => (
                <li key={c.id} className="flex items-start justify-between gap-2 text-sm">
                  <span className="text-slate-700">{c.label}</span>
                  <StatusPill status={c.status} showLabel={false} />
                </li>
              ))}
            </ul>
            <LinkButton href={paths.review(project.id)} variant="secondary" size="sm" className="mt-4 w-full">
              See full review
            </LinkButton>
          </Card>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this variable?"
        confirmLabel="Delete variable"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          deleteVariable(project.id, v.id);
          setConfirmDelete(false);
          toast(`Deleted “${v.name || 'Untitled variable'}”.`);
          navigate(paths.variables(project.id));
        }}
      >
        <p>
          “<strong>{v.name || 'Untitled variable'}</strong>” and its {v.dimensions.length} dimension(s) and {v.items.length} item(s) will be permanently
          removed. This cannot be undone.
        </p>
      </ConfirmDialog>
    </div>
  );
}
