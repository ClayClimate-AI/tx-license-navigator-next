# Prisma 7.10 + Neon in Next.js 16

> **Question:** How do Prisma ORM 7.10.0 and `@prisma/adapter-neon` 7.10.0 work with Neon Postgres in a Next.js 16 app on Netlify, and does our planned design match?
>
> **Researched:** 2026-10-15, against primary sources only (Prisma v7 docs, Prisma 7.x release notes and 7.10.0 source, Neon docs, Next.js docs, npm).

> [!NOTE]
> Prisma ORM 8 is now the default on prisma.io. The Prisma 7 docs moved to `/docs/orm/v7/...` and `/docs/guides/v7/...`. Some unversioned prisma.io pages describe Prisma 8 (or "Prisma Next") and do **not** apply here. Every claim below comes from a v7 page, a 7.x release note, the 7.10.0 source, or npm, unless it is marked **UNCONFIRMED**.

## How to read this

- Start with **§0 Words you need** and **§1 The big picture**. They are enough to follow every later step of issue #2.
- Each section opens with **In plain words**, then the facts with sources, then an **Example** from this app.
- Code blocks marked *illustrative* show the idea. Code blocks with a source come from the docs.

## Contents

0. [Words you need](#0-words-you-need)
1. [The big picture](#1-the-big-picture)
2. [Answer in short](#2-answer-in-short)
3. [Files and packages](#3-files-and-packages)
4. [Setup time: config, schema, generator, migrate](#4-setup-time)
5. [Build time: Netlify and `prisma generate`](#5-build-time)
6. [Request time: adapter, singleton, `server-only`](#6-request-time)
7. [Neon: pooled vs direct](#7-neon-pooled-vs-direct)
8. [Model features and error codes](#8-model-features-and-error-codes)
9. [Conflicts with design.md](#9-conflicts-with-designmd)
10. [Sources](#sources)

---

## 0. Words you need

| Word | In plain words | Example in this app |
|---|---|---|
| **Postgres** | A database that stores rows in tables. | The `SavedSearch` table holds one row per saved search. |
| **Neon** | A company that hosts Postgres for you in the cloud. It also has **branches** (copies of the database). | `dev` is the branch you build on; `production` serves the live site. |
| **Prisma** | A tool that lets TypeScript talk to the database without writing SQL by hand. | `prisma.savedSearch.findMany()` instead of `SELECT * FROM "SavedSearch"`. |
| **Schema** | The blueprint: which tables and columns exist. | `prisma/schema.prisma` says `SavedSearch` has `label`, `county`, and so on. |
| **Migration** | A SQL file that changes the real database to match the blueprint. | `prisma/migrations/..._init/migration.sql` creates the table. |
| **Generate** | Turns the schema into TypeScript code the app can call. | Writes `generated/prisma/client.ts`. |
| **Client** | The object your code calls to read and write rows. | `prisma` in `lib/db.ts`. |
| **Adapter** | The piece that actually carries each query to the database. Prisma 7 always needs one. | `PrismaNeon`. |
| **Connection string** | An address plus a password for the database, all in one line. | `postgresql://user:password@host/neondb?sslmode=require` |
| **Pooler / pooled** | A middleman that keeps a few database connections open and lends them out. | Host name contains `-pooler`. |
| **Direct** | A plain connection straight to the database, no middleman. | Host name has no `-pooler`. |
| **Environment variable** | A named setting that lives outside the code, so secrets stay out of git. | `DATABASE_URL`, `DIRECT_URL` in `.env`. |
| **Singleton** | "Only ever make one of these, then reuse it." | One `PrismaClient` for the whole app. |
| **`server-only`** | A label that says "this file may never be sent to the browser". | `lib/db.ts`. |

**One analogy for the whole thing:**

```
schema.prisma      = the architect's blueprint
prisma migrate     = the builder who builds the room in the database to match the blueprint
prisma generate    = the printer that prints a remote control (the client) for that room
lib/db.ts          = the one remote control the whole app shares
PrismaNeon         = the phone line the remote control uses
Neon pooler        = the switchboard that shares a few phone lines among many callers
DATABASE_URL       = the switchboard's number (app uses it)
DIRECT_URL         = the building's private number, no switchboard (the builder uses it)
```

---

## 1. The big picture

**In plain words:** Prisma shows up at three moments. You **set up** the table once (on your laptop). The app gets **built** (on Netlify). Then people **use** it (every click). Each moment reads different files and uses a different address for the database.

| Moment | Who runs it | Command or trigger | Reads | Connection |
|---|---|---|---|---|
| **Setup** | you, on your laptop | `prisma migrate dev` | `schema.prisma`, `prisma.config.ts`, `.env` | `DIRECT_URL` (direct) |
| **Build** | Netlify (and `npm run build`) | `prisma generate` → `next build` | `schema.prisma`, `prisma.config.ts` | none (but the config still loads) |
| **Request** | every API call | `route.ts` → `lib/db.ts` | `generated/prisma/client` | `DATABASE_URL` (pooled) |

```mermaid
flowchart TD
  S[prisma/schema.prisma]:::db
  C[prisma.config.ts + .env]:::db
  M[prisma migrate dev]:::tool
  G[prisma generate]:::tool
  GEN[generated/prisma/client.ts]:::db
  N[(Neon Postgres<br/>SavedSearch table)]:::db
  B[Browser fetch]:::run
  R[app/api/**/route.ts]:::server
  D[lib/db.ts<br/>one PrismaClient on globalThis]:::db
  A[PrismaNeon adapter]:::db
  P[Neon pooler<br/>PgBouncer]:::db

  S --> M
  C -->|DIRECT_URL| M
  M -->|direct connection, SQL migration| N
  S --> G
  C -.->|loaded, URL not used| G
  G --> GEN
  B --> R
  R --> D
  GEN --> D
  D --> A
  A -->|WebSocket, DATABASE_URL| P
  P -->|borrowed connection| N

  classDef server fill:#b91c1c,color:#fff,stroke:#fca5a5
  classDef db fill:#111827,color:#fff,stroke:#9ca3af
  classDef tool fill:#7e22ce,color:#fff,stroke:#d8b4fe
  classDef run fill:#334155,color:#fff,stroke:#94a3b8
```

**Example: one saved search, start to finish.**

```
SETUP (once)    you run `prisma migrate dev`  →  Neon dev now has an empty SavedSearch table
BUILD (deploy)  Netlify runs `prisma generate` then `next build`  →  the app knows `prisma.savedSearch`
REQUEST (click) you save "HVAC in Harris County"
                 → POST /api/searches → lib/db.ts → prisma.savedSearch.create(...)
                 → PrismaNeon → Neon pooler → Postgres inserts row id 1
                 → { search: { id: 1, licenseType: "A/C Technician", county: "HARRIS", ... } } back to the browser
```

---

## 2. Answer in short

| # | Topic | Finding | Source |
|---|---|---|---|
| 1 | Versions | All three packages exist at 7.10.0. Prisma 7 needs Node `^20.19 \|\| ^22.12 \|\| >=24.0`. `@prisma/adapter-neon@7.10.0` pulls in `@neondatabase/serverless` (`>0.6.0 <2`) for you. | [npm][npm-adapter] |
| 2 | Config | `prisma.config.ts` uses `import "dotenv/config"` plus `defineConfig` and `env` from `"prisma/config"`. The CLI's connection string goes in `datasource.url`. `directUrl` was removed, so `DIRECT_URL` goes into `url`. `dotenv` must be installed. | [config ref v7][config-v7] |
| 3 | Schema | `datasource db { provider = "postgresql" }` with no `url` is the v7 form. Connection URLs live only in `prisma.config.ts`. | [schema ref v7][schema-v7] |
| 4 | Generator | `prisma-client` requires `output`. Import from `<output>/client`, so `lib/db.ts` uses `../generated/prisma/client`. The Rust engines were removed in 7.0, so every `PrismaClient` needs an `adapter` (or an `accelerateUrl`). | [generators][generators], [7.0.0 release][rel-700] |
| 5 | Runtime | `new PrismaNeon({ connectionString: process.env.DATABASE_URL })`, then `new PrismaClient({ adapter })`. Cache that one client on the global object outside production. | [Neon page v7][prisma-neon-v7], [Next.js guide v7][nextjs-v7] |
| 6 | ⚠ Build risk | `prisma generate` does not use the URL, but it still loads `prisma.config.ts`. If the config uses `env("DIRECT_URL")` and Netlify has no `DIRECT_URL`, the build fails with `PrismaConfigEnvError`. | [config ref v7][config-v7] |
| 7 | Neon | The pooled host has `-pooler` in its name and runs PgBouncer in transaction mode. The app uses pooled; migrations use direct. `migrate dev` creates its own shadow database on Neon, so no `shadowDatabaseUrl`. | [Neon pooling][neon-pooling], [Neon changelog][neon-changelog] |
| 8 | Model and errors | `@updatedAt`, `@@unique([a, b])`, P2002 (unique) and P2025 (not found) all still work in 7.x. The 7.10.0 release notes fix bugs in both error codes. | [7.10.0 release][rel-7100] |

---

## 3. Files and packages

### Where everything lives

```
tx-license-navigator-next/
├── .env                      DATABASE_URL (pooled) + DIRECT_URL (direct)   git-ignored
├── .env.example              the two names, no values                      committed
├── prisma.config.ts          loads .env, points at schema + migrations,    committed
│                             gives the CLI DIRECT_URL
├── prisma/
│   ├── schema.prisma         generator + datasource + SavedSearch model    committed
│   └── migrations/           SQL written by `prisma migrate dev`           committed
├── generated/prisma/         client code written by `prisma generate`      git-ignored
│   └── client.ts             ← lib/db.ts imports PrismaClient from here
└── lib/
    └── db.ts                 server-only, one PrismaClient + PrismaNeon    committed
```

The `output = "../generated/prisma"` path resolves from `prisma/schema.prisma` to `<repo>/generated/prisma`, so `lib/db.ts` imports `"../generated/prisma/client"`. This is inferred from the path rules in [generators][generators], not quoted from a doc.

### Packages to install

| Package | Version | Kind | Why |
|---|---|---|---|
| `prisma` | `7.10.0` (exact) | devDependency | CLI: generate, migrate |
| `@prisma/client` | `7.10.0` (exact) | dependency | runtime client |
| `@prisma/adapter-neon` | `7.10.0` (exact) | dependency | Neon driver adapter; brings `@neondatabase/serverless` `>0.6.0 <2` itself (latest in range: 1.2.0) |
| `dotenv` | latest (no pin required by docs) | devDependency (used only by `prisma.config.ts`) | Prisma 7 does not load `.env` |
| `server-only` | latest | dependency, optional | Next.js handles it internally; install only if lint complains |
| `ws` | — | **not needed** on Node 22+ | needed only on Node 20 (see [§6](#6-request-time)) |

`dotenv` placement is a judgment call: the v7 Next.js guide installs it as a regular dependency ([Next.js guide v7][nextjs-v7]).

> [!IMPORTANT]
> **Recheck before deploy (#11):** Prisma 7.10.1 (published 2026-10-15, hours old at install) fixes 4 high `npm audit` findings in the dev-only `prisma` CLI (`deepmerge-ts`, `mysql2`); we stay on 7.10.0 until then, and the other 5 (ESLint's `braces` chain) wait for an `eslint-config-next` update, never `npm audit fix --force`.

**Version checks** (read-only `npm view`, 2026-10-15):

```
prisma@7.10.0                 exists · engines.node ^20.19 || ^22.12 || >=24.0 · peer typescript >=5.4.0
@prisma/client@7.10.0         exists · engines.node ^20.19 || ^22.12 || >=24.0 · peer typescript >=5.4.0
@prisma/adapter-neon@7.10.0   exists · no peer dependencies
  ├── @neondatabase/serverless   >0.6.0 <2
  ├── @prisma/driver-adapter-utils  7.10.0
  └── postgres-array             3.0.4
```

---

## 4. Setup time

Order you do it in:

```
1. .env                 paste DATABASE_URL + DIRECT_URL from the Neon console
        │
        ▼
2. prisma.config.ts     loads .env with dotenv, hands DIRECT_URL to the CLI
        │
        ▼
3. schema.prisma        generator + datasource (no url) + SavedSearch
        │
        ▼
4. prisma migrate dev   reads both → writes prisma/migrations/*.sql → runs it on Neon dev (direct)
```

### 4.1 `prisma.config.ts` and loading `.env`

**In plain words:** `.env` holds your secrets. `prisma.config.ts` is the settings file for the Prisma command-line tool. In Prisma 7 it must open `.env` itself (with `dotenv`), then tell the tool which database address to use.

**Example: what `.env` looks like** (*illustrative*; fake values, paste your real ones from the Neon console):

```bash
# .env  (git-ignored, never committed)
DATABASE_URL="postgresql://neondb_owner:FAKEPASSWORD@ep-cool-name-123456-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:FAKEPASSWORD@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
#                                                                  ^^^^^^^ only difference: -pooler
```

```
Without `import "dotenv/config"`:   prisma migrate dev  →  DIRECT_URL is empty  →  ✗ error, nothing runs
With it:                            prisma migrate dev  →  reads .env  →  DIRECT_URL found  →  ✓ connects
```

**Why `dotenv`:** Prisma 7 stopped loading `.env` on its own: "we're no longer automatically loading environment variables when invoking the Prisma CLI" ([7.0.0 release][rel-700]). The v7 config reference says `.env` "need[s] to be loaded explicitly" and recommends `import "dotenv/config"` ([config ref v7][config-v7]). So `dotenv` **is** a dependency; the v7 Next.js guide installs it ([Next.js guide v7][nextjs-v7]).

**Config fields** (all from [config ref v7][config-v7]):

| Field | Required? | Notes |
|---|---|---|
| `schema` | optional | Defaults to `./prisma/schema.prisma`. Relative paths resolve from the config file's folder. |
| `migrations.path` | optional | No default. |
| `datasource.url` | **required** | The URL the CLI uses for `migrate`, `db` and so on. |
| `datasource.shadowDatabaseUrl` | optional | Not needed on Neon (below). |
| `datasource.directUrl` | **removed in v7** | The upgrade guide says to put the old `directUrl` value into `url`, "because the Prisma CLI uses the `url` connection string for migrations" ([upgrade to v7][upgrade-v7]). |

**Shape**, assembled from the v7 config reference and the Neon/Prisma v7 page, which uses `env("DIRECT_URL")` ([Neon page v7][prisma-neon-v7]):

```ts
// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DIRECT_URL"), // CLI uses the direct (unpooled) connection
  },
});
```

> [!WARNING]
> `env("DIRECT_URL")` throws when the variable is missing, which breaks the Netlify build. See [§5](#5-build-time) and [Conflict 1](#9-conflicts-with-designmd).

**7.10.0 note:** 7.10.0 adds an optional `prisma7.config.*` file name for side-by-side installs with Prisma 8. Existing `prisma.config.ts` files "continue to work without migration or additional warnings" ([7.10.0 release][rel-7100]). Keep `prisma.config.ts`.

### 4.2 `schema.prisma`: no `url` in the `datasource` block

**In plain words:** the schema says *what kind* of database (Postgres) but not *where* it is. The address lives only in `prisma.config.ts` (for the tool) and `lib/db.ts` (for the app). Older Prisma tutorials put `url = env("DATABASE_URL")` here; in Prisma 7 that line is wrong.

The v7 schema reference lists only `provider` (required), `relationMode`, `schemas` and `extensions`. It says: "Connection URLs (`url`, `directUrl`, `shadowDatabaseUrl`) are configured in `prisma.config.ts`" ([schema ref v7][schema-v7]). `directUrl` exists nowhere in v7; it was removed from both the schema and the config ([config ref v7][config-v7], [upgrade to v7][upgrade-v7]).

```prisma
datasource db {
  provider = "postgresql"
}
```

### 4.3 The `prisma-client` generator

**In plain words:** the generator block tells `prisma generate` to write TypeScript code into `generated/prisma/`. That code knows your exact table, so your editor autocompletes field names and catches typos before the app runs.

**Example: what you get from the generated client** (*illustrative*):

```ts
// You write this in a route:
await prisma.savedSearch.create({
  data: { licenseType: "A/C Technician", county: "HARRIS", label: "HVAC in Harris County" },
});

// Typo → caught by TypeScript before you even run it:
await prisma.savedSearch.create({ data: { lable: "..." } });
//                                        ^^^^^ Object literal may only specify known properties
```

```prisma
generator client {
  provider = "prisma-client"
  output   = "../generated/prisma"
}
```

- **Required:** only `output`. "Only `output` is required. The other fields have defaults or are inferred" ([generators][generators]). Since 7.0, `prisma-client` is the default for new projects, and the client is no longer generated into `node_modules` ([7.0.0 release][rel-700]).
- **Optional fields** ([generators][generators]). None need setting for Next.js on Node:

  | Field | Default |
  |---|---|
  | `runtime` | `nodejs` |
  | `moduleFormat` | `esm` or `cjs`, inferred from your project (7.10.0 fixed this inference, [7.10.0 release][rel-7100]) |
  | `generatedFileExtension` | `ts` |
  | `importFileExtension` | inferred from your project |

- **Import path:** import from `<output>/client`. The docs use `import { PrismaClient } from "./generated/prisma/client"`. `client.ts` is for server code only; a separate `browser` entry exists and has no `PrismaClient` ([generators][generators]).
- **Rust engine: removed.** 7.0.0 removed `LibraryEngine`, `BinaryEngine` and the other client engines. `PrismaClient` now requires "either an adapter or" `accelerateUrl` ([7.0.0 release][rel-700], [upgrade to v7][upgrade-v7]).

### 4.4 `prisma migrate dev` and the shadow database

**In plain words:** `migrate dev` compares your blueprint to the real database, writes the SQL to close the gap, saves that SQL as a file, and runs it. To check its work, it first tries the SQL on a throwaway copy called the **shadow database**. Neon lets Prisma make that copy by itself, so you set nothing.

**Example: roughly what the init migration will contain** (*illustrative*; Prisma writes the real file):

```sql
-- prisma/migrations/20261015120000_init/migration.sql
CREATE TABLE "SavedSearch" (
    "id" SERIAL NOT NULL,
    "licenseType" TEXT NOT NULL,
    "county" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SavedSearch_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "SavedSearch_licenseType_county_key" ON "SavedSearch"("licenseType", "county");
```

`prisma migrate dev` creates and deletes a shadow database by itself. You only need `shadowDatabaseUrl` when the host does not let you create databases ([shadow database][shadow-db]). Neon supports this: "Users of Prisma Migrate no longer need to manually create a shadow database in Neon" ([Neon changelog 2023-07-13][neon-changelog]). `migrate deploy` never uses a shadow database ([shadow database][shadow-db]).

**Answer: no shadow URL is needed.**

```
prisma migrate dev  (Neon dev, DIRECT_URL)
 ├── creates a temporary shadow DB on Neon  ← automatic
 ├── diffs schema.prisma against the database
 ├── writes prisma/migrations/<timestamp>_init/migration.sql
 └── runs that SQL on Neon dev

prisma migrate deploy  (Neon production, before the deploy, from the laptop)
 └── runs pending migration files only; no shadow DB
```

---

## 5. Build time

**In plain words:** Netlify starts from a fresh copy of your repo. `generated/prisma/` is git-ignored, so Netlify has to run `prisma generate` before `next build`. `generate` never talks to the database, but it still opens `prisma.config.ts`. If that file *insists* on `DIRECT_URL` and Netlify doesn't have it, the build stops.

**Example: the same build, two configs** (*illustrative* log):

```
# config uses env("DIRECT_URL"), Netlify has no DIRECT_URL
$ prisma generate
✗ PrismaConfigEnvError: Missing required environment variable: DIRECT_URL
Build failed.

# config uses process.env.DIRECT_URL ?? ""
$ prisma generate
✔ Generated Prisma Client to ./generated/prisma
$ next build
✓ Compiled successfully
```

**Does `prisma generate` need a database URL?**

```
npm run build  (on Netlify)
 └── prisma generate
      ├── loads prisma.config.ts  ← always, even though generate needs no URL
      │    ├── url: env("DIRECT_URL")              DIRECT_URL missing → ✗ PrismaConfigEnvError, build fails
      │    └── url: process.env.DIRECT_URL ?? ""    DIRECT_URL missing → ✓ continues
      └── writes generated/prisma/
 └── next build
```

- It does not use the URL: "Commands like `prisma generate` don't need a database URL" ([config ref v7][config-v7]).
- It **does** load `prisma.config.ts` and "will still fail if `env()` throws an error when loading the config file". The error is `PrismaConfigEnvError: Missing required environment variable: ...` ([config ref v7][config-v7]).
- `env("X")` throws when `X` is missing; `process.env.X` does not. The docs say to use `process.env` "when the variable may be optional depending on the command being run". Their CI example is `url: process.env.DATABASE_URL!` or `?? ''` ([config ref v7][config-v7]).

**Two ways to make the Netlify build safe:**

| Option | Change | Result |
|---|---|---|
| (a) | `url: process.env.DIRECT_URL ?? ""` | `generate` works without `DIRECT_URL`. `migrate` would fail with an empty URL, which is what you want on Netlify anyway. |
| (b) | Set `DIRECT_URL` in Netlify's environment variables | The build always has it; one more secret on Netlify. |

**UNCONFIRMED:**
- What `generate` does with an empty-string URL is not stated in the docs, though the docs imply it is fine.
- `import "dotenv/config"` with no `.env` file (as on Netlify) loads nothing and is harmless. This is general `dotenv` behavior, not checked against a primary source here.

**Script placement:** the v7 Next.js guide runs `"postinstall": "prisma generate"` and keeps `"build": "next build"` ([Next.js guide v7][nextjs-v7]). Running `prisma generate && next build` in `build` also works. Both put generation before the Next.js build.

---

## 6. Request time

**In plain words:** when someone clicks, a route file asks `lib/db.ts` for the shared client, the client turns the request into SQL, the `PrismaNeon` adapter sends it over a WebSocket to Neon's pooler, and the rows come back the same way.

```mermaid
sequenceDiagram
  participant R as route.ts
  participant D as lib/db.ts
  participant C as PrismaClient
  participant A as PrismaNeon
  participant P as Neon pooler
  participant N as Postgres
  R->>D: import { prisma }
  Note over D: first import creates the client<br/>later imports reuse globalThis.prisma
  R->>C: prisma.savedSearch.findMany()
  C->>A: query
  A->>P: WebSocket (DATABASE_URL, pooled)
  P->>N: borrowed open connection
  N-->>P: rows
  P-->>A: rows
  A-->>C: rows
  C-->>R: SavedSearch[]
```

### 6.1 The `PrismaNeon` constructor (7.10.0 source)

- `PrismaNeon` is an alias: `export { PrismaNeonAdapterFactory as PrismaNeon, PrismaNeonHttpAdapterFactory as PrismaNeonHttp }` ([index.ts @7.10.0][src-index]).
- Signature: `constructor(config: neon.PoolConfig, options?: PrismaNeonOptions)`. `PrismaNeonOptions` has three optional fields: `schema`, `onPoolError` and `onConnectionError` ([neon.ts @7.10.0][src-neon]).
- So `{ connectionString }` is a Neon `PoolConfig`, and this adapter talks to the database over **WebSockets**.

```ts
import { PrismaNeon } from "@prisma/adapter-neon";
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
```

Source: [Neon page v7][prisma-neon-v7] and [Neon docs][neon-prisma].

### 6.2 WebSockets and `ws` (sources disagree)

| Source | Says |
|---|---|
| Adapter README @7.10.0 ([README][readme]) | Still shows `import ws from 'ws'` and `neonConfig.webSocketConstructor = ws`. |
| Neon serverless driver ([docs][neon-serverless]) | "Node.js 22 and later include a built-in WebSocket, so this step is optional." Node 21 and earlier need `ws`. |
| Neon Prisma guide ([docs][neon-prisma]) | "Do not install `@neondatabase/serverless` or `ws` as separate packages." |
| Next.js 16 ([upgrade guide][nextjs16]) | Next.js itself only needs Node 20.9+. |

```
Which Node runs the server?
 ├── Node 22 or later  →  built-in WebSocket  →  skip ws               ✓ laptop (v26.7.0)
 └── Node 20           →  add ws + neonConfig.webSocketConstructor = ws
```

**Takeaway:** pin Node 22 or later locally and on Netlify. Netlify's default Node version for builds and functions is **UNCONFIRMED** (not checked against netlify.com docs).

### 6.3 The Next.js singleton (`globalThis`)

The v7 Next.js guide stores the client on `global` and caches it only when `NODE_ENV !== "production"` ([Next.js guide v7][nextjs-v7]):

```ts
const globalForPrisma = global as unknown as { /* prisma: PrismaClient */ };
// ...
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

`globalThis` works the same way in Node; the v7 Nuxt guide uses it ([Nuxt guide v7][nuxt-v7]). Why it matters: `next dev` reloads modules on every save; `globalThis` survives the reload, so the app keeps one client instead of opening a new pool each time.

**In plain words:** `globalThis` is a shelf that survives reloads. The first time, you build the remote control and put it on the shelf. After every reload, you grab it off the shelf instead of building a new one.

**Example: you save a file 20 times during `npm run dev`** (*illustrative*):

```
Without globalThis:  save 1 → client #1 (+ its connections)
                     save 2 → client #2 (+ more connections)   ← #1 still open
                     ...
                     save 20 → client #20 → warning: too many connections

With globalThis:     save 1 → client #1 → put on the shelf
                     save 2..20 → found on the shelf → reuse client #1
```

In production (Netlify) the code doesn't reload, so the shelf isn't used there; each server function simply makes its client once.

```
import { prisma } from "@/lib/db"
 └── globalForPrisma.prisma exists?
      ├── yes → reuse it
      └── no  → createClient()  →  new PrismaNeon(...)  →  new PrismaClient({ adapter })
                └── not production? → save on globalThis for the next reload
```

**Sketch for this repo**, built from the sources above:

```ts
// lib/db.ts
import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

### 6.4 `server-only` in Next.js 16

**In plain words:** a lock on `lib/db.ts`. `db.ts` reads `DATABASE_URL`, which contains your database password. If browser code ever imported it, that password could ship to every visitor. With `server-only`, the build refuses instead.

**Example** (*illustrative*):

```tsx
// components/SavedList.tsx
"use client";
import { prisma } from "@/lib/db";   // ✗ mistake: browser code importing the database
```

```
$ npm run build
✗ Error: 'server-only' cannot be imported from a Client Component module.
```

The fix is always the same: the browser calls `fetch("/api/searches")`, and only the route file imports `lib/db.ts`.

- Put `import 'server-only'` at the top of a server-only module. If a Client Component imports that module, you get "a build-time error" ([Next.js server/client components][nextjs-server-only]).
- "In Next.js, installing `server-only` or `client-only` is **optional**." Next.js handles the import internally and ships its own types. Install the package only if lint rules flag the extraneous import: `npm install server-only` (same source).

```
'use client' component
 └── imports lib/db.ts
      └── import "server-only"  →  ✗ build error  (DATABASE_URL never reaches the browser)
```

---

## 7. Neon: pooled vs direct

**In plain words:** opening a database connection is slow, and Postgres only allows a limited number at once. The **pooler** keeps a few connections open and lends one to each query, then takes it back. That's perfect for the app's many quick requests. A migration is different: it needs one steady connection for its whole run, so it goes **direct**.

**Example: 50 people click at once** (*illustrative* numbers):

```
Without a pooler:  50 server functions → 50 new Postgres connections → slow, may hit the limit
With the pooler:   50 server functions → pooler → a handful of open connections, taken in turns
                                                   each query borrows one, returns it in milliseconds

prisma migrate dev → direct → one connection held for the whole migration (locks, multi-step changes)
```

| | Pooled (`DATABASE_URL`) | Direct (`DIRECT_URL`) |
|---|---|---|
| Hostname | contains `-pooler` | no `-pooler` |
| What it is | PgBouncer in transaction mode (`pool_mode=transaction`) | a plain Postgres connection |
| Used by | the app at request time (`lib/db.ts`) | the Prisma CLI (`migrate dev`, `migrate deploy`) |
| Why | many short requests share a few real connections | migrations need features transaction pooling lacks |

Sources: [Neon docs][neon-prisma], [Neon pooling][neon-pooling].

- Neon lists schema migrations under direct connections because "Tools may not support transaction pooling". It also lists "Session-level advisory locks" as unsupported on pooled connections ([Neon pooling][neon-pooling]).
- "Prisma Migrate requires a direct connection to perform schema changes" ([Neon Prisma migrations][neon-migrations]). Prisma's v7 page agrees: "Use separate URLs for CLI (direct) and runtime (pooled)" ([Neon page v7][prisma-neon-v7]).
- **Naming:** Neon calls its direct variable `DATABASE_URL_UNPOOLED`; Prisma's page uses `DIRECT_URL`. The name is your choice; ours is `DIRECT_URL`.

> [!CAUTION]
> The `.env` example on Prisma's v7 Neon page shows port `6543` and `?pgbouncer=true` ([Neon page v7][prisma-neon-v7]). Do not copy that. Paste the exact pooled and direct strings from the Neon console.

---

## 8. Model features and error codes

**In plain words:** `@updatedAt` stamps the time on every edit for you. `@@unique([licenseType, county])` means the same type and county pair can be saved only once. When a rule is broken, Prisma throws an error with a code; the route turns that code into the right HTTP status.

**Example: saving the same search twice** (*illustrative*):

```
1st save  { licenseType: "A/C Technician", county: "HARRIS" }  →  ✓ row id 1     →  201
2nd save  { licenseType: "A/C Technician", county: "HARRIS" }  →  ✗ P2002       →  409 "You already saved this search."
3rd save  { licenseType: "A/C Technician", county: "DALLAS" }  →  ✓ row id 2     →  201   (different pair, allowed)

edit id 99999                                                  →  ✗ P2025       →  404 "That saved search no longer exists."
```

| Feature | Status in 7.x | Detail | Source |
|---|---|---|---|
| `@updatedAt` | ✓ same | "Automatically stores the time when a record was last updated". "Implemented at Prisma ORM level", not by the database. An empty update leaves it unchanged. | [schema ref v7][schema-v7] |
| `@@unique([a, b])` | ✓ same | Default compound name is `fieldName1_fieldName2`, so ours is `licenseType_county`. Use that name in `where` for `findUnique` or `upsert`. | [schema ref v7][schema-v7] |
| P2002 (unique violation) | ✓ same | The v7 error-handling page imports `Prisma` from the generated client and checks `e.code === "P2002"`. 7.10.0 fixes: "correct `meta.modelName` in nested-write `P2002` errors", "constraint names are preserved in `P2002` errors". | [error handling v7][errors-v7], [7.10.0 release][rel-7100] |
| P2025 (record not found) | ✓ code confirmed | "An operation failed because it depends on one or more records that were required but not found." This wording is from the **v6** reference; the v7 error-reference page describes Prisma Next's dotted codes, so the v7 wording is **UNCONFIRMED**. 7.10.0 fixes "`P2025` rejections for every missing record in batched `findUniqueOrThrow()`". | [errors v6][errors-v6], [7.10.0 release][rel-7100] |

```ts
import { PrismaClient, Prisma } from "../generated/prisma/client";
// e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002"
```

How the routes will use them (from `design.md`):

```
prisma.savedSearch.create(...)   duplicate licenseType + county  →  P2002  →  409 "You already saved this search."
prisma.savedSearch.update(...)   no such id                      →  P2025  →  404 "That saved search no longer exists."
prisma.savedSearch.delete(...)   no such id                      →  P2025  →  404
```

---

## 9. Conflicts with design.md

**No outright conflicts.** Every planned piece matches the Prisma 7.10 and Neon docs. Three gaps need a decision before the build works on Netlify.

| # | Gap | Design says | Problem | Fix |
|---|---|---|---|---|
| 1 | Netlify build vs `env("DIRECT_URL")` | `prisma.config.ts` "gives the CLI DIRECT_URL", and the build runs `prisma generate` | If the config uses `env("DIRECT_URL")` and Netlify lacks it, `prisma generate` fails at config load, so the deploy fails | Use `process.env.DIRECT_URL ?? ""`, or add `DIRECT_URL` to Netlify ([config ref v7][config-v7]) |
| 2 | Node version for WebSockets | nothing | `PrismaNeon` uses Neon's WebSocket `Pool`. Node 22+ works as is; Node 20 needs `ws` + `neonConfig.webSocketConstructor` | Pin Node 22+ on Netlify. Netlify's default is UNCONFIRMED ([Neon serverless driver][neon-serverless]) |
| 3 | `dotenv` dependency | `prisma.config.ts` loads `.env` | In Prisma 7 that means `import "dotenv/config"`, so `dotenv` must be installed | Add `dotenv` to the install list ([config ref v7][config-v7]) |

**Confirmed as designed:**

- [x] `datasource` block with no `url`
- [x] `prisma-client` generator with `output`
- [x] `SavedSearch` model (`@updatedAt`, `@@unique`)
- [x] `PrismaNeon` with the pooled `DATABASE_URL`
- [x] `globalThis` singleton
- [x] `server-only`
- [x] `generate` before `next build`
- [x] `migrate dev` on Neon `dev` with no shadow URL
- [x] `migrate deploy` from the laptop with `DIRECT_URL` pointed at Neon `production` (deploy uses no shadow database)

---

## Sources

All accessed 2026-10-15. The Neon shadow-database changelog link came from a search result and was not opened.

**npm** (checked with `npm view`)
- [prisma 7.10.0][npm-prisma]
- [@prisma/client 7.10.0][npm-client]
- [@prisma/adapter-neon 7.10.0][npm-adapter]
- [@neondatabase/serverless][npm-serverless]

**Prisma releases and source**
- [Prisma 7.0.0 release notes][rel-700]
- [Prisma 7.10.0 release notes][rel-7100]
- [adapter-neon README @7.10.0][readme]
- [adapter-neon `index.ts` @7.10.0][src-index] · [`neon.ts` @7.10.0][src-neon]

**Prisma docs (v7)**
- [Prisma config reference][config-v7]
- [Prisma schema reference][schema-v7]
- [Upgrade to Prisma ORM 7][upgrade-v7]
- [Generators][generators]
- [PostgreSQL / Neon][prisma-neon-v7]
- [Next.js guide][nextjs-v7] · [Nuxt guide][nuxt-v7]
- [Shadow database][shadow-db]
- [Error handling][errors-v7]
- [Error reference (v6, for P2025 wording)][errors-v6]

**Neon docs**
- [Connect from Prisma][neon-prisma]
- [Schema migrations with Prisma][neon-migrations]
- [Connection pooling][neon-pooling]
- [Serverless driver][neon-serverless]
- [Changelog 2023-07-13 (shadow DB)][neon-changelog]

**Next.js docs**
- [Server and Client Components (`server-only`)][nextjs-server-only]
- [Next.js 16 upgrade guide (Node 20.9+)][nextjs16]

[npm-prisma]: https://www.npmjs.com/package/prisma/v/7.10.0
[npm-client]: https://www.npmjs.com/package/@prisma/client/v/7.10.0
[npm-adapter]: https://www.npmjs.com/package/@prisma/adapter-neon/v/7.10.0
[npm-serverless]: https://www.npmjs.com/package/@neondatabase/serverless
[rel-700]: https://github.com/prisma/prisma/releases/tag/7.0.0
[rel-7100]: https://github.com/prisma/prisma/releases/tag/7.10.0
[readme]: https://github.com/prisma/prisma/blob/7.10.0/packages/adapter-neon/README.md
[src-index]: https://github.com/prisma/prisma/blob/7.10.0/packages/adapter-neon/src/index.ts
[src-neon]: https://github.com/prisma/prisma/blob/7.10.0/packages/adapter-neon/src/neon.ts
[config-v7]: https://www.prisma.io/docs/orm/v7/reference/prisma-config-reference
[schema-v7]: https://www.prisma.io/docs/orm/v7/reference/prisma-schema-reference
[upgrade-v7]: https://www.prisma.io/docs/guides/upgrade-prisma-orm/v7
[generators]: https://www.prisma.io/docs/orm/prisma-schema/overview/generators
[prisma-neon-v7]: https://www.prisma.io/docs/guides/database/neon
[nextjs-v7]: https://www.prisma.io/docs/guides/v7/frameworks/nextjs
[nuxt-v7]: https://www.prisma.io/docs/guides/v7/frameworks/nuxt
[shadow-db]: https://www.prisma.io/docs/orm/prisma-migrate/understanding-prisma-migrate/shadow-database
[errors-v7]: https://www.prisma.io/docs/orm/v7/prisma-client/debugging-and-troubleshooting/handling-exceptions-and-errors
[errors-v6]: https://www.prisma.io/docs/orm/v6/reference/error-reference
[neon-prisma]: https://neon.com/docs/guides/prisma
[neon-migrations]: https://neon.com/docs/guides/prisma-migrations
[neon-pooling]: https://neon.com/docs/connect/connection-pooling
[neon-serverless]: https://neon.com/docs/serverless/serverless-driver
[neon-changelog]: https://neon.com/docs/changelog/2023-07-13
[nextjs-server-only]: https://nextjs.org/docs/app/getting-started/server-and-client-components
[nextjs16]: https://nextjs.org/docs/app/guides/upgrading/version-16
