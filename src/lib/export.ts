/**
 * Stops spreadsheets from treating text as a formula. Excel evaluates any cell
 * starting with = + - @, so "-99 = No response" became #NAME?. Plain numbers
 * ("-99", "+1.5") stay numeric; other such text gets an invisible leading tab
 * so it opens as text.
 */
function safeCell(value: string): string {
  if (/^[+-]?\d+(\.\d+)?$/.test(value)) return value;
  if (/^[=+\-@\r]/.test(value)) return `\t${value}`;
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

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** A bordered HTML table; Word and Google Docs paste this as a real table. */
export function toHTMLTable(columns: readonly string[], rows: Record<string, string>[]): string {
  const cell = 'border:1px solid #94a3b8;padding:4px 6px;vertical-align:top;font-family:Calibri,Arial,sans-serif;font-size:9pt;';
  const head = columns.map((c) => `<th style="${cell}background:#f1f5f9;text-align:left;">${escapeHtml(c)}</th>`).join('');
  const body = rows
    .map((r) => `<tr>${columns.map((c) => `<td style="${cell}">${escapeHtml(r[c] ?? '')}</td>`).join('')}</tr>`)
    .join('');
  return `<table style="border-collapse:collapse;"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

/**
 * Copies a table as both HTML (Word, Google Docs) and tab-separated text (Excel, Sheets).
 * Falls back to selecting a rendered table, then to plain text.
 */
export async function copyTable(columns: readonly string[], rows: Record<string, string>[]): Promise<boolean> {
  const html = toHTMLTable(columns, rows);
  const text = toTSV(columns, rows);
  try {
    if (navigator.clipboard && 'write' in navigator.clipboard && typeof ClipboardItem !== 'undefined' && window.isSecureContext) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([html], { type: 'text/html' }),
          'text/plain': new Blob([text], { type: 'text/plain' }),
        }),
      ]);
      return true;
    }
  } catch {
    /* try the selection-based fallback */
  }
  try {
    const host = document.createElement('div');
    host.style.position = 'fixed';
    host.style.left = '-9999px';
    host.innerHTML = html;
    document.body.appendChild(host);
    const range = document.createRange();
    range.selectNodeContents(host);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
    const ok = document.execCommand('copy');
    sel?.removeAllRanges();
    host.remove();
    if (ok) return true;
  } catch {
    /* fall through to plain text */
  }
  return copyText(text);
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
