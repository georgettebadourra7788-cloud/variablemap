import type { Dimension, Item, Project, Variable } from '../types';
import { newId } from './id';

export function createProject(partial: Partial<Project> = {}): Project {
  const now = new Date().toISOString();
  return {
    id: newId(),
    title: 'Untitled project',
    researchQuestion: '',
    approach: 'not_specified',
    design: '',
    description: '',
    variables: [],
    createdAt: now,
    updatedAt: now,
    ...partial,
  };
}

export function createVariable(partial: Partial<Variable> = {}): Variable {
  return {
    id: newId(),
    name: '',
    datasetName: '',
    role: 'not_specified',
    construct: '',
    conceptualDefinition: '',
    operationalDefinition: '',
    dimensions: [],
    items: [],
    measurementInstrument: '',
    instrumentSource: '',
    measurementScale: 'not_specified',
    dataType: 'not_specified',
    responseFormat: '',
    scoringMethod: '',
    plannedAnalysis: '',
    codingNotes: '',
    missingDataCode: '',
    sourceCitation: '',
    notes: '',
    ...partial,
  };
}

export function createDimension(partial: Partial<Dimension> = {}): Dimension {
  return { id: newId(), name: '', description: '', ...partial };
}

export function createItem(partial: Partial<Item> = {}): Item {
  return {
    id: newId(),
    code: '',
    text: '',
    dimensionId: null,
    responseScale: '',
    reverseCoded: 'not_specified',
    codingNotes: '',
    ...partial,
  };
}

/** Deep copy with fresh ids, keeping item→dimension links intact. */
export function duplicateProject(p: Project, title: string): Project {
  const now = new Date().toISOString();
  return {
    ...structuredClone(p),
    id: newId(),
    title,
    createdAt: now,
    updatedAt: now,
    isExample: false,
    variables: p.variables.map((v) => {
      const dimMap = new Map<string, string>();
      const dimensions = v.dimensions.map((d) => {
        const id = newId();
        dimMap.set(d.id, id);
        return { ...d, id };
      });
      return {
        ...structuredClone(v),
        id: newId(),
        dimensions,
        items: v.items.map((it) => ({
          ...it,
          id: newId(),
          dimensionId: it.dimensionId ? (dimMap.get(it.dimensionId) ?? null) : null,
        })),
      };
    }),
  };
}

export function countItems(p: Project): number {
  return p.variables.reduce((n, v) => n + v.items.length, 0);
}
