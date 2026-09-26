import type { Project } from '../types';
import { approachLabel } from '../lib/options';

export function PrintHeader({ project, title }: { project: Project; title: string }) {
  return (
    <div className="print-only mb-4 hidden">
      <p style={{ fontSize: '8pt', color: '#475569' }}>VariableMap · {title}</p>
      <h1 style={{ fontSize: '15pt', fontWeight: 600, margin: '2px 0' }}>{project.title || 'Untitled project'}</h1>
      {project.researchQuestion && (
        <p style={{ fontSize: '9pt' }}>
          <strong>Research question:</strong> {project.researchQuestion}
        </p>
      )}
      <p style={{ fontSize: '8pt', color: '#475569' }}>
        Approach: {approachLabel(project.approach)} · Design: {project.design || 'Not specified'} · Generated {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
