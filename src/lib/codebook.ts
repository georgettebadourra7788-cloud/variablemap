import type { Item, Project, Variable } from '../types';
import { dataTypeLabel, reverseLabel, roleLabel, scaleLabel } from './options';

export const CODEBOOK_COLUMNS = [
  'Variable',
  'Role',
  'Construct',
  'Definition',
  'Dimension',
  'Indicator/Item',
  'Measurement',
  'Scale',
  'Coding',
  'Missing Value',
  'Planned Analysis',
  'Source',
] as const;

export type CodebookColumn = (typeof CODEBOOK_COLUMNS)[number];
export type CodebookRow = Record<CodebookColumn, string> & { key: string; variableId: string };

/** Joins non-empty parts; avoids doubled punctuation such as ".;" when a part already ends a sentence. */
const join = (parts: (string | false | undefined)[], sep = '; ') =>
  parts
    .filter((p): p is string => typeof p === 'string' && p.trim().length > 0)
    .map((p) => p.trim())
    .reduce((acc, p) => (acc ? (sep === '; ' && /[.;:!?]$/.test(acc) ? `${acc} ${p}` : `${acc}${sep}${p}`) : p), '');

function definition(v: Variable) {
  return join([
    v.conceptualDefinition && `Conceptual: ${v.conceptualDefinition}`,
    v.operationalDefinition && `Operational: ${v.operationalDefinition}`,
  ]);
}

function measurement(v: Variable) {
  return join([v.measurementInstrument, v.responseFormat && `Response format: ${v.responseFormat}`]);
}

function variableCoding(v: Variable) {
  return join([v.scoringMethod && `Scoring: ${v.scoringMethod}`, v.codingNotes]);
}

function itemCoding(v: Variable, it: Item) {
  return join([
    (it.responseScale || v.responseFormat) && `Response: ${it.responseScale || v.responseFormat}`,
    `Reverse coded: ${reverseLabel(it.reverseCoded)}`,
    it.codingNotes,
  ]);
}

function source(v: Variable) {
  return join([v.instrumentSource, v.sourceCitation].filter((s, i, a) => a.indexOf(s) === i));
}

export function itemLabel(it: Item) {
  return join([it.code, it.text], ' — ');
}

/** One row per item; variables without items get a single variable-level row. */
export function buildCodebook(p: Project): CodebookRow[] {
  const rows: CodebookRow[] = [];
  for (const v of p.variables) {
    const base = {
      variableId: v.id,
      Variable: v.name || 'Untitled variable',
      Role: roleLabel(v.role),
      Construct: v.construct,
      Definition: definition(v),
      Measurement: measurement(v),
      Scale: scaleLabel(v.measurementScale),
      'Missing Value': v.missingDataCode,
      'Planned Analysis': v.plannedAnalysis,
      Source: source(v),
    };
    if (v.items.length === 0) {
      const dims = v.dimensions.map((d) => d.name).filter(Boolean).join('; ');
      rows.push({ ...base, key: v.id, Dimension: dims, 'Indicator/Item': '', Coding: variableCoding(v) });
      continue;
    }
    for (const it of v.items) {
      const dim = v.dimensions.find((d) => d.id === it.dimensionId);
      rows.push({
        ...base,
        key: it.id,
        Dimension: dim?.name ?? '',
        'Indicator/Item': itemLabel(it),
        Coding: itemCoding(v, it),
      });
    }
  }
  return rows;
}

export const DICTIONARY_COLUMNS = [
  'Variable name',
  'Variable label',
  'Variable type',
  'Role',
  'Coding',
  'Missing value',
  'Measurement level',
  'Description',
] as const;

export type DictionaryColumn = (typeof DICTIONARY_COLUMNS)[number];
export type DictionaryRow = Record<DictionaryColumn, string> & { key: string; kind: 'variable' | 'item' };

/** Turns "AI Anxiety" into "ai_anxiety" for a dataset-friendly fallback name. */
export function toDatasetName(s: string) {
  return (
    s
      .normalize('NFKD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .replace(/^(\d)/, 'v_$1') || 'variable'
  );
}

/**
 * Data dictionary: one row per dataset column. Each item is a column; each
 * variable also gets a row for its variable-level (e.g. total/composite) score.
 */
export function buildDataDictionary(p: Project): DictionaryRow[] {
  const rows: DictionaryRow[] = [];
  for (const v of p.variables) {
    const vName = v.datasetName.trim() || toDatasetName(v.name);
    rows.push({
      key: v.id,
      kind: 'variable',
      'Variable name': vName,
      'Variable label': v.name || 'Untitled variable',
      'Variable type': dataTypeLabel(v.dataType),
      Role: roleLabel(v.role),
      Coding: join([v.responseFormat, variableCoding(v)]),
      'Missing value': v.missingDataCode,
      'Measurement level': scaleLabel(v.measurementScale),
      Description: join([
        v.operationalDefinition || v.conceptualDefinition,
        v.items.length > 0 && `Based on ${v.items.length} item${v.items.length === 1 ? '' : 's'}.`,
      ], ' '),
    });
    for (const it of v.items) {
      const dim = v.dimensions.find((d) => d.id === it.dimensionId);
      rows.push({
        key: it.id,
        kind: 'item',
        'Variable name': it.code.trim() || `${vName}_item`,
        'Variable label': it.text,
        'Variable type': dataTypeLabel(v.dataType),
        Role: `Item of ${v.name || 'Untitled variable'}`,
        Coding: itemCoding(v, it),
        'Missing value': v.missingDataCode,
        'Measurement level': scaleLabel(v.measurementScale),
        Description: join([dim && `Dimension: ${dim.name}`, v.construct && `Construct: ${v.construct}`]),
      });
    }
  }
  return rows;
}
