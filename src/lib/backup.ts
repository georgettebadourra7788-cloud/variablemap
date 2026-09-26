import type { Project } from '../types';
import { downloadFile, fileSafe } from './export';

export const BACKUP_FORMAT = 'variablemap-project';

export function downloadProjectBackup(p: Project) {
  const payload = { format: BACKUP_FORMAT, version: 1, exportedAt: new Date().toISOString(), project: p };
  downloadFile(`${fileSafe(p.title)}-variablemap-backup.json`, JSON.stringify(payload, null, 2), 'application/json');
}

/** Returns the raw project object from a backup file, or null if the file is not a VariableMap backup. */
export function parseBackup(text: string): unknown | null {
  try {
    const data: unknown = JSON.parse(text);
    if (typeof data === 'object' && data !== null && (data as Record<string, unknown>).format === BACKUP_FORMAT) {
      return (data as Record<string, unknown>).project ?? null;
    }
    return null;
  } catch {
    return null;
  }
}
