import { useRef, useState } from 'react';
import { canAdd } from '../config/plans';
import { useProjects } from '../state/ProjectsContext';
import { navigate, paths } from '../router';
import { countItems } from '../lib/factory';
import { downloadProjectBackup, parseBackup } from '../lib/backup';
import { Badge, Button, Card, EmptyState, LinkButton, TextField } from '../components/ui';
import { ConfirmDialog, Dialog } from '../components/Dialog';
import { LimitNotice, ProComingSoonCard, UsageMeter } from '../components/Plans';
import { LocalStorageNotice } from '../components/LocalStorageNotice';
import { useToast } from '../components/Toast';
import type { Project } from '../types';

export function ProjectsPage() {
  const { projects, duplicate, deleteProject, updateProject, loadExample, importProject } = useProjects();
  const toast = useToast();
  const [toDelete, setToDelete] = useState<Project | null>(null);
  const [toRename, setToRename] = useState<Project | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const atLimit = !canAdd('projects', projects.length);

  const onDuplicate = (p: Project) => {
    const res = duplicate(p.id);
    if (res.ok) toast(`Duplicated “${p.title}”.`);
    else toast('Project limit reached — the project was not duplicated.', 'error');
  };

  const onExample = () => {
    const res = loadExample();
    if (res.ok) navigate(paths.overview(res.id));
    else toast('Project limit reached — delete a project to load the example.', 'error');
  };

  const onImport = async (file: File) => {
    if (file.size > 5_000_000) {
      toast('That file is too large to be a VariableMap backup.', 'error');
      return;
    }
    const raw = parseBackup(await file.text());
    if (!raw) {
      toast('That file is not a VariableMap project backup.', 'error');
      return;
    }
    const res = importProject(raw);
    if (res.ok) toast('Backup imported as a new project.');
    else if (res.reason === 'limit') toast('Project limit reached — delete a project before importing.', 'error');
    else toast('The backup could not be read.', 'error');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">My projects</h1>
          <p className="mt-1 text-slate-600">Create, open, and manage your research codebook projects.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <LinkButton href={paths.newProject()} aria-disabled={atLimit} className={atLimit ? 'pointer-events-none opacity-50' : ''} tabIndex={atLimit ? -1 : undefined}>
            + Create project
          </LinkButton>
          <Button variant="secondary" onClick={onExample} disabled={atLimit}>
            Load example project
          </Button>
          <Button variant="ghost" onClick={() => fileInput.current?.click()} disabled={atLimit}>
            Import backup
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            aria-label="Import a VariableMap backup file"
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = '';
              if (f) void onImport(f);
            }}
          />
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {atLimit && <LimitNotice kind="projects" />}
          {projects.length === 0 ? (
            <EmptyState
              title="No projects yet"
              action={
                <>
                  <LinkButton href={paths.newProject()}>+ Create project</LinkButton>
                  <Button variant="secondary" onClick={onExample}>
                    Load example project
                  </Button>
                </>
              }
            >
              Start a new project, or load the example “AI Anxiety Among Undergraduate University Students” to see how VariableMap works. The
              example counts as one of your saved projects and can be deleted at any time.
            </EmptyState>
          ) : (
            <ul className="space-y-3">
              {projects.map((p) => (
                <li key={p.id}>
                  <Card className="p-4 sm:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <a href={paths.overview(p.id)} className="font-serif text-lg font-semibold text-navy-900 hover:underline">
                            {p.title || 'Untitled project'}
                          </a>
                          {p.isExample && <Badge tone="slate">Example</Badge>}
                        </div>
                        {p.researchQuestion && <p className="mt-1 line-clamp-2 text-sm text-slate-600">{p.researchQuestion}</p>}
                        <p className="mt-2 text-xs text-slate-500">
                          {p.variables.length} variable{p.variables.length === 1 ? '' : 's'} · {countItems(p)} item{countItems(p) === 1 ? '' : 's'} · Updated{' '}
                          {new Date(p.updatedAt).toLocaleString()}
                        </p>
                      </div>
                      <LinkButton href={paths.overview(p.id)} size="sm" className="self-start">
                        Open
                      </LinkButton>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1 border-t border-slate-100 pt-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRenameValue(p.title);
                          setToRename(p);
                        }}
                      >
                        Rename
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onDuplicate(p)} disabled={atLimit} title={atLimit ? 'Project limit reached' : undefined}>
                        Duplicate
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => downloadProjectBackup(p)}>
                        Download backup
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-700 hover:bg-red-50" onClick={() => setToDelete(p)}>
                        Delete
                      </Button>
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
          <LocalStorageNotice />
        </div>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold">Free plan usage</h2>
            <div className="mt-3">
              <UsageMeter kind="projects" count={projects.length} />
            </div>
            <p className="mt-3 text-xs text-slate-500">Free — $0 — Free Forever. No account required. No credit card required.</p>
          </Card>
          <ProComingSoonCard compact />
        </aside>
      </div>

      <ConfirmDialog
        open={toDelete !== null}
        title="Delete this project?"
        confirmLabel="Delete project"
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          if (toDelete) {
            deleteProject(toDelete.id);
            toast(`Deleted “${toDelete.title}”.`);
          }
          setToDelete(null);
        }}
      >
        <p>
          “<strong>{toDelete?.title}</strong>” and all of its variables, dimensions, and items will be permanently removed from this browser. This cannot be
          undone.
        </p>
        <p className="mt-2">If you might need it later, cancel and use “Download backup” first.</p>
      </ConfirmDialog>

      <Dialog
        open={toRename !== null}
        title="Rename project"
        onClose={() => setToRename(null)}
        footer={
          <>
            <Button variant="secondary" onClick={() => setToRename(null)}>
              Cancel
            </Button>
            <Button type="submit" form="rename-form" disabled={!renameValue.trim()}>
              Save name
            </Button>
          </>
        }
      >
        <form
          id="rename-form"
          onSubmit={(e) => {
            e.preventDefault();
            if (toRename && renameValue.trim()) {
              updateProject(toRename.id, { title: renameValue.trim() });
              toast('Project renamed.');
            }
            setToRename(null);
          }}
        >
          <TextField label="Project title" value={renameValue} onChange={setRenameValue} autoFocus required />
        </form>
      </Dialog>
    </div>
  );
}
