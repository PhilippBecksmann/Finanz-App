# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

> **Read `AGENTS.md` first.** This project pins **Next.js 16 / React 19 / Prisma 7 / Tailwind v4** — versions whose APIs and conventions differ from older training data. When touching framework surface, consult the bundled docs in `node_modules/next/dist/docs/` (`01-app`, `03-architecture`) and heed deprecation notices instead of relying on remembered APIs.

## What this is

A German-language personal finance & portfolio dashboard (single-user, local). Three routes:
- `/` — dashboard: net worth (cashflow balance + portfolio value), spending pie, portfolio value line chart.
- `/transactions` — cashflow: add/delete income & expense entries, filter by month.
- `/portfolio` — holdings: add/delete assets, live prices & gain/loss.

UI copy is German; keep it that way.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build
npm run start    # serve the production build

npx prisma migrate dev      # apply/create migrations against dev.db
npx prisma generate         # regenerate the client into app/generated/prisma
npx prisma db seed          # reset + seed sample data (runs `tsx prisma/seed.ts`)
```

There is **no test runner and no linter configured** — only `dev`/`build`/`start` exist in package.json. Type-check via `npx tsc --noEmit` (or `npm run build`). Do not invent test/lint commands.

## First-run / setup notes

- Requires `.env` with `DATABASE_URL="file:./dev.db"` (present). Prisma does **not** auto-load `.env`; it's pulled in via `import "dotenv/config"` in `prisma.config.ts` and `prisma/seed.ts`.
- The generated Prisma client (`app/generated/prisma/`) is **gitignored**. After a fresh clone or schema change, run `npx prisma generate` or imports from `@/app/generated/prisma/client` will fail.

## Architecture

Data flows **Server Component → pure calc → Client chart**, with mutations via **Server Actions**.

- **`lib/prisma.ts`** — the only DB entry point. Prisma 7 requires a driver adapter; this uses `@prisma/adapter-better-sqlite3`. Singleton stashed on `globalThis` to survive dev HMR. Import `prisma` from here, never construct `PrismaClient` elsewhere (the seed script is the one exception).
- **`lib/quotes.ts`** — all market-data access via `yahoo-finance2`. `getQuote`/`getQuotes` (current price) and `getHistory` (daily closes). Wraps errors and returns `null`/`[]` so bad tickers show "n/v" instead of crashing. Backed by an in-process TTL cache (quotes 15 min, history 6 h) — cache is per server process, not shared across restarts.
- **`lib/calc.ts`** — pure, dependency-free finance math and formatting (`cashflowBalance`, `portfolioValue`, `spendingByCategory`, `portfolioHistory`, `formatEUR`, `formatPct`). No DB or network here; this is where testable logic lives. Note the documented simplification: `portfolioHistory` assumes current share counts held constant across the window.
- **`app/*/page.tsx`** — async Server Components. They fetch (Prisma + quotes, parallelized with `Promise.all`), run `lib/calc` helpers, and pass plain data down. Pages that show live prices set `export const dynamic = 'force-dynamic'`.
- **`lib/actions/*.ts`** — `'use server'` Server Actions, the only mutation path. Two shapes coexist:
  - `add*`: `(prevState, formData) => Promise<ActionResult>`, consumed by client forms via `useActionState`. Validate → return `{ ok, error }` (German error strings).
  - `delete*`: `(formData) => Promise<void>`, used directly as a `<form action>`.
  - Every mutation calls `revalidatePath` for both the affected page and `/`.
- **`components/*.tsx`** — presentational. Forms and Recharts wrappers are `'use client'`; simple display components stay server-side. Forms reset via a `formRef` in a `useEffect` on action success.

## Conventions

- Import alias `@/*` maps to the project root (e.g. `@/lib/prisma`, `@/components/StatCard`).
- **SQLite has no enums**: `Transaction.type` is a plain `'INCOME' | 'EXPENSE'` string; amounts are stored positive and the sign is derived from `type`. Validate the string against the allowed set in actions.
- Money is EUR-only in the UI (`formatEUR`, de-DE locale). `Asset.currency` defaults to `'EUR'` but live prices come back in the ticker's native currency — no FX conversion is applied.
- Styling is Tailwind v4 via the PostCSS plugin (`@tailwindcss/postcss`); semantic tokens like `text-muted`, `bg-card`, `border-border` are defined in `app/globals.css`.
