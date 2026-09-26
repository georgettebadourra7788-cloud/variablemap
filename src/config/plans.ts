/**
 * Central source of truth for plan limits and plan copy.
 * Do not hard-code these numbers anywhere else in the app.
 */
export const FREE_MAX_PROJECTS = 2;
export const FREE_MAX_VARIABLES = 10;
export const FREE_MAX_INDICATORS = 30;

export const FREE_PLAN = {
  name: 'Free',
  price: '$0',
  tagline: 'Free Forever',
  cta: 'Start Free',
  smallPrint: 'No account required. No credit card required.',
  features: [
    `${FREE_MAX_PROJECTS} saved projects`,
    `${FREE_MAX_VARIABLES} variables per project`,
    `${FREE_MAX_INDICATORS} indicators/items per project`,
    'Conceptual and operational definitions',
    'Dimensions and indicators/items',
    'Measurement and coding information',
    'Missing-value notes and planned analysis',
    'Source/citation fields',
    'Rule-based review checklist',
    'Codebook and Data Dictionary',
    'CSV export and print-friendly codebook',
    'Local browser storage — no account',
  ],
} as const;

export const PRO_PLAN = {
  name: 'Pro',
  status: 'Coming Soon',
  plannedFeatures: [
    'More projects',
    'Larger variable limits',
    'Excel export',
    'SPSS-ready documentation',
    'R/Jamovi-ready documentation',
    'Questionnaire import',
    'Advanced codebook tools',
    'Research templates',
    'Cloud backup',
    'Collaboration',
  ],
  disclaimer:
    'Pro is currently under development. Features shown are planned and may change before launch. No payment is currently required or available for Pro.',
} as const;

export type LimitKind = 'projects' | 'variables' | 'indicators';

export const LIMITS: Record<LimitKind, { max: number; label: string; unit: string }> = {
  projects: { max: FREE_MAX_PROJECTS, label: 'Projects', unit: 'saved projects' },
  variables: { max: FREE_MAX_VARIABLES, label: 'Variables', unit: 'variables per project' },
  indicators: { max: FREE_MAX_INDICATORS, label: 'Indicators', unit: 'indicators/items per project' },
};

export function canAdd(kind: LimitKind, currentCount: number): boolean {
  return currentCount < LIMITS[kind].max;
}
