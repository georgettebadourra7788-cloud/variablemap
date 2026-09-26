import type { Project, Variable } from '../types';

export type CheckStatus = 'complete' | 'review' | 'missing';

export interface ReviewCheck {
  id: string;
  label: string;
  status: CheckStatus;
  message: string;
  /** Plain-language description of the rule applied, shown for transparency. */
  rule: string;
}

export interface VariableReview {
  variableId: string;
  variableName: string;
  checks: ReviewCheck[];
  counts: Record<CheckStatus, number>;
}

export interface ProjectReview {
  project: ReviewCheck[];
  variables: VariableReview[];
  counts: Record<CheckStatus, number>;
}

export const MSG_MISSING = 'This information has not been specified.';
export const MSG_REVIEW = 'Consider reviewing this field.';

/** Definitions shorter than this many characters are flagged for review. */
const BRIEF_DEFINITION_CHARS = 20;

const filled = (s: string) => s.trim().length > 0;

function check(id: string, label: string, status: CheckStatus, rule: string, message?: string): ReviewCheck {
  const fallback = status === 'complete' ? 'Complete.' : status === 'missing' ? MSG_MISSING : MSG_REVIEW;
  return { id, label, status, rule, message: message ?? fallback };
}

function textCheck(id: string, label: string, value: string, rule: string): ReviewCheck {
  return check(id, label, filled(value) ? 'complete' : 'missing', rule);
}

function definitionCheck(id: string, label: string, value: string): ReviewCheck {
  const rule = `Complete when filled in. Flagged for review when shorter than ${BRIEF_DEFINITION_CHARS} characters.`;
  if (!filled(value)) return check(id, label, 'missing', rule);
  if (value.trim().length < BRIEF_DEFINITION_CHARS)
    return check(id, label, 'review', rule, 'This definition is very brief. Consider reviewing this field.');
  return check(id, label, 'complete', rule);
}

function tally(checks: ReviewCheck[]): Record<CheckStatus, number> {
  const c: Record<CheckStatus, number> = { complete: 0, review: 0, missing: 0 };
  for (const ch of checks) c[ch.status]++;
  return c;
}

