import type {
  DataType,
  Dimension,
  Item,
  MeasurementScale,
  Project,
  ResearchApproach,
  ReverseCoded,
  Variable,
  VariableRole,
} from '../types';
import { APPROACH_OPTIONS, DATA_TYPE_OPTIONS, REVERSE_OPTIONS, ROLE_OPTIONS, SCALE_OPTIONS } from './options';
import { newId } from './id';

export const STORAGE_KEY = 'variablemap:v1';

interface StoredState {
  version: 1;
  projects: Project[];
}

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback);
const oneOf = <T extends string>(opts: { value: T }[], v: unknown, fallback: T): T =>
  opts.some((o) => o.value === v) ? (v as T) : fallback;

function normalizeDimension(raw: unknown): Dimension | null {
  if (!isObj(raw)) return null;
  return { id: str(raw.id) || newId(), name: str(raw.name), description: str(raw.description) };
}

function normalizeItem(raw: unknown, dimIds: Set<string>): Item | null {
  if (!isObj(raw)) return null;
  const dimId = str(raw.dimensionId);
  return {
    id: str(raw.id) || newId(),
    code: str(raw.code),
    text: str(raw.text),
    dimensionId: dimId && dimIds.has(dimId) ? dimId : null,
    responseScale: str(raw.responseScale),
    reverseCoded: oneOf<ReverseCoded>(REVERSE_OPTIONS, raw.reverseCoded, 'not_specified'),
    codingNotes: str(raw.codingNotes),
  };
}

function normalizeVariable(raw: unknown): Variable | null {
  if (!isObj(raw)) return null;
  const dimensions = (Array.isArray(raw.dimensions) ? raw.dimensions : [])
    .map(normalizeDimension)
    .filter((d): d is Dimension => d !== null);
  const dimIds = new Set(dimensions.map((d) => d.id));
  const items = (Array.isArray(raw.items) ? raw.items : [])
    .map((i) => normalizeItem(i, dimIds))
    .filter((i): i is Item => i !== null);
  return {
    id: str(raw.id) || newId(),
    name: str(raw.name),
    datasetName: str(raw.datasetName),
    role: oneOf<VariableRole>(ROLE_OPTIONS, raw.role, 'not_specified'),
    construct: str(raw.construct),
    conceptualDefinition: str(raw.conceptualDefinition),
    operationalDefinition: str(raw.operationalDefinition),
    dimensions,
    items,
    measurementInstrument: str(raw.measurementInstrument),
    instrumentSource: str(raw.instrumentSource),
    measurementScale: oneOf<MeasurementScale>(SCALE_OPTIONS, raw.measurementScale, 'not_specified'),
    dataType: oneOf<DataType>(DATA_TYPE_OPTIONS, raw.dataType, 'not_specified'),
    responseFormat: str(raw.responseFormat),
    scoringMethod: str(raw.scoringMethod),
    plannedAnalysis: str(raw.plannedAnalysis),
    codingNotes: str(raw.codingNotes),
    missingDataCode: str(raw.missingDataCode),
    sourceCitation: str(raw.sourceCitation),
    notes: str(raw.notes),
  };
}

/** Validates untrusted data (localStorage or an imported file) into a Project. */
export function normalizeProject(raw: unknown): Project | null {
  if (!isObj(raw)) return null;
  const now = new Date().toISOString();
  return {
    id: str(raw.id) || newId(),
    title: str(raw.title) || 'Untitled project',
    researchQuestion: str(raw.researchQuestion),
    approach: oneOf<ResearchApproach>(APPROACH_OPTIONS, raw.approach, 'not_specified'),
    design: str(raw.design),
    description: str(raw.description),
    variables: (Array.isArray(raw.variables) ? raw.variables : [])
      .map(normalizeVariable)
      .filter((v): v is Variable => v !== null),
    createdAt: str(raw.createdAt) || now,
    updatedAt: str(raw.updatedAt) || now,
    isExample: raw.isExample === true,
  };
}

export type LoadResult = { ok: true; projects: Project[] } | { ok: false; projects: Project[]; error: string };

export function loadProjects(): LoadResult {
  let raw: string | null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
  } catch {
    return { ok: false, projects: [], error: 'Browser storage is unavailable. Changes cannot be saved in this browser session.' };
  }
  if (!raw) return { ok: true, projects: [] };
  try {
    const parsed: unknown = JSON.parse(raw);
    const list = isObj(parsed) && Array.isArray(parsed.projects) ? parsed.projects : [];
    return {
      ok: true,
      projects: list.map(normalizeProject).filter((p): p is Project => p !== null),
    };
  } catch {
    try {
      localStorage.setItem(`${STORAGE_KEY}:unreadable-backup`, raw);
    } catch {
      /* ignore */
    }
    return {
      ok: false,
      projects: [],
      error: `Saved data could not be read. A copy was kept in browser storage under "${STORAGE_KEY}:unreadable-backup".`,
    };
  }
}

export function saveProjects(projects: Project[]): string | null {
  const state: StoredState = { version: 1, projects };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return null;
  } catch {
    return 'Your latest changes could not be saved to browser storage (storage may be full or disabled). Export your work to keep a copy.';
  }
}
