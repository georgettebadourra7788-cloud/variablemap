import type { Project } from '../types';
import { paths } from '../router';
import { buildDataDictionary, DICTIONARY_COLUMNS } from '../lib/codebook';
import { Card, EmptyState, LinkButton, SectionHeading } from '../components/ui';
import { ExportBar } from '../components/ExportBar';
import { PrintHeader } from '../components/PrintHeader';
import { fileSafe } from '../lib/export';

export function DictionaryPage({ project }: { project: Project }) {
  const rows = buildDataDictionary(project);

  return (
    <div>
      <div className="no-print">
        <SectionHeading
          title="Data Dictionary"
          description="One row per column you expect in your dataset: each item, plus each variable’s overall (e.g. composite) score."
          action={
            <ExportBar label="Data Dictionary" filenameBase={`${fileSafe(project.title)}-data-dictionary`} columns={DICTIONARY_COLUMNS} rows={rows} disabled={rows.length === 0} />
          }
        />
        <p className="-mt-2 mb-4 text-xs text-slate-500">
          Variable names come from the “Dataset variable name” and item codes you enter. Variable type is the “Data type” you choose — it is never
          inferred.
        </p>
      </div>
      <PrintHeader project={project} title="Data dictionary" />

      {rows.length === 0 ? (
        <EmptyState title="Your data dictionary is empty" action={<LinkButton href={paths.variables(project.id)}>Add variables</LinkButton>}>
          Add at least one variable to generate a data dictionary.
        </EmptyState>
      ) : (
        <>
          <Card className="print-shell hidden overflow-x-auto md:block">
            <table className="print-table w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {DICTIONARY_COLUMNS.map((c) => (
                    <th key={c} scope="col" className="border-b border-slate-200 px-3 py-2.5 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="align-top text-slate-700">
                {rows.map((r) => (
                  <tr key={r.key} className={r.kind === 'variable' ? 'border-t-2 border-navy-100 bg-navy-50/40' : 'border-t border-slate-100'}>
                    {DICTIONARY_COLUMNS.map((c) => (
                      <td key={c} className={`px-3 py-2 ${c === 'Variable name' ? 'whitespace-nowrap font-mono font-semibold text-navy-900' : ''} ${c === 'Description' || c === 'Variable label' ? 'min-w-56' : ''}`}>
                        {r[c] || <span className="text-slate-400">Not specified</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          <ul className="no-print space-y-3 md:hidden">
            {rows.map((r) => (
              <li key={r.key}>
                <Card className={`p-4 ${r.kind === 'item' ? 'ml-3' : ''}`}>
                  <p className="font-mono text-sm font-semibold text-navy-900">{r['Variable name']}</p>
                  {r['Variable label'] && <p className="mt-0.5 text-sm text-slate-800">{r['Variable label']}</p>}
                  <dl className="mt-3 grid grid-cols-[120px_1fr] gap-x-3 gap-y-1.5 text-xs">
                    {DICTIONARY_COLUMNS.slice(2).map((c) => (
                      <div key={c} className="contents">
                        <dt className="font-medium text-slate-500">{c}</dt>
                        <dd className={r[c] ? 'text-slate-800' : 'text-slate-400'}>{r[c] || 'Not specified'}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
