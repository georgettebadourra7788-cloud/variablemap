import { useEffect } from 'react';
import { useRoute, paths, type Route } from './router';
import { useProjects } from './state/ProjectsContext';
import { AppShell } from './components/Layout';
import { ProjectLayout } from './components/ProjectLayout';
import { EmptyState, LinkButton } from './components/ui';
import { LandingPage } from './pages/LandingPage';
import { ProjectsPage } from './pages/ProjectsPage';
import { NewProjectPage } from './pages/NewProjectPage';
import { OverviewPage } from './pages/OverviewPage';
import { VariablesPage } from './pages/VariablesPage';
import { VariableEditorPage } from './pages/VariableEditorPage';
import { ReviewPage } from './pages/ReviewPage';
import { CodebookPage } from './pages/CodebookPage';
import { DictionaryPage } from './pages/DictionaryPage';

const TITLES: Partial<Record<Route['name'], string>> = {
  projects: 'My projects',
  new: 'Create project',
  overview: 'Overview',
  variables: 'Variables',
  variable: 'Edit variable',
  review: 'Review',
  codebook: 'Codebook',
  dictionary: 'Data Dictionary',
};

function NotFound({ what }: { what: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <EmptyState title={`${what} not found`} action={<LinkButton href={paths.projects()}>Go to my projects</LinkButton>}>
        It may have been deleted, or it was created in a different browser or device. Projects are stored locally in the browser where they were
        created.
      </EmptyState>
    </div>
  );
}

export default function App() {
  const route = useRoute();
  const { getProject } = useProjects();

  const project = 'projectId' in route ? getProject(route.projectId) : undefined;

  useEffect(() => {
    const section = TITLES[route.name];
    const parts = [section, project?.title, 'VariableMap'].filter(Boolean);
    document.title = route.name === 'landing' ? 'VariableMap — Build a clearer research codebook' : parts.join(' · ');
  }, [route.name, project?.title]);

  if (route.name === 'landing')
    return (
      <AppShell current="landing">
        <LandingPage />
      </AppShell>
    );
  if (route.name === 'projects')
    return (
      <AppShell>
        <ProjectsPage />
      </AppShell>
    );
  if (route.name === 'new')
    return (
      <AppShell>
        <NewProjectPage />
      </AppShell>
    );
  if (route.name === 'notfound')
    return (
      <AppShell>
        <NotFound what="Page" />
      </AppShell>
    );

  if (!project)
    return (
      <AppShell>
        <NotFound what="Project" />
      </AppShell>
    );

  let page;
  switch (route.name) {
    case 'overview':
      page = <OverviewPage project={project} />;
      break;
    case 'variables':
      page = <VariablesPage project={project} />;
      break;
    case 'variable':
      page = <VariableEditorPage key={route.variableId} project={project} variableId={route.variableId} />;
      break;
    case 'review':
      page = <ReviewPage project={project} />;
      break;
    case 'codebook':
      page = <CodebookPage project={project} />;
      break;
    case 'dictionary':
      page = <DictionaryPage project={project} />;
      break;
  }

  return (
    <AppShell>
      <ProjectLayout project={project} route={route}>
        {page}
      </ProjectLayout>
    </AppShell>
  );
}
