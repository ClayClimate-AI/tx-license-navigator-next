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
