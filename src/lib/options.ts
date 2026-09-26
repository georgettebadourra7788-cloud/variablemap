import type { DataType, MeasurementScale, ResearchApproach, ReverseCoded, VariableRole } from '../types';

export const ROLE_OPTIONS: { value: VariableRole; label: string }[] = [
  { value: 'not_specified', label: 'Not specified' },
  { value: 'independent', label: 'Independent' },
  { value: 'dependent', label: 'Dependent' },
  { value: 'mediator', label: 'Mediator' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'control', label: 'Control' },
  { value: 'predictor', label: 'Predictor' },
  { value: 'outcome', label: 'Outcome' },
  { value: 'covariate', label: 'Covariate' },
  { value: 'other', label: 'Other' },
];

export const SCALE_OPTIONS: { value: MeasurementScale; label: string }[] = [
  { value: 'not_specified', label: 'Not specified' },
  { value: 'nominal', label: 'Nominal' },
  { value: 'ordinal', label: 'Ordinal' },
  { value: 'interval', label: 'Interval' },
  { value: 'ratio', label: 'Ratio' },
  { value: 'likert', label: 'Likert' },
  { value: 'binary', label: 'Binary' },
  { value: 'multiple_response', label: 'Multiple response' },
  { value: 'other', label: 'Other' },
];

export const DATA_TYPE_OPTIONS: { value: DataType; label: string }[] = [
  { value: 'not_specified', label: 'Not specified' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'string', label: 'String / text' },
  { value: 'date', label: 'Date' },
];

export const REVERSE_OPTIONS: { value: ReverseCoded; label: string }[] = [
  { value: 'not_specified', label: 'Not specified' },
  { value: 'no', label: 'No' },
  { value: 'yes', label: 'Yes' },
];

export const APPROACH_OPTIONS: { value: ResearchApproach; label: string }[] = [
  { value: 'not_specified', label: 'Not specified' },
  { value: 'quantitative', label: 'Quantitative' },
  { value: 'qualitative', label: 'Qualitative' },
  { value: 'mixed', label: 'Mixed methods' },
];

export const DESIGN_SUGGESTIONS = [
  'Cross-sectional survey',
  'Correlational',
  'Experimental',
  'Quasi-experimental',
  'Longitudinal',
  'Case study',
  'Pre-test / post-test',
];

function labelFor<T extends string>(opts: { value: T; label: string }[], v: T): string {
  return opts.find((o) => o.value === v)?.label ?? 'Not specified';
}

export const roleLabel = (v: VariableRole) => labelFor(ROLE_OPTIONS, v);
export const scaleLabel = (v: MeasurementScale) => labelFor(SCALE_OPTIONS, v);
export const dataTypeLabel = (v: DataType) => labelFor(DATA_TYPE_OPTIONS, v);
export const reverseLabel = (v: ReverseCoded) => labelFor(REVERSE_OPTIONS, v);
export const approachLabel = (v: ResearchApproach) => labelFor(APPROACH_OPTIONS, v);
