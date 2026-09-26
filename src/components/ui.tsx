import { useId, type ReactNode, type ButtonHTMLAttributes, type AnchorHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const base =
  'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 whitespace-nowrap';
const variants: Record<Variant, string> = {
  primary: 'bg-navy-800 text-white hover:bg-navy-700 shadow-sm',
  secondary: 'bg-white text-navy-800 border border-slate-300 hover:bg-navy-50 hover:border-navy-300',
  ghost: 'text-navy-700 hover:bg-navy-50',
  danger: 'bg-white text-red-700 border border-red-200 hover:bg-red-50',
};
const sizes: Record<Size, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2.5 text-sm' };

export function buttonClass(variant: Variant = 'primary', size: Size = 'md', extra = '') {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type={type} className={buttonClass(variant, size, className)} {...rest} />;
}

export function LinkButton({
  variant = 'primary',
  size = 'md',
  className = '',
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement> & { variant?: Variant; size?: Size }) {
  return <a className={buttonClass(variant, size, className)} {...rest} />;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}>{children}</div>;
}

export function Badge({ children, tone = 'navy' }: { children: ReactNode; tone?: 'navy' | 'slate' | 'amber' | 'green' }) {
  const tones = {
    navy: 'bg-navy-50 text-navy-800 border-navy-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    amber: 'bg-amber-50 text-amber-800 border-amber-200',
    green: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  };
  return <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

const inputClass =
  'block w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-navy-500 focus:outline-none focus:ring-2 focus:ring-navy-200';

interface FieldBase {
  label: string;
  hint?: string;
  className?: string;
}

function FieldShell({ id, label, hint, className = '', children }: FieldBase & { id: string; children: ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-xs text-slate-500">
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextField({
  label,
  hint,
  className,
  value,
  onChange,
  placeholder,
  list,
  required,
  autoFocus,
  maxLength = 300,
}: FieldBase & {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  list?: string;
  required?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className={className}>
      <input
        id={id}
        className={inputClass}
        value={value}
        placeholder={placeholder}
        list={list}
        required={required}
        autoFocus={autoFocus}
        maxLength={maxLength}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function TextAreaField({
  label,
  hint,
  className,
  value,
  onChange,
  placeholder,
  rows = 3,
}: FieldBase & { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className={className}>
      <textarea
        id={id}
        className={`${inputClass} resize-y`}
        rows={rows}
        value={value}
        placeholder={placeholder}
        maxLength={5000}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </FieldShell>
  );
}

export function SelectField<T extends string>({
  label,
  hint,
  className,
  value,
  onChange,
  options,
}: FieldBase & { value: T; onChange: (v: T) => void; options: { value: T; label: string }[] }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className={className}>
      <select
        id={id}
        className={inputClass}
        value={value}
        aria-describedby={hint ? `${id}-hint` : undefined}
        onChange={(e) => onChange(e.target.value as T)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-serif text-xl font-semibold sm:text-2xl">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-slate-600">{description}</p>}
      </div>
      {action && <div className="flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}

export function EmptyState({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <Card className="px-6 py-10 text-center">
      <h3 className="font-serif text-lg font-semibold">{title}</h3>
      {children && <div className="mx-auto mt-2 max-w-md text-sm text-slate-600">{children}</div>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </Card>
  );
}
