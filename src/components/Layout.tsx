import type { ReactNode } from 'react';
import { paths } from '../router';
import { FEEDBACK_URL } from '../config/site';
import { Logo } from './Logo';
import { useProjects } from '../state/ProjectsContext';

export function SiteHeader({ current }: { current?: 'landing' | 'app' }) {
  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href={paths.landing()} aria-label="VariableMap home">
          <Logo />
        </a>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          {current === 'landing' ? (
            <a href={paths.projects()} className="rounded-md bg-navy-800 px-3 py-1.5 font-medium text-white hover:bg-navy-700">
              Start Free
            </a>
          ) : (
            <a href={paths.projects()} className="rounded-md px-3 py-1.5 font-medium text-navy-800 hover:bg-navy-50">
              My projects
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="no-print mt-16 border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-xs text-slate-500 sm:flex-row sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold text-slate-700">VariableMap</span> — Build a clearer research codebook.
        </p>
        <p className="flex flex-col gap-1 sm:items-end">
          <span>Your research stays on your device. Projects are stored locally in this browser.</span>
          {FEEDBACK_URL && (
            <a href={FEEDBACK_URL} target="_blank" rel="noopener noreferrer" className="font-medium text-navy-700 hover:underline">
              Send feedback<span className="sr-only"> (opens in a new tab)</span> ↗
            </a>
          )}
        </p>
      </div>
    </footer>
  );
}

export function StorageBanner() {
  const { storageError } = useProjects();
  if (!storageError) return null;
  return (
    <div role="alert" className="no-print border-b border-red-200 bg-red-50 px-4 py-2 text-center text-sm text-red-800">
      {storageError}
    </div>
  );
}

export function AppShell({ children, current = 'app' }: { children: ReactNode; current?: 'landing' | 'app' }) {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }} className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2">
        Skip to content
      </a>
      <SiteHeader current={current} />
      <StorageBanner />
      <main id="main" tabIndex={-1} className="flex-1 focus:outline-none">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
