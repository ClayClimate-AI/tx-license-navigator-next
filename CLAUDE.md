# TX License Navigator (Week 5)

Second Chance License Navigator, rebuilt in Next.js with a saved-searches watchlist. The Week 4 search (license type + county → live TDLR holder count) carries over; the watchlist adds create, read, update, delete in Neon Postgres. Joseph is a learner who steers every step; the grade is control, not complexity.

## The loop

ask → review diff → accept → test → commit → next.

- Work comes from GitHub Issues (see Agent skills below). Joseph says "work issue #N"; work only an issue whose blockers are closed. Before any code, post the `Started` comment on it.
- Work the issue in **small steps**: one behavior, usually 1–2 files, a diff of about 60 lines or less. Read the issue's acceptance criteria first and propose the steps.
- After each step, show the diff and the report below, then stop and wait. The next step starts only when Joseph asks for it.
- When the issue's acceptance criteria all pass: add `Actual:` to the issue, then remind Joseph to end his last commit message with `Closes #N`. Joseph runs `/clear` before the next issue.
- Joseph runs every git command himself. Leave committing and pushing to him.
- When a task turns out bigger than a small step, say so and propose how to split it before writing code.

## Report after every task

End each task with this report, in short lines:

- **Purpose**: what this step makes possible.
- **Input**: what the new code receives (props, request body, params, env vars).
- **Output**: what it returns, renders, or writes.
- **Flow**: the order things run, from the trigger to the result (for example: browser `fetch` → `route.ts` → Zod → Prisma → Neon → JSON → React state).
- **Changed**: each file with its layer emoji, marked (new) or (modified).
- **Test it**: the exact check Joseph runs (a URL, a `curl`, a click, a Neon table view).
- **Next**: the next step, the skill to use if one applies (the exact command to type), and its estimated time. If the next step crosses a checkpoint in `tasks.md`, say so.

## Stack (pinned)

- Next.js 16 App Router, TypeScript, Tailwind CSS 4. Route Handlers (`app/api/**/route.ts`) for all browser-to-server calls.
- Prisma `7.10.0` exactly (the npm `latest` tag is an 8.0 RC). `@prisma/adapter-neon` `7.10.0`.
  - The app connects through the Neon adapter with the pooled `DATABASE_URL`.
  - `prisma.config.ts` reads the direct `DIRECT_URL`; migrations use it.
  - Generator `provider = "prisma-client"` with an explicit `output`.
- Zod validates every request body and `params.id` at the route.
- In route handlers, `params` is a Promise: `const { id } = await params`.
- Neon: build on the `dev` branch; `main` serves the live Netlify site. Netlify env vars are pasted by hand from the Neon console.

## Hard rules

- **Counts only.** TDLR queries use only `license_type`, `business_county`, and `count(*)`. The app never fetches or shows names, addresses, or license numbers.
- `lib/tdlr.ts` runs on the server only; the browser reaches TDLR through `/api/count` and `/api/types`.
- Secrets live in `.env` (git-ignored). `.env.example` lists variable names with no values.
- Scope is what `docs/spec/` describes. The "Ask the law" RAG stretch waits until after the Friday demo. If time runs short, follow the cut order in `tasks.md`.

## Where things are decided

- `docs/spec/requirements.md`: what the app must do, as checkable statements.
- `docs/spec/design.md`: schema, API contracts and status codes, UI states and exact wording, focus and announcements. Read it before any task that touches those.
- `docs/spec/tasks.md`: the checkpoints, the manual check list, and the cut order. The work itself is the GitHub issues.
- `SOT_documents/UI.md` Part 1: the Week 4 look, carried over as is.

## Prompt log

After Joseph accepts a step, add an entry to `PROMPT_LOG.md`, with the issue number in its title (for example `## Entry 4 · #2 Prisma schema`). Layout follows `SOT_documents/PROMPT_LOG_FORMAT.md` (banner, legend, HTML table per entry, middle-dot separators, `<code>` for names). Where that file describes Week 4 practice, these Week 5 rules win:

- The agent writes every row: Tool, Asked, Context, Changed, Decision, Verified, Commit, PIOF and what differed, Reflection, Explained.
  - **Verified** and **Commit** hold only facts seen in this session or in git.
  - **PIOF and what differed**: the task's PIOF. Add "What differed" only when Joseph says something did not match.
  - **Reflection**: ask Joseph "Your reflection?" and put his answer in verbatim. Formatting (bullets, `<code>`) is fine; words stay his. If he skips, write "none".
  - **Tutor** (between PIOF and Reflection, only when the tutor was used): what Joseph did not understand, what the tutor cleared up, how he resolved it.
- Every entry gets a `### Entry N call graph` (mermaid `flowchart TD`, one node, edge, or `classDef` per line, `classDef` lines last and only for layers used). Add a `sequenceDiagram` only when a flow crosses layers and timing matters.
- Class names are the ones below. Mermaid keywords (`style`, `class`, `end`, `graph`, `default`) break rendering, so they never serve as class names.

Legend: exactly 8 layers. Things outside the code (Browser, TDLR API) use `run` and are not a legend layer.

| Layer | Files | Class | classDef |
|---|---|---|---|
| 🟦 Entry | `app/layout.tsx`, `app/page.tsx` | `entry` | `fill:#1d4ed8,color:#fff,stroke:#93c5fd` |
| 🟩 UI | `components/*.tsx`, `lib/counties.ts` | `ui` | `fill:#15803d,color:#fff,stroke:#86efac` |
| 🟥 Server | `app/api/**/route.ts` | `server` | `fill:#b91c1c,color:#fff,stroke:#fca5a5` |
| 🟫 TDLR | `lib/tdlr.ts` | `tdlr` | `fill:#78350f,color:#fff,stroke:#d6a77a` |
| ⬛ Database | `prisma/schema.prisma`, `prisma.config.ts`, `lib/db.ts`, Neon | `db` | `fill:#111827,color:#fff,stroke:#9ca3af` |
| 🟧 Style | `app/globals.css`, `tailwindcss` | `css` | `fill:#c2410c,color:#fff,stroke:#fdba74` |
| 🟪 Tools | `next.config.ts`, `tsconfig.json`, `next`, `prisma` CLI | `tool` | `fill:#7e22ce,color:#fff,stroke:#d8b4fe` |
| 🟨 Dependencies | `package.json`, `package-lock.json` | `deps` | `fill:#a16207,color:#fff,stroke:#fde68a` |
| (outside) | Browser, TDLR API | `run` | `fill:#334155,color:#fff,stroke:#94a3b8` |

Update a layer's file list when a task adds a file to it.

## Tutor

`.claude/agents/tutor.md` is a read-only explainer. It runs only when Joseph asks for it on a diff he does not understand. Pass it the diff's PIOF report so it can flag mismatches.

## Agent skills

### Issue tracker

GitHub Issues on the private repo `ClayClimate-AI/tx-license-navigator-next`, via `gh`. Estimate and actual time are tracked on each issue. See `docs/agents/issue-tracker.md`.

### Triage labels

Default five roles (`needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root, created only when needed. See `docs/agents/domain.md`.
