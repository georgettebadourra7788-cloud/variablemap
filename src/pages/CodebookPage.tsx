import type { Project } from '../types';
import { paths } from '../router';
import { buildCodebook, CODEBOOK_COLUMNS, type CodebookColumn } from '../lib/codebook';
import { Card, EmptyState, LinkButton, SectionHeading } from '../components/ui';
import { ExportBar } from '../components/ExportBar';
import { PrintHeader } from '../components/PrintHeader';
import { fileSafe } from '../lib/export';

const NS = 'Not specified';
const show = (s: string) => s || NS;

export function CodebookPage({ project }: { project: Project }) {
  const rows = buildCodebook(project);
  const DETAIL: CodebookColumn[] = ['Role', 'Construct', 'Definition', 'Dimension', 'Measurement', 'Scale', 'Coding', 'Missing Value', 'Planned Analysis', 'Source'];

  return (
    <div>
      <div className="no-print">
        <SectionHeading
          title="Codebook"
          description="Generated from your variables, dimensions, and items. One row per indicator/item; variables without items appear as a single row."
          action={<ExportBar label="Codebook" filenameBase={`${fileSafe(project.title)}-codebook`} columns={CODEBOOK_COLUMNS} rows={rows} disabled={rows.length === 0} />}
        />
      </div>
      <PrintHeader project={project} title="Research codebook" />

      {rows.length === 0 ? (
        <EmptyState title="Your codebook is empty" action={<LinkButton href={paths.variables(project.id)}>Add variables</LinkButton>}>
          Add at least one variable to generate a codebook.
        </EmptyState>
      ) : (
        <>
          {/* Wide screens and print: full table */}
          <Card className="print-shell hidden overflow-x-auto lg:block">
            <table className="print-table w-full border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  {CODEBOOK_COLUMNS.map((c) => (
                    <th key={c} scope="col" className="border-b border-slate-200 px-3 py-2.5 font-semibold">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="align-top text-slate-700">
                {rows.map((r, i) => {
                  const firstOfVar = i === 0 || rows[i - 1].variableId !== r.variableId;
                  return (
                    <tr key={r.key} className={firstOfVar && i > 0 ? 'border-t-2 border-navy-100' : 'border-t border-slate-100'}>
                      {CODEBOOK_COLUMNS.map((c) => (
                        <td key={c} className={`px-3 py-2 ${c === 'Variable' ? 'font-semibold text-navy-900' : ''} ${c === 'Definition' ? 'min-w-64' : c === 'Indicator/Item' ? 'min-w-56' : 'min-w-28'}`}>
                          {r[c] || <span className="text-slate-400">{NS}</span>}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Small screens: stacked cards */}
          <ul className="no-print space-y-3 lg:hidden">
            {rows.map((r) => (
              <li key={r.key}>
                <Card className="p-4">
                  <p className="font-serif text-base font-semibold text-navy-900">{r.Variable}</p>
                  {r['Indicator/Item'] && <p className="mt-1 text-sm text-slate-800">{r['Indicator/Item']}</p>}
                  <dl className="mt-3 grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 text-xs">
                    {DETAIL.map((c) => (
                      <div key={c} className="contents">
                        <dt className="font-medium text-slate-500">{c}</dt>
                        <dd className={r[c] ? 'text-slate-800' : 'text-slate-400'}>{show(r[c])}</dd>
                      </div>
                    ))}
                  </dl>
                </Card>
              </li>
            ))}
          </ul>
          <p className="no-print mt-4 text-xs text-slate-500">
            Tip: “Copy Codebook” copies a table you can paste into Word, Google Docs, Excel, or Google Sheets. In Word, switch the page to landscape (Layout → Orientation) so all 12 columns fit.
          </p>
        </>
      )}
    </div>
  );
}
