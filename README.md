# VariableMap

**Build a clearer research codebook.**

VariableMap helps researchers define, organize, document, and code research variables before data collection and analysis. It turns variables, dimensions, and indicators/items into a structured codebook and data dictionary.

It is not an AI research assistant: no content is generated and no methodological decisions are made for you.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- `localStorage` persistence — client-side only, no backend, no accounts, no paid APIs

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build and test

```bash
npm run build      # type-checks (tsc -b) and builds to dist/
npm run preview    # serves the production build
npm test           # unit tests (Vitest)
```

## Deploy (free)

The output is a static site in `dist/`. Routing uses URL hashes (`#/projects`), so no server rewrites are needed.

- **Vercel:** import the repo → Framework preset **Vite** → Build command `npm run build` → Output `dist`.
- **Netlify:** Build command `npm run build` → Publish directory `dist`.

## Project structure

```
src/
  config/plans.ts          Free/Pro limits and plan copy (single source of truth)
  types.ts                 Project, Variable, Dimension, Item types
  lib/
    storage.ts             localStorage load/save + validation of stored/imported data
    review.ts              Transparent rule-based review checklist
    codebook.ts            Codebook and Data Dictionary builders
    export.ts              CSV/TSV, clipboard, download helpers
    backup.ts              Project backup (.json) export/import
    factory.ts, options.ts, id.ts
  state/ProjectsContext.tsx  Project store with limit enforcement and auto-save
  data/exampleProject.ts   Optional example project (AI Anxiety)
  components/              Reusable UI (fields, dialogs, plan cards, layout, editors)
  pages/                   Landing, Projects, New project, Overview, Variables,
                           Variable editor, Review, Codebook, Data Dictionary
  router.ts                Minimal hash router
```

## Free plan limits

Defined only in `src/config/plans.ts`:

```ts
FREE_MAX_PROJECTS = 2
FREE_MAX_VARIABLES = 10
FREE_MAX_INDICATORS = 30
```

When a limit is reached, adding is disabled with an explanation. Existing data is never deleted or locked.

## Privacy

Projects are stored locally in the browser and are not uploaded to a VariableMap server. Clearing browser data or changing device/browser may make projects unavailable — export important work (CSV or project backup).