export function reviewVariable(v: Variable, allVariables: Variable[] = [v]): VariableReview {
  const checks: ReviewCheck[] = [];

  const dupName =
    filled(v.name) &&
    allVariables.some((o) => o.id !== v.id && o.name.trim().toLowerCase() === v.name.trim().toLowerCase());
  checks.push(
    !filled(v.name)
      ? check('name', 'Variable name', 'missing', 'Complete when a name is entered and unique within the project.')
      : dupName
        ? check('name', 'Variable name', 'review', 'Complete when a name is entered and unique within the project.', 'Another variable in this project has the same name. Consider reviewing this field.')
        : check('name', 'Variable name', 'complete', 'Complete when a name is entered and unique within the project.'),
  );

  checks.push(
    check('role', 'Role', v.role === 'not_specified' ? 'missing' : 'complete', 'Complete when a role other than "Not specified" is selected.'),
  );
  checks.push(textCheck('construct', 'Construct/concept', v.construct, 'Complete when a construct or concept is entered.'));
  checks.push(definitionCheck('conceptual', 'Conceptual definition', v.conceptualDefinition));
  checks.push(definitionCheck('operational', 'Operational definition', v.operationalDefinition));

  // Measurement method
  {
    const rule = 'Complete when a measurement instrument or method is described, or indicators/items are listed.';
    if (filled(v.measurementInstrument)) checks.push(check('method', 'Measurement method', 'complete', rule));
    else if (v.items.length > 0)
      checks.push(check('method', 'Measurement method', 'review', rule, 'Items are listed but no instrument or method is named. Consider reviewing this field.'));
    else checks.push(check('method', 'Measurement method', 'missing', rule));
  }

  checks.push(
    check('scale', 'Measurement scale', v.measurementScale === 'not_specified' ? 'missing' : 'complete', 'Complete when a scale other than "Not specified" is selected.'),
  );

  // Coding
  {
    const rule =
      'Variable-level: complete when coding notes, scoring method, or response format is entered. With items: each item should have a response scale and a reverse-coding answer (Yes/No).';
    const varCoding = filled(v.codingNotes) || filled(v.scoringMethod) || filled(v.responseFormat);
    const noScale = v.items.filter((i) => !filled(i.responseScale)).length;
    const noReverse = v.items.filter((i) => i.reverseCoded === 'not_specified').length;
    const issues: string[] = [];
    if (noScale) issues.push(`${noScale} item${noScale === 1 ? ' has' : 's have'} no response scale`);
    if (noReverse) issues.push(`reverse coding is not specified for ${noReverse} item${noReverse === 1 ? '' : 's'}`);
    if (!varCoding && v.items.length === 0) checks.push(check('coding', 'Coding information', 'missing', rule));
    else if (issues.length > 0)
      checks.push(check('coding', 'Coding information', 'review', rule, `${capitalize(issues.join('; '))}. Consider reviewing this field.`));
    else checks.push(check('coding', 'Coding information', 'complete', rule));
  }

  checks.push(textCheck('missing', 'Missing-data code', v.missingDataCode, 'Complete when a missing-data code or note is entered.'));
  checks.push(textCheck('analysis', 'Planned analysis', v.plannedAnalysis, 'Complete when a planned analysis is described.'));

  // Source / citation — applicable when an instrument is named
  {
    const rule = 'When a measurement instrument is named, an instrument source or citation is expected.';
    const hasSource = filled(v.instrumentSource) || filled(v.sourceCitation);
    if (hasSource) checks.push(check('source', 'Source/citation', 'complete', rule));
    else if (filled(v.measurementInstrument))
      checks.push(check('source', 'Source/citation', 'review', rule, 'An instrument is named without a source or citation. Consider reviewing this field.'));
    else checks.push(check('source', 'Source/citation', 'missing', rule));
  }

  // Dimensions & items structure (only when used)
  if (v.dimensions.length > 0 || v.items.length > 0) {
    const rule = 'Each dimension should be named and have at least one item. When dimensions exist, each item should be assigned to one. Item codes should be filled in.';
    const problems: string[] = [];
    const unnamed = v.dimensions.filter((d) => !filled(d.name)).length;
    if (unnamed) problems.push(`${unnamed} dimension${unnamed === 1 ? ' is' : 's are'} unnamed`);
    const empty = v.dimensions.filter((d) => !v.items.some((i) => i.dimensionId === d.id));
    if (empty.length) problems.push(`${empty.length} dimension${empty.length === 1 ? ' has' : 's have'} no items`);
    if (v.dimensions.length > 0) {
      const unassigned = v.items.filter((i) => !i.dimensionId).length;
      if (unassigned) problems.push(`${unassigned} item${unassigned === 1 ? ' is' : 's are'} not assigned to a dimension`);
    }
    const noCode = v.items.filter((i) => !filled(i.code)).length;
    if (noCode) problems.push(`${noCode} item${noCode === 1 ? ' has' : 's have'} no item code`);
    checks.push(
      problems.length
        ? check('structure', 'Dimensions & items', 'review', rule, `${capitalize(problems.join('; '))}. Consider reviewing this field.`)
        : check('structure', 'Dimensions & items', 'complete', rule),
    );
  }

  return { variableId: v.id, variableName: v.name.trim() || 'Untitled variable', checks, counts: tally(checks) };
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function reviewProject(p: Project): ProjectReview {
  const project: ReviewCheck[] = [
    textCheck('rq', 'Research question', p.researchQuestion, 'Complete when a research question is entered.'),
    check('approach', 'Research approach', p.approach === 'not_specified' ? 'missing' : 'complete', 'Complete when an approach other than "Not specified" is selected.'),
    textCheck('design', 'Research design', p.design, 'Complete when a research design is entered.'),
    check('vars', 'Variables', p.variables.length > 0 ? 'complete' : 'missing', 'Complete when at least one variable is documented.', p.variables.length ? undefined : 'No variables have been added yet.'),
  ];

  // Duplicate item codes across the whole project matter for the dataset.
  const codes = new Map<string, number>();
  for (const v of p.variables) for (const i of v.items) {
    const c = i.code.trim().toLowerCase();
    if (c) codes.set(c, (codes.get(c) ?? 0) + 1);
  }
  const dups = [...codes.values()].filter((n) => n > 1).length;
  if (dups > 0)
    project.push(check('codes', 'Unique item codes', 'review', 'Item codes should be unique across the project so each maps to one dataset column.', `${dups} item code${dups === 1 ? ' is' : 's are'} used more than once. Consider reviewing this field.`));

  const variables = p.variables.map((v) => reviewVariable(v, p.variables));
  const counts = tally([...project, ...variables.flatMap((v) => v.checks)]);
  return { project, variables, counts };
}
