# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**MINNA-FEEI** is a PWA for collecting child development evaluation data in Paraguay. Field evaluators use it to run structured assessments (EAD-3 and ECPP-P instruments) for children 0–72 months, then view aggregated results in a dashboard. Deployed on Vercel with a Neon (serverless Postgres) database.

## Commands

```bash
pnpm dev       # Start dev server at http://localhost:3000
pnpm build     # Production build (TypeScript errors are ignored — see next.config.mjs)
pnpm lint      # ESLint
```

Required environment variable: `DATABASE_URL` (Neon connection string). For file uploads: `BLOB_READ_WRITE_TOKEN` (Vercel Blob).

To set up the database schema, run `scripts/create-tables.sql` against the Neon instance.

## Architecture

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · shadcn/ui · Neon serverless Postgres · Vercel Blob

### Pages / Routes

| Route | Purpose |
|---|---|
| `/` | New evaluation wizard (`EvaluationWizard`) |
| `/datos` | View/filter all records — table, charts, attachments |
| `/editar/[id]` | Edit a saved record |
| `/admin/edis` | CRUD for EDI (early childhood centers) list |

### API Routes

| Endpoint | Methods | Notes |
|---|---|---|
| `/api/registros` | GET, POST | Filterable list; inserts full evaluation payload |
| `/api/registros/[id]` | GET, PUT | Fetch or update a single record |
| `/api/edis` | GET, POST, PUT, DELETE | EDI management (soft-delete via `activo` flag) |
| `/api/upload` | POST | Uploads to Vercel Blob; max 10MB; returns URLs stored as JSONB in `adjuntos` column |

### Key Data Flow

1. **EvaluationWizard** (`components/evaluation-wizard.tsx`) holds all state across 4 steps and computes scores in `useMemo` before POSTing to `/api/registros`.
2. **Step 2 (EAD-3)** items are age-dependent: `getEadItemsByEdad(edadMeses)` in `lib/evaluation-data.ts` selects items by age range (11 ranges, 0–72 months). Only a subset of ranges have items defined — if a child's range has no items, the nearest available range is used.
3. **Step 3 (ECPP-P)** uses a fixed 21-item parental competence scale across 5 dimensions (`implicacion`, `dedicacion`, `ocio`, `asesoramiento`, `rol`).
4. Scores are computed client-side and saved as aggregate numbers (not individual responses). EAD areas map as: MG→`ead_motor`, MF→`ead_cognitivo`, AL→`ead_lenguaje`, PS→`ead_socioemocional`.
5. `/datos` page fetches records via SWR and passes raw data into `DatosCharts` (Recharts) and `DatosTable`. Filtering is done server-side via SQL null-coalescence pattern.

### Domain Enumerations (integer codes stored in DB)

- `sexo`: 1=Masculino, 2=Femenino
- `tipo_grupo`: 1=Intervención, 2=Control, 3=Egresado de EDI
- `rango_etario`: 1=0–11m, 2=12–23m, 3=24–35m, 4=36–47m, 5=48–59m, 6=60–72m
- `asistencia_edi`: 0=No, 1=Sí
- `parentesco`: 1=Madre, 2=Padre, 3=Otro
- `nivel_educativo`: 1=Primaria, 2=Secundaria, 3=Terciaria, 4=Universitaria
- EAD classification: `verde`≥70%, `amarillo`≥40%, `rojo`<40%
- ECPP-P scale: 1=Nunca, 2=A veces, 3=Casi siempre, 4=Siempre

### Important Notes

- `next.config.mjs` sets `typescript.ignoreBuildErrors: true` — the build will succeed even with type errors.
- DB helper `getDb()` exists in both `lib/db.ts` and duplicated inline in `app/api/registros/route.ts` — prefer using the one from `lib/db.ts` for new API routes.
- Location data (18 departamentos + distritos) is static in `lib/paraguay-locations.ts`.
- The app is a PWA: `public/sw.js`, `public/manifest.json`, and `PwaInstallPrompt` component handle installability.
- UI components live in `components/ui/` (shadcn/ui primitives) — do not modify them directly; add wrappers in `components/` instead.
