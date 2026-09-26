export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <rect width="32" height="32" rx="7" fill="#1b3358" />
        <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
          <path d="M9 10h14M9 16h9M9 22h11" />
        </g>
        <circle cx="23" cy="22" r="2.2" fill="#8fb3e8" />
      </svg>
      <span className="font-serif text-lg font-semibold tracking-tight text-navy-900">VariableMap</span>
    </span>
  );
}
