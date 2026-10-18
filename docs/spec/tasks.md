# Tasks

The work is the 11 GitHub issues on `ClayClimate-AI/tx-license-navigator-next`. Each issue says what to build, its acceptance criteria (with the requirement IDs from `requirements.md`), what blocks it, and its estimate. This file holds what the issues don't: the checkpoints, the manual check list, and the cut order.

## Working an issue

1. Joseph: "Work issue #N." Only an issue with no open blockers (no ⛔ Blocked badge on GitHub).
2. Agent posts `Started` on the issue, reads its acceptance criteria, and proposes the small steps.
3. Each step: ask → review diff → accept → test → commit (see `CLAUDE.md` → The loop).
4. When every acceptance criterion passes: agent adds `Actual:` to the issue; Joseph ends the last commit message with `Closes #N` and pushes.
5. Joseph runs `/clear`, then the next issue.

Build order: #1 → #2 → #3 → #4 → #5 → #6 → #7 → #8 → #9 → #10 → #11. (#6 only needs #1, so it can run early if #2 is stuck.)

Week 4 source to port from: the Week 4 repo (https://github.com/ClayClimate-AI/tx-license-navigator), `src/components/` and `src/api/tdlr.js`.

## Checkpoints

At each checkpoint, compare against the list and apply the named cut if behind.

| When | Should be closed | If not |
|---|---|---|
| Fri end of day | #2–#5: read, delete, edit work on localhost | Apply cut 2 (skip #7) |
| Sat end of day | #6–#8: search and save work | Apply cut 1 (skip #9) |
| Sun 18:00 CT | #9 and #10 closed, #11 started | If #11 is blocked at 22:00, apply cut 4 |
| Mon morning | demo prep (see Monday below) | — |

## Replan · Sat Oct 17 (replaces the Sat and Sun checkpoints above)

Decided by Joseph, Sat Oct 17 ~13:45 CT.

- **Everything left finishes today.** Joseph has school work on Sunday, so no build work moves to Sunday.
- **Order:** #5 Edit → #6 Search → #7 Live types → #8 Save → #10 Done check → #11 Deploy.
- **#9 cut** (cut 1), closed `wontfix`: about 9 h of work were left against about 10.5 h in the day, and #9 is first in the cut order.
- **#7 kept** and moved up to follow #6: two license types make the app feel thin, and #7 reuses #6's TDLR code while it's fresh. If #6 runs long, #7 moves after #11.
- **#11 stays a must:** `requirements.md` V1 requires the live site. Cut 4 applies only if Netlify itself blocks.
- **No early test deploy:** Joseph works one issue at a time, in order, to keep a clear picture of how the pieces connect.
- **Lighter recaps from #5 on:** full recap and flow map for new patterns (#6, #8, #11), short ones for repeats (#5, #7, #10). Diff, accept, test, commit and push, and the prompt log stay the same for every step.

## Status · Sun Oct 18 (~00:50 CT, end of Saturday's session)

- **Saturday's plan slipped.** #5 closed (Actual 2 h). #6 started Sat ~21:40 CT and is at D4 of 6: D1 `lib/tdlr.ts`, D2 `GET /api/count`, D3 `LicensePicker` are committed and pushed (`afdefed`). D4 `ResultCard`, D5 wire up in `Navigator`, D6 checks and close are left.
- **#7 moves after #11**, by the Saturday rule "if #6 runs long". Order now: #6 → #8 → #10 → #11 → #7. #7 is built only if time is left before the demo; if not, it is closed with cut 2.
- **Build work now runs into Sunday and Monday morning.** Left, by the issue estimates: #6 ~1 h, #8 1.5 h, #10 1.5 h, #11 1.5 h, Monday demo prep ~1 h (≈ 6.5 h), plus #7 1 h if kept. At this week's pace, expect about 1.3× that.
- **Open, for Joseph:** how many hours Sunday allows around school work, and the demo time on Monday. Those decide whether #7 is built or cut.

## Why the build ran over time and tokens

Estimates against actuals, closed issues (wall clock from `Started`, includes breaks and overnight gaps):

| Issue | Estimate | Actual |
|---|---|---|
| #1 Project shell | 2.5 h | 12.5 h |
| #2 Database ready | 3 h | 31.9 h |
| #3 See my saved searches | 2 h | 2.25 h |
| #4 Delete a saved search | 1 h | 4 h |

Active time on the command center (gaps over 30 minutes count as breaks): Stage B 9 h 05 min, Stage C 6 h 35 min, as of Oct 17 ~13:30 CT.

Why:

1. **First full-stack build.** Joseph's first time with Neon, Postgres, Prisma 7, and route handlers together. The estimates assume someone already fluent in the stack. This build is his baseline, not a missed target.
2. **Learning time, chosen on purpose.** Each step got a recap, a restatement, a reflection, and from #4 on a flow map. Joseph built the `flow-map` skill during #4. In the session for #4, Claude was working about 2 h and the rest was Joseph reading, testing, and writing.
3. **Database setup cost the most.** #2 covered researching Prisma 7 with the Neon adapter, Neon branches, env vars, and the first migration. #3 then hit a `DATABASE_URL` pointing at the wrong Neon endpoint (PROMPT_LOG Entry 17).
4. **Process fixes along the way.** Examples: commit and push made part of closing every step; the recap format reworked several times on Joseph's request.
5. **Tokens.** Most tokens are cache reads of a long conversation, about 14.2 M in the #4 session, est. $7.70 for that session. They grow with session length, so long explanation threads cost the most. Step C2.3 used about 4.7 M while the flow map was redrawn several times. `/clear` between issues keeps this down.

What changes from #5 on: the issue estimates are the plan (no 2× padding); light recaps for repeat patterns; the three-level bar for what Joseph needs to know (must know / recognize / look up).

## Cut order (fallback)

Apply only at a checkpoint, in this order. A cut issue is closed with the `wontfix` label and a one-line reason. Never cut: CRUD, persistence, Zod, focus and announcements, the prompt log.

1. Skip #9 (live counts on saved cards). Cards show label, type, county and note.
2. Skip #7 (live license types). The search keeps the two HVAC types from #6.
3. Duplicate rule (409): decided at #2; kept.
4. Skip #11 (deploy). Demo on localhost against Neon `dev` with Prisma Studio.

## When something breaks

Use skill `diagnosing-bugs` instead of guessing fixes. The fix is its own small step.

## Manual check list (used by #10 and #11)

- [ ] Reload: saved searches are still there. Stop and restart `npm run dev`: still there. [R5]
- [ ] Network tab: each action shows its request (GET, POST, PATCH, DELETE) with the expected status.
- [ ] `curl`: bad body → 400, id `abc` → 400, id `99999` → 404, duplicate → 409.
- [ ] Neon table view: rows match the page after create, edit, delete.
- [ ] `?break=column`: search and cards show the error state with code 400.
- [ ] Loving: empty state, and it can be saved.
- [ ] Keyboard only: search, save, edit, delete; focus lands where `design.md` says; status line announces each.
- [ ] No names, addresses, or license numbers anywhere; `.env` not in git.

## Monday (not an issue)

The demo moved from Friday Oct 16 to Monday Oct 19 (approved). Demo prep before the demo: add two saved searches on the live site; the agent asks Joseph for the Friday submit fields ("Change I will explain", "Mistake I caught") and adds his answers verbatim to `PROMPT_LOG.md`; sum each issue's Estimate and Actual into a table in `PROMPT_LOG.md`; decide how to share the private repo for submission; one rehearsal.
