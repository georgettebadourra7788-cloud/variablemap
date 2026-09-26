import type { Project } from '../types';
import { APPROACH_OPTIONS, DESIGN_SUGGESTIONS } from '../lib/options';
import { SelectField, TextAreaField, TextField } from './ui';

type Fields = Pick<Project, 'title' | 'researchQuestion' | 'approach' | 'design' | 'description'>;

export function ProjectFields({ value, onChange, autoFocus }: { value: Fields; onChange: (patch: Partial<Fields>) => void; autoFocus?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TextField
        className="sm:col-span-2"
        label="Project title"
        value={value.title}
        onChange={(title) => onChange({ title })}
        placeholder="e.g. AI Anxiety Among Undergraduate University Students"
        required
        autoFocus={autoFocus}
      />
      <TextAreaField
        className="sm:col-span-2"
        label="Research question"
        value={value.researchQuestion}
        onChange={(researchQuestion) => onChange({ researchQuestion })}
        placeholder="What is the relationship between … and … among …?"
        rows={2}
      />
      <SelectField label="Research approach" value={value.approach} onChange={(approach) => onChange({ approach })} options={APPROACH_OPTIONS} />
      <div>
        <TextField
          label="Research design"
          value={value.design}
          onChange={(design) => onChange({ design })}
          list="design-suggestions"
          placeholder="e.g. Cross-sectional survey"
          hint="Type your own or choose a suggestion."
        />
        <datalist id="design-suggestions">
          {DESIGN_SUGGESTIONS.map((d) => (
            <option key={d} value={d} />
          ))}
        </datalist>
      </div>
      <TextAreaField
        className="sm:col-span-2"
        label="Project notes (optional)"
        value={value.description}
        onChange={(description) => onChange({ description })}
        placeholder="Context, population, sampling notes, supervisor comments…"
        rows={3}
      />
    </div>
  );
}
