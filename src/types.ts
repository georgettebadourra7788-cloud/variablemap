export type VariableRole =
  | 'independent'
  | 'dependent'
  | 'mediator'
  | 'moderator'
  | 'control'
  | 'predictor'
  | 'outcome'
  | 'covariate'
  | 'other'
  | 'not_specified';

export type MeasurementScale =
  | 'nominal'
  | 'ordinal'
  | 'interval'
  | 'ratio'
  | 'likert'
  | 'binary'
  | 'multiple_response'
  | 'other'
  | 'not_specified';

export type DataType = 'numeric' | 'string' | 'date' | 'not_specified';

export type ReverseCoded = 'yes' | 'no' | 'not_specified';

export type ResearchApproach = 'quantitative' | 'qualitative' | 'mixed' | 'not_specified';

export interface Dimension {
  id: string;
  name: string;
  description: string;
}

export interface Item {
  id: string;
  code: string;
  text: string;
  /** null = not assigned to a dimension */
  dimensionId: string | null;
  responseScale: string;
  reverseCoded: ReverseCoded;
  codingNotes: string;
}

export interface Variable {
  id: string;
  name: string;
  /** Short name as it will appear in the dataset, e.g. AI_ANX_TOTAL */
  datasetName: string;
  role: VariableRole;
  construct: string;
  conceptualDefinition: string;
  operationalDefinition: string;
  dimensions: Dimension[];
  items: Item[];
  measurementInstrument: string;
  instrumentSource: string;
  measurementScale: MeasurementScale;
  dataType: DataType;
  responseFormat: string;
  scoringMethod: string;
  plannedAnalysis: string;
  codingNotes: string;
  missingDataCode: string;
  sourceCitation: string;
  notes: string;
}

export interface Project {
  id: string;
  title: string;
  researchQuestion: string;
  approach: ResearchApproach;
  design: string;
  description: string;
  variables: Variable[];
  createdAt: string;
  updatedAt: string;
  isExample?: boolean;
}
