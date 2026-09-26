/**
 * Neutralises spreadsheet formula injection while keeping values such as
 * missing-data codes ("-99") intact.
 */
function safeCell(value: string): string {
  if (/^[=+@\t\r]/.test(value) || /^-[^0-9.]/.test(value)) return `'${value}`;
  return value;
}

export function toCSV(columns: readonly string[], rows: Record<string, string>[]): string {
  const esc = (v: string) => {
    const s = safeCell(v ?? '');
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [columns.map(esc).join(','), ...rows.map((r) => columns.map((c) => esc(r[c])).join(','))];
  return lines.join('\r\n');
}

/** Tab-separated text pastes cleanly into Word, Google Docs, and spreadsheets as a table. */
export function toTSV(columns: readonly string[], rows: Record<string, string>[]): string {
  const clean = (v: string) => (v ?? '').replace(/[\t\r\n]+/g, ' ').trim();
  return [columns.join('\t'), ...rows.map((r) => columns.map((c) => clean(r[c])).join('\t'))].join('\n');
}

export function downloadFile(filename: string, content: string, mime: string) {
  // BOM so Excel opens UTF-8 CSV correctly.
  const blob = new Blob([mime.startsWith('text/csv') ? '﻿' + content : content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch {
    return false;
  }
}

export function fileSafe(name: string) {
  return name.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase().slice(0, 60) || 'project';
}
