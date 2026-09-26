import type { ReactNode } from 'react';
import type { Project } from '../types';
import { paths, type Route } from '../router';
import { Badge } from './ui';

const TABS = [
  { key: 'overview', label: 'Overview', href: paths.overview },
  { key: 'variables', label: 'Variables', href: paths.variables },
  { key: 'review', label: 'Review', href: paths.review },
  { key: 'codebook', label: 'Codebook', href: paths.codebook },
  { key: 'dictionary', label: 'Data Dictionary', href: paths.dictionary },
] as const;

export function ProjectLayout({ project, route, children }: { project: Project; route: Route; children: ReactNode }) {
  const active = route.name === 'variable' ? 'variables' : route.name;
  const wide = route.name === 'codebook' || route.name === 'dictionary';
  return (
    <div>
      <div className="no-print border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 pt-5 sm:px-6">
          <a href={paths.projects()} className="text-sm text-navy-700 hover:underline">
            ← My projects
          </a>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-semibold sm:text-3xl">{project.title || 'Untitled project'}</h1>
            {project.isExample && <Badge tone="slate">Example</Badge>}
          </div>
          <nav aria-label="Project sections" className="-mx-4 mt-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <ul className="flex min-w-max gap-1">
              {TABS.map((t) => {
                const isActive = active === t.key;
                return (
                  <li key={t.key}>
                    <a
                      href={t.href(project.id)}
                      aria-current={isActive ? 'page' : undefined}
                      className={`inline-block border-b-2 px-3 py-2.5 text-sm font-medium ${
                        isActive ? 'border-navy-700 text-navy-900' : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
                      }`}
                    >
                      {t.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
      <div className={`print-page mx-auto px-4 py-6 sm:px-6 sm:py-8 ${wide ? 'max-w-[1600px]' : 'max-w-6xl'}`}>{children}</div>
    </div>
  );
}
