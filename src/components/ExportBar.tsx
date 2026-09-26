import { Button } from './ui';
import { useToast } from './Toast';
import { copyTable, downloadFile, fileSafe, toCSV } from '../lib/export';

export function ExportBar({
  label,
  filenameBase,
  columns,
  rows,
  disabled,
}: {
  label: string;
  filenameBase: string;
  columns: readonly string[];
  rows: Record<string, string>[];
  disabled?: boolean;
}) {
  const toast = useToast();
  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={async () => {
          const ok = await copyTable(columns, rows);
          toast(ok ? `${label} copied — paste into Word, Google Docs, or a spreadsheet.` : 'Copy failed. Try Download CSV instead.', ok ? 'success' : 'error');
        }}
      >
        Copy {label}
      </Button>
      <Button
        variant="secondary"
        disabled={disabled}
        onClick={() => {
          downloadFile(`${fileSafe(filenameBase)}.csv`, toCSV(columns, rows), 'text/csv;charset=utf-8');
          toast('CSV downloaded.');
        }}
      >
        Download CSV
      </Button>
      <Button disabled={disabled} onClick={() => window.print()}>
        Print {label}
      </Button>
    </div>
  );
}
