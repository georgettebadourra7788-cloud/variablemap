import { useState } from 'react';
import { canAdd } from '../config/plans';
import { useProjects } from '../state/ProjectsContext';
import { navigate, paths } from '../router';
import { Button, Card, LinkButton } from '../components/ui';
import { ProjectFields } from '../components/ProjectFields';
import { LimitNotice } from '../components/Plans';
import type { Project } from '../types';

export function NewProjectPage() {
  const { projects, addProject } = useProjects();
  const [form, setForm] = useState<Pick<Project, 'title' | 'researchQuestion' | 'approach' | 'design' | 'description'>>({
    title: '',
    researchQuestion: '',
    approach: 'not_specified',
    design: '',
    description: '',
  });
  const [error, setError] = useState<string | null>(null);
  const atLimit = !canAdd('projects', projects.length);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
      <a href={paths.projects()} className="text-sm text-navy-700 hover:underline">
        ← My projects
      </a>
      <h1 className="mt-3 font-serif text-3xl font-semibold">Create a project</h1>
      <p className="mt-1 text-slate-600">Start with the basics. Everything can be edited later and saves automatically.</p>

      {atLimit ? (
        <div className="mt-6 space-y-4">
          <LimitNotice kind="projects" />
          <LinkButton href={paths.projects()} variant="secondary">
            Back to my projects
          </LinkButton>
        </div>
      ) : (
        <Card className="mt-6 p-5 sm:p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!form.title.trim()) {
                setError('Please enter a project title.');
                return;
              }
              const res = addProject({ ...form, title: form.title.trim() });
              if (res.ok) navigate(paths.variables(res.id));
              else setError('Project limit reached.');
            }}
          >
            <ProjectFields value={form} onChange={(patch) => setForm((f) => ({ ...f, ...patch }))} autoFocus />
            {error && (
              <p role="alert" className="mt-4 text-sm text-red-700">
                {error}
              </p>
            )}
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <LinkButton href={paths.projects()} variant="secondary">
                Cancel
              </LinkButton>
              <Button type="submit">Create project & add variables</Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}
