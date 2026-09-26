import { FREE_MAX_INDICATORS, FREE_MAX_PROJECTS, FREE_MAX_VARIABLES, FREE_PLAN } from '../config/plans';
import { paths } from '../router';
import { FreePlanCard, ProComingSoonCard } from '../components/Plans';
import { Card, LinkButton } from '../components/ui';

const STEPS = [
  { title: 'Create a project', text: 'Add your title, research question, approach, and design.' },
  { title: 'Add variables', text: 'Record each variable’s role, construct, and conceptual and operational definitions.' },
  { title: 'Add dimensions and items', text: 'Group indicators/items under dimensions with codes, response scales, and reverse-coding notes.' },
  { title: 'Review', text: 'A transparent checklist shows what is complete, what may need review, and what is not yet specified.' },
  { title: 'Generate and export', text: 'Produce a codebook and a data dictionary, then copy, download CSV, or print.' },
];

const FEATURES = [
  { title: 'Variable definitions', text: 'Conceptual and operational definitions side by side, for every variable.' },
  { title: 'Roles and constructs', text: 'Independent, dependent, mediator, moderator, control, covariate, and more.' },
  { title: 'Dimensions and items', text: 'Multiple dimensions per variable, with item codes, text, and response scales.' },
  { title: 'Measurement and coding', text: 'Instrument, source, scale, response format, scoring method, and coding notes.' },
  { title: 'Missing values and analysis', text: 'Document missing-data codes and the analysis you plan to run.' },
  { title: 'Codebook and data dictionary', text: 'Structured, printable outputs you can share with supervisors and co-authors.' },
];

const FAQ = [
  {
    q: 'Who is VariableMap for?',
    a: 'Undergraduate, master’s, and PhD students, lecturers, research assistants, and other researchers who want to document variables clearly before collecting and analysing data.',
  },
  {
    q: 'Is VariableMap an AI research assistant?',
    a: 'No. VariableMap does not generate content or make methodological decisions for you. It gives you a structured place to document your own decisions and turns them into a codebook.',
  },
  {
    q: 'Does the review tell me if my research is valid?',
    a: 'No. The review is a rule-based completeness checklist. It shows which fields are filled in and highlights things you may want to look at again. It does not assess scientific validity, instrument validity or reliability, or whether an analysis is appropriate. Additional methodological review with a supervisor or methodologist may be appropriate.',
  },
  {
    q: 'Where are my projects stored?',
    a: 'In your browser’s local storage on this device. The current version does not upload projects to a VariableMap server. Clearing browser data, using private browsing, or switching device or browser may make locally stored projects unavailable, so export important work regularly.',
  },
  {
    q: 'What does the Free plan include?',
    a: `${FREE_MAX_PROJECTS} saved projects, ${FREE_MAX_VARIABLES} variables per project, and ${FREE_MAX_INDICATORS} indicators/items per project, with the codebook, data dictionary, CSV export, and printing included. No account and no credit card are required.`,
  },
  {
    q: 'What happens if I reach a Free limit?',
    a: 'Nothing is deleted or locked. You can keep editing everything you have; you just cannot add more of that item until you remove something.',
  },
  {
    q: 'When is Pro available?',
    a: 'Pro is currently under development and there is no release date yet. No payment is currently required or available for Pro.',
  },
];

