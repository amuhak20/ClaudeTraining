# CLAUDE.md

We're building the app described in @SPEC.MD. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long explanations, short code snippets.

Whenever working with any third-party library or something similar, you MUST look up the official documentation to ensure that you're working with up-to-date information.
Use the DocSExplorer subagent for efficient documentation lookup.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

This is a Next.js 16 (App Router) + React 19 + TypeScript + Tailwind v4 project. The app is still the stock `create-next-app` scaffold (`app/page.tsx` is the default template). The product being built is a note-taking web app described in `SPEC.MD`: auth via better-auth, TipTap rich-text notes stored as JSON in SQLite, and public read-only sharing at `/p/[slug]`. None of the spec's planned modules (`lib/db.ts`, `lib/notes.ts`, `app/api/notes/...`, `components/...`) exist yet. Treat `SPEC.MD` as the source of truth for intended design, and check the filesystem before assuming a file exists.

## Commands

The spec targets Bun as the runtime, and `bun.lock` is present. Use `bun` rather than `npm` or `yarn`.

- `bun run dev` – start the Next.js dev server on http://localhost:3000
- `bun --bun run build` – production build (also the closest thing to a type check on the whole app). The `--bun` flag is required: plain `bun run build` runs Next under Node, which can't load `bun:sqlite`.
- `bun run start` – serve the production build
- `bun run lint` – ESLint (flat config in `eslint.config.mjs`, extends `eslint-config-next` core-web-vitals and TypeScript rules)

- `bun test` – Bun's built-in test runner (`lib/*.test.ts`). Run one file with `bun test lib/validation.test.ts`.

## Environment

Copy `.env.example` to `.env` (gitignored). `lib/env.ts` validates `DB_PATH`, `BETTER_AUTH_SECRET` (32+ chars) and `BETTER_AUTH_URL` at startup and throws a names-only error if one is missing; there are no defaults. `DB_PATH` (currently `data/app.db`) is resolved against the working directory and is only consumed by `lib/db.ts`. Read config through `env`, not `process.env`.

## Architecture (planned, per SPEC.MD)

- **Single process, single DB.** Next.js route handlers, server components, and better-auth all run in one process and share one SQLite file. The DB connection should be a singleton that is also handed to better-auth's `database` option, so auth tables and app tables live in the same file.
- **Data access is raw SQL.** Repository functions in `lib/notes.ts` are the only place that touches the `notes` table. Every query that reads or writes a note must filter by `user_id`, since authorization is enforced in these queries, not in middleware.
- **Note content is TipTap JSON.** It is stored as `JSON.stringify(editor.getJSON())` in `notes.content_json` and parsed back into the editor on load. Rendering must go through TipTap, not raw HTML.
- **Auth-scoped routes.** `/dashboard` and `/notes/[id]` check the session on the server. `/api/notes/*` returns 401 when there is no session. The only unauthenticated read path is `/p/[slug]` (and optionally `/api/public-notes/[slug]`), which must not leak owner or private fields.
- **Sharing model.** A note's `is_public` flag and `public_slug` are toggled together via `POST /api/notes/:id/share`. Disabling sharing must clear the slug so old links 404.
- **Schema ownership is split.** better-auth tables (`user`, `session`, `account`, `verification`, camelCase columns) must match its core schema exactly; generate them with the `auth` CLI rather than by hand. The application `notes` table is defined by hand. Foreign keys are only enforced if `PRAGMA foreign_keys = ON` runs on each connection.

## Current layout

- `app/layout.tsx` – root layout, loads Geist fonts via `next/font/google`, imports `globals.css`
- `app/page.tsx` – placeholder landing page
- `app/globals.css` – Tailwind v4 entry
- `public/` – static SVGs from the scaffold
- `.claude/settings.local.json` – local permissions (Bun commands, Playwright browser tools, sandbox enabled)
