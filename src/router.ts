import { useEffect, useState } from 'react';

export type Route =
  | { name: 'landing' }
  | { name: 'projects' }
  | { name: 'new' }
  | { name: 'overview'; projectId: string }
  | { name: 'variables'; projectId: string }
  | { name: 'variable'; projectId: string; variableId: string }
  | { name: 'review'; projectId: string }
  | { name: 'codebook'; projectId: string }
  | { name: 'dictionary'; projectId: string }
  | { name: 'notfound' };

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('?')[0].split('/').filter(Boolean).map(decodeURIComponent);
  if (parts.length === 0) return { name: 'landing' };
  if (parts[0] === 'projects' && parts.length === 1) return { name: 'projects' };
  if (parts[0] === 'new' && parts.length === 1) return { name: 'new' };
  if (parts[0] === 'p' && parts[1]) {
    const projectId = parts[1];
    const section = parts[2] ?? 'overview';
    if (section === 'overview' && parts.length <= 3) return { name: 'overview', projectId };
    if (section === 'variables' && parts[3]) return { name: 'variable', projectId, variableId: parts[3] };
    if (section === 'variables') return { name: 'variables', projectId };
    if (section === 'review') return { name: 'review', projectId };
    if (section === 'codebook') return { name: 'codebook', projectId };
    if (section === 'dictionary') return { name: 'dictionary', projectId };
  }
  return { name: 'notfound' };
}

export const paths = {
  landing: () => '#/',
  projects: () => '#/projects',
  newProject: () => '#/new',
  overview: (pid: string) => `#/p/${pid}`,
  variables: (pid: string) => `#/p/${pid}/variables`,
  variable: (pid: string, vid: string) => `#/p/${pid}/variables/${vid}`,
  review: (pid: string) => `#/p/${pid}/review`,
  codebook: (pid: string) => `#/p/${pid}/codebook`,
  dictionary: (pid: string) => `#/p/${pid}/dictionary`,
};

export function navigate(to: string) {
  window.location.hash = to.replace(/^#/, '');
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash));
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash));
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