export function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-navy-600">Research methodology, documented</p>
            <h1 className="mt-3 font-serif text-4xl font-semibold leading-tight sm:text-5xl">Build a clearer research codebook.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              Define your variables, organize measurements, document coding, and create a structured research codebook — without complicated software.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <LinkButton href={paths.projects()} className="px-6 py-3 text-base">
                {FREE_PLAN.cta}
              </LinkButton>
              <p className="text-sm text-slate-500">{FREE_PLAN.smallPrint}</p>
            </div>
          </div>
          <HeroPreview />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="how">
        <h2 id="how" className="font-serif text-3xl font-semibold">How it works</h2>
        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {STEPS.map((s, i) => (
            <li key={s.title}>
              <Card className="h-full p-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-navy-800 text-sm font-semibold text-white">{i + 1}</span>
                <h3 className="mt-3 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{s.text}</p>
              </Card>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="border-y border-slate-200 bg-white" aria-labelledby="features">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 id="features" className="font-serif text-3xl font-semibold">Features</h2>
          <p className="mt-2 max-w-2xl text-slate-600">One focused purpose: turn your variables into a structured, usable codebook.</p>
          <div className="mt-8 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="border-l-2 border-navy-200 pl-4">
                <h3 className="font-semibold">{f.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6" aria-labelledby="plans">
        <h2 id="plans" className="font-serif text-3xl font-semibold">Plans</h2>
        <p className="mt-2 max-w-2xl text-slate-600">The Free plan is designed to be genuinely useful for a thesis or course project.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <FreePlanCard />
          <ProComingSoonCard />
        </div>
      </section>

      {/* Privacy */}
      <section className="border-y border-slate-200 bg-white" aria-labelledby="privacy">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-14 sm:px-6 md:grid-cols-[1fr_1.2fr]">
          <div>
            <h2 id="privacy" className="font-serif text-3xl font-semibold">Your research stays on your device.</h2>
          </div>
          <div className="space-y-3 text-slate-700">
            <p>The current version stores projects locally in the browser and does not upload projects to a VariableMap server. There is no account and no sign-in.</p>
            <p>Because storage is local, clearing browser data, using private/incognito mode, or changing device or browser may make your projects unavailable. Export important work regularly — CSV exports and project backup files stay under your control.</p>
            <p className="text-sm text-slate-500">No software can guarantee absolute security. Your data is only as protected as the device and browser you use.</p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-14 sm:px-6" aria-labelledby="faq">
        <h2 id="faq" className="font-serif text-3xl font-semibold">Frequently asked questions</h2>
        <div className="mt-6 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
          {FAQ.map((f) => (
            <details key={f.q} className="group p-4 sm:p-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-navy-900">
                {f.q}
                <span aria-hidden="true" className="text-slate-400 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="rounded-xl bg-navy-800 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="font-serif text-3xl font-semibold text-white">Document your variables before you collect data.</h2>
          <p className="mx-auto mt-3 max-w-xl text-navy-100">Start a project in under a minute. No account, no credit card.</p>
          <a href={paths.projects()} className="mt-6 inline-flex items-center justify-center rounded-md bg-white px-6 py-3 font-medium text-navy-900 hover:bg-navy-50">
            {FREE_PLAN.cta}
          </a>
          <p className="mt-3 text-xs text-navy-200">{FREE_PLAN.smallPrint}</p>
        </div>
      </section>
    </>
  );
}

function HeroPreview() {
  const rows = [
    ['AIANX1', 'Learning anxiety', 'Likert', '1–5', 'No'],
    ['AIANX3', 'Learning anxiety', 'Likert', '1–5', 'Yes'],
    ['AIANX4', 'Job replacement', 'Likert', '1–5', 'No'],
    ['ACANX1', 'Test anxiety', 'Likert', '1–5', 'No'],
  ];
  return (
    <div aria-hidden="true">
    <Card className="overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-500">Codebook preview</div>
      <div className="p-4">
        <p className="font-serif text-base font-semibold text-navy-900">AI Anxiety</p>
        <p className="text-xs text-slate-500">Independent variable · Likert · Missing: -99</p>
        <table className="mt-3 w-full text-left text-xs">
          <thead className="text-slate-500">
            <tr>
              <th className="py-1.5 font-medium">Item</th>
              <th className="py-1.5 font-medium">Dimension</th>
              <th className="hidden py-1.5 font-medium sm:table-cell">Scale</th>
              <th className="py-1.5 font-medium">Codes</th>
              <th className="py-1.5 font-medium">Rev.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700">
            {rows.map((r) => (
              <tr key={r[0]}>
                <td className="py-1.5 font-mono">{r[0]}</td>
                <td className="py-1.5">{r[1]}</td>
                <td className="hidden py-1.5 sm:table-cell">{r[2]}</td>
                <td className="py-1.5">{r[3]}</td>
                <td className="py-1.5">{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="rounded border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-emerald-800">✓ Operational definition</span>
          <span className="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-800">⚠ Source/citation</span>
        </div>
      </div>
    </Card>
    </div>
  );
}
