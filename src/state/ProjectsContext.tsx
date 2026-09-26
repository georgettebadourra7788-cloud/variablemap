import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Dimension, Item, Project, Variable } from '../types';
import { canAdd } from '../config/plans';
import { countItems, createDimension, createItem, createProject, createVariable, duplicateProject } from '../lib/factory';
import { loadProjects, normalizeProject, saveProjects, STORAGE_KEY } from '../lib/storage';
import { buildExampleProject } from '../data/exampleProject';

export type AddResult = { ok: true; id: string } | { ok: false; reason: 'limit' | 'not_found' | 'invalid' };

interface ProjectsApi {
  projects: Project[];
  storageError: string | null;
  getProject: (id: string) => Project | undefined;
  addProject: (partial?: Partial<Project>) => AddResult;
  updateProject: (id: string, patch: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  duplicate: (id: string) => AddResult;
  loadExample: () => AddResult;
  importProject: (raw: unknown) => AddResult;
  addVariable: (projectId: string) => AddResult;
  updateVariable: (projectId: string, variableId: string, patch: Partial<Variable> | ((v: Variable) => Variable)) => void;
  deleteVariable: (projectId: string, variableId: string) => void;
  addDimension: (projectId: string, variableId: string) => string | null;
  updateDimension: (projectId: string, variableId: string, dimensionId: string, patch: Partial<Dimension>) => void;
  /** Removes the dimension only; its items are kept and become unassigned. */
  deleteDimension: (projectId: string, variableId: string, dimensionId: string) => void;
  addItem: (projectId: string, variableId: string, dimensionId: string | null) => AddResult;
  updateItem: (projectId: string, variableId: string, itemId: string, patch: Partial<Item>) => void;
  deleteItem: (projectId: string, variableId: string, itemId: string) => void;
}

const Ctx = createContext<ProjectsApi | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const initial = useRef(loadProjects());
  const [projects, setProjects] = useState<Project[]>(initial.current.projects);
  const [storageError, setStorageError] = useState<string | null>(initial.current.ok ? null : initial.current.error);
  const skipSave = useRef(true);
  // Mirror of the latest state so actions can check limits synchronously.
  const latest = useRef(projects);
  latest.current = projects;

  useEffect(() => {
    if (skipSave.current) {
      skipSave.current = false;
      return;
    }
    const err = saveProjects(projects);
    setStorageError(err);
  }, [projects]);

  // Keep multiple open tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const res = loadProjects();
      if (res.ok) {
        skipSave.current = true;
        setProjects(res.projects);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const touch = (p: Project): Project => ({ ...p, updatedAt: new Date().toISOString() });

  const mapProject = useCallback((id: string, fn: (p: Project) => Project) => {
    setProjects((prev) => prev.map((p) => (p.id === id ? touch(fn(p)) : p)));
  }, []);

  const mapVariable = useCallback(
    (pid: string, vid: string, fn: (v: Variable) => Variable) =>
      mapProject(pid, (p) => ({ ...p, variables: p.variables.map((v) => (v.id === vid ? fn(v) : v)) })),
    [mapProject],
  );

  const insertProject = useCallback((p: Project): AddResult => {
    if (!canAdd('projects', latest.current.length)) return { ok: false, reason: 'limit' };
    latest.current = [p, ...latest.current];
    setProjects((prev) => [p, ...prev]);
    return { ok: true, id: p.id };
  }, []);

  const api = useMemo<ProjectsApi>(
    () => ({
      projects,
      storageError,
      getProject: (id) => projects.find((p) => p.id === id),
      addProject: (partial) => insertProject(createProject(partial)),
      updateProject: (id, patch) => mapProject(id, (p) => ({ ...p, ...patch })),
      deleteProject: (id) => setProjects((prev) => prev.filter((p) => p.id !== id)),
      duplicate: (id) => {
        const src = latest.current.find((p) => p.id === id);
        if (!src) return { ok: false, reason: 'not_found' };
        return insertProject(duplicateProject(src, `${src.title} (copy)`));
      },
      loadExample: () => insertProject(buildExampleProject()),
      importProject: (raw) => {
        const p = normalizeProject(raw);
        if (!p) return { ok: false, reason: 'invalid' };
        const now = new Date().toISOString();
        // Always import as a new project so an existing one is never overwritten.
        return insertProject({ ...duplicateProject(p, p.title), createdAt: p.createdAt || now });
      },
      addVariable: (pid) => {
        const p = latest.current.find((x) => x.id === pid);
        if (!p) return { ok: false, reason: 'not_found' };
        if (!canAdd('variables', p.variables.length)) return { ok: false, reason: 'limit' };
        const v = createVariable();
        latest.current = latest.current.map((x) => (x.id === pid ? { ...x, variables: [...x.variables, v] } : x));
        mapProject(pid, (x) => ({ ...x, variables: [...x.variables, v] }));
        return { ok: true, id: v.id };
      },
      updateVariable: (pid, vid, patch) =>
        mapVariable(pid, vid, (v) => (typeof patch === 'function' ? patch(v) : { ...v, ...patch })),
      deleteVariable: (pid, vid) => mapProject(pid, (p) => ({ ...p, variables: p.variables.filter((v) => v.id !== vid) })),
      addDimension: (pid, vid) => {
        const d = createDimension();
        mapVariable(pid, vid, (v) => ({ ...v, dimensions: [...v.dimensions, d] }));
        return d.id;
      },
      updateDimension: (pid, vid, did, patch) =>
        mapVariable(pid, vid, (v) => ({ ...v, dimensions: v.dimensions.map((d) => (d.id === did ? { ...d, ...patch } : d)) })),
      deleteDimension: (pid, vid, did) =>
        mapVariable(pid, vid, (v) => ({
          ...v,
          dimensions: v.dimensions.filter((d) => d.id !== did),
          items: v.items.map((i) => (i.dimensionId === did ? { ...i, dimensionId: null } : i)),
        })),
      addItem: (pid, vid, did) => {
        const p = latest.current.find((x) => x.id === pid);
        const v = p?.variables.find((x) => x.id === vid);
        if (!p || !v) return { ok: false, reason: 'not_found' };
        if (!canAdd('indicators', countItems(p))) return { ok: false, reason: 'limit' };
        const prevItem = v.items[v.items.length - 1];
        // Convenience only: carry over the previous response scale. Reverse coding is never assumed.
        const it = createItem({ dimensionId: did, responseScale: prevItem?.responseScale ?? '' });
        latest.current = latest.current.map((x) =>
          x.id === pid
            ? { ...x, variables: x.variables.map((y) => (y.id === vid ? { ...y, items: [...y.items, it] } : y)) }
            : x,
        );
        mapVariable(pid, vid, (y) => ({ ...y, items: [...y.items, it] }));
        return { ok: true, id: it.id };
      },
      updateItem: (pid, vid, iid, patch) =>
        mapVariable(pid, vid, (v) => ({ ...v, items: v.items.map((i) => (i.id === iid ? { ...i, ...patch } : i)) })),
      deleteItem: (pid, vid, iid) => mapVariable(pid, vid, (v) => ({ ...v, items: v.items.filter((i) => i.id !== iid) })),
    }),
    [projects, storageError, insertProject, mapProject, mapVariable],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useProjects(): ProjectsApi {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProjects must be used inside ProjectsProvider');
  return ctx;
}

