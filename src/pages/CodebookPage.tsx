import type { Project } from '../types';
import { paths } from '../router';
import { buildCodebook, CODEBOOK_COLUMNS, type CodebookColumn } from '../lib/codebook';
import { Card, EmptyState, LinkButton, SectionHeading } from '../components/ui';
import { ExportBar } from '../components/ExportBar';
import { PrintHeader } from '../components/PrintHeader';
import { fileSafe } from '../lib/export';

const NS = 'Not specified';

/** Columns that change per item; all others describe the variable and are merged across its rows. */
const ITEM_COLUMNS: CodebookColumn[] = ['Dimension', 'Indicator/Item', 'Coding'];

/** Relative widths (sum 100) so long text such as definitions gets room in print. */
const COLUMN_WIDTHS: Record<CodebookColumn, number> = {
  Variable: 7,
  Role: 7,
  Construct: 7,
  Definition: 17,
  Dimension: 8,
  'Indicator/Item': 11,
  Measurement: 9,
  Scale: 6,
  Coding: 9,
  'Missing Value': 6,
  'Planned Analysis': 7,
  Source: 6,
};
const show = (s: string) => s || NS;

export function CodebookPage({ project }: { project: Project }) {
  const rows = buildCodebook(project);
  const DETAIL: CodebookColumn[] = ['Role', 'Construct', 'Definition', 'Dimension', 'Measurement', 'Scale', 'Coding', 'Missing Value', 'Planned Analysis', 'Source'];

  return (
    <div>
      <div className="no-print">
        <SectionHeading
          title="Codebook"
          description="Generated from your variables, dimensions, and items. One row per indicator/item, with variable details shown once per variable. Variables without items appear as a single row. CSV export keeps full details on every row."
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
              <colgroup>
                {CODEBOOK_COLUMNS.map((c) => (
                  <col key={c} style={{ width: `${COLUMN_WIDTHS[c]}%` }} />
                ))}
              </colgroup>
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
                  const span = firstOfVar ? rows.filter((x) => x.variableId === r.variableId).length : 0;
                  // Variable-level fields are shown once per variable, merged down its item rows.
                  const cols = firstOfVar ? CODEBOOK_COLUMNS : CODEBOOK_COLUMNS.filter((c) => ITEM_COLUMNS.includes(c));
                  return (
                    <tr key={r.key} className={firstOfVar && i > 0 ? 'border-t-2 border-navy-100' : 'border-t border-slate-100'}>
                      {cols.map((c) => {
                        const merged = firstOfVar && !ITEM_COLUMNS.includes(c) && span > 1;
                        return (
                          <td
                            key={c}
                            rowSpan={merged ? span : undefined}
                            className={`px-3 py-2 ${merged ? 'border-r border-slate-100' : ''} ${c === 'Variable' ? 'font-semibold text-navy-900' : ''} ${c === 'Definition' ? 'min-w-64' : c === 'Indicator/Item' ? 'min-w-56' : 'min-w-28'}`}
                          >
                            {r[c] || <span className="text-slate-400">{NS}</span>}
                          </td>
                        );
                      })}
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
