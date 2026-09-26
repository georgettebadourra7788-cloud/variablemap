import { describe, expect, it } from 'vitest';
import { buildExampleProject } from '../../data/exampleProject';
import { buildCodebook, buildDataDictionary, CODEBOOK_COLUMNS, toDatasetName } from '../codebook';
import { toCSV, toTSV } from '../export';
import { reviewProject, reviewVariable } from '../review';
import { createItem, createVariable, duplicateProject, countItems } from '../factory';
import { normalizeProject } from '../storage';
import { canAdd, FREE_MAX_INDICATORS, FREE_MAX_PROJECTS, FREE_MAX_VARIABLES } from '../../config/plans';

describe('plan limits', () => {
  it('uses the central constants', () => {
    expect([FREE_MAX_PROJECTS, FREE_MAX_VARIABLES, FREE_MAX_INDICATORS]).toEqual([2, 10, 30]);
    expect(canAdd('projects', 1)).toBe(true);
    expect(canAdd('projects', 2)).toBe(false);
    expect(canAdd('variables', 10)).toBe(false);
    expect(canAdd('indicators', 29)).toBe(true);
    expect(canAdd('indicators', 30)).toBe(false);
  });
});

describe('review', () => {
  it('marks an empty variable as not specified, never complete', () => {
    const r = reviewVariable(createVariable());
    expect(r.counts.complete).toBe(0);
    expect(r.checks.find((c) => c.id === 'role')?.status).toBe('missing');
    expect(r.checks.every((c) => !/valid|reliable|correct/i.test(c.message))).toBe(true);
  });

  it('flags instrument without source, and items without reverse-coding answer', () => {
    const v = createVariable({
      name: 'X',
      measurementInstrument: 'Scale',
      items: [createItem({ code: 'X1', responseScale: '1-5' })],
    });
    const r = reviewVariable(v);
    expect(r.checks.find((c) => c.id === 'source')?.status).toBe('review');
    expect(r.checks.find((c) => c.id === 'coding')?.status).toBe('review');
    expect(r.checks.find((c) => c.id === 'coding')?.message).toMatch(/reverse coding is not specified for 1 item/i);
  });

  it('flags duplicate item codes across the project', () => {
    const p = buildExampleProject();
    p.variables[1].items[0].code = p.variables[0].items[0].code;
    expect(reviewProject(p).project.find((c) => c.id === 'codes')?.status).toBe('review');
  });
});

describe('codebook & dictionary', () => {
  const p = buildExampleProject();
  it('has one row per item', () => {
    const rows = buildCodebook(p);
    expect(rows).toHaveLength(countItems(p));
    expect(rows[0].Dimension).toBe('Learning anxiety');
    expect(rows[2].Coding).toContain('Reverse coded: Yes');
  });
  it('dictionary has a row per variable plus per item', () => {
    const rows = buildDataDictionary(p);
    expect(rows).toHaveLength(p.variables.length + countItems(p));
    expect(rows[0]['Variable name']).toBe('AIANX_TOTAL');
    expect(rows[0]['Measurement level']).toBe('Likert');
  });
  it('slugifies dataset names', () => {
    expect(toDatasetName('AI Anxiety (total)')).toBe('ai_anxiety_total');
    expect(toDatasetName('2nd wave')).toBe('v_2nd_wave');
  });
});

describe('export', () => {
  it('escapes CSV and neutralises formulas but keeps negative codes', () => {
    const csv = toCSV(['a', 'b'], [{ a: 'x, "y"', b: '=SUM(A1)' }, { a: '-99', b: '-cmd' }]);
    expect(csv.split('\r\n')[1]).toBe(`"x, ""y""",'=SUM(A1)`);
    expect(csv.split('\r\n')[2]).toBe(`-99,'-cmd`);
  });
  it('TSV strips tabs/newlines inside cells', () => {
    expect(toTSV(['a'], [{ a: 'x\ty\nz' }])).toBe('a\nx y z');
  });
  it('codebook columns match spec', () => {
    expect(CODEBOOK_COLUMNS).toContain('Missing Value');
  });
});

describe('storage normalisation & duplication', () => {
  it('repairs malformed data without throwing', () => {
    const p = normalizeProject({ title: 5, variables: [{ role: 'bogus', items: [{ dimensionId: 'missing', reverseCoded: 'maybe' }] }, 'junk'] });
    expect(p?.title).toBe('Untitled project');
    expect(p?.variables).toHaveLength(1);
    expect(p?.variables[0].role).toBe('not_specified');
    expect(p?.variables[0].items[0].dimensionId).toBeNull();
    expect(p?.variables[0].items[0].reverseCoded).toBe('not_specified');
    expect(normalizeProject('nope')).toBeNull();
  });
  it('duplicate gets new ids and keeps dimension links', () => {
    const p = buildExampleProject();
    const d = duplicateProject(p, 'Copy');
    expect(d.id).not.toBe(p.id);
    const v = d.variables[0];
    expect(v.id).not.toBe(p.variables[0].id);
    expect(v.items.every((i) => v.dimensions.some((dim) => dim.id === i.dimensionId))).toBe(true);
    expect(v.dimensions[0].id).not.toBe(p.variables[0].dimensions[0].id);
  });
});

describe('codebook text joining', () => {
  it('does not produce doubled punctuation', () => {
    const p = buildExampleProject();
    const def = buildCodebook(p)[0].Definition;
    expect(def).not.toMatch(/\.;/);
    expect(def).toMatch(/technologies\. Operational:/);
  });
});

describe('review improvements', () => {
  it('flags an unspecified data type', () => {
    const r = reviewVariable(createVariable({ name: 'X' }));
    expect(r.checks.find((c) => c.id === 'datatype')?.status).toBe('missing');
    expect(reviewVariable(createVariable({ dataType: 'numeric' })).checks.find((c) => c.id === 'datatype')?.status).toBe('complete');
  });

  it('names duplicate codes and flags them on every variable that uses them', () => {
    const a = createVariable({ name: 'Sleep Quality', items: [createItem({ code: 'SQ1', responseScale: 's', reverseCoded: 'no' })] });
    const b = createVariable({ name: 'Platforms Used', items: [createItem({ code: 'sq1', responseScale: 's', reverseCoded: 'no' })] });
    const p = { ...buildExampleProject(), variables: [a, b] };
    const rev = reviewProject(p);
    expect(rev.project.find((c) => c.id === 'codes')?.message).toContain('SQ1 (Sleep Quality, Platforms Used)');
    const sa = rev.variables[0].checks.find((c) => c.id === 'structure');
    const sb = rev.variables[1].checks.find((c) => c.id === 'structure');
    expect(sa?.status).toBe('review');
    expect(sa?.message).toContain('also used in Platforms Used');
    expect(sb?.message).toContain('also used in Sleep Quality');
  });
});
