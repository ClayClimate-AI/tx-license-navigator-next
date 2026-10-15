# Background Brief: Week 5 Project

This file is context only. It is not a spec and not a plan. Nothing here is decided unless it says so. The goal is to give Claude enough background to ask me good questions before any spec exists.

## What this is

I am Joseph, a student in Next Chapter Phase 2. This week I build my first real full stack app with a database. It grows out of the app I shipped in Week 4. I want to come out of this week able to explain the architecture, the order things happen in, how data moves, and the syntax, in my own words.

## The assignment

Course: Next Chapter Phase 2, Week 5, Monday Oct 12 to Friday Oct 16, 2026.

Week 5 topics:
- Thinking in components
- Full stack app with Next.js
- Databases and migrations (inferred from my notes, not from the course text)
- CRUD app build day
- Friday demo

How it is graded, from my notes on the Week 5 pages:
- Demo day: show an app that creates, reads, updates, and deletes real data, and explain the data flow.
- Control under constraints: I understand and review what the AI agent wrote.
- Evidence: Prompt Log entries for exploration prompts, LMS check questions, and exit tickets.
- The grade is about control, not complexity. The main risk is building too much.

Note: I have not seen the exact assignment text beyond these notes. Anything beyond the bullets above is my guess.

## Week 4: what we built

Name: Second Chance License Navigator (HVAC)
Live: https://tx-license-navigator.netlify.app
Repo: https://github.com/ClayClimate-AI/tx-license-navigator

Who it is for: people with a criminal record deciding if an HVAC trade is worth training for. Pick a Texas license type and a county, and the app shows how many people hold that license with that county as their business county. More holders usually means more shops nearby. A count is not a job listing.

Stack: React, Vite, Tailwind CSS. The browser called the public data API directly. No server, no database, no API key.

Data source: TDLR All Licenses on data.texas.gov, dataset `7358-krk7`, queried with Socrata SoQL. No key needed.

```
https://data.texas.gov/resource/7358-krk7.json
```

Features:
- Live holder count for a license type and a county.
- License types loaded live from TDLR (top 50 by holder count), with `A/C Technician` and `A/C Contractor` pinned in an "HVAC" group.
- Counties were a hardcoded list in `src/data/counties.js` (Title Case labels, ALL CAPS values sent to the API).
- Result states: idle, loading, success, empty (zero), and error with the status code and a Try again button.
- "See the exact data request" link on each result so the number can be checked in a browser.
- Counts only: the app never asks for or shows names, addresses, or license numbers.
- A dev switch, `?break=column`, forced a 400 error to demo the error state.
- Checked numbers: A/C Technician in Harris showed 12,095. Loving County showed 0 (the empty state test).
- Hooks only in `App.jsx` (useState, useEffect, useCallback, useRef). Components got data through props.

Look in one line: a plain government style page with a navy and blue header, a thin red stripe, a light gray background, and big navy numbers. See `UI.md`.

How I worked: spec first, one task at a time, a `PROMPT_LOG.md` written in HTML inside Markdown with call graphs, and PIOF (Purpose, Input, Output, Flow) to check each step.

## Week 5: the idea

Proposed, not final.

How it builds on Week 4: rebuild the same app in Next.js (App Router) in a fresh repo, proposed name `tx-license-navigator-next`. Then add a saved searches watchlist stored in a database.

Proposed features:
- Save a search (license type plus county) with a label and a note. The note is framed as "why I'm tracking this."
- See the list of saved searches. Each card shows a live TDLR count fetched on the server side.
- Edit a saved search (at least the label and note).
- Delete a saved search.
- The saved list is still there after a reload or restart.

That covers Create, Read, Update, and Delete.

Proposed tools (none locked in):
- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma with SQLite

How I work this week: inside an IDE (Kiro or Claude Code), not copy and paste from a chat. I still want PIOF checks and a prompt log like Week 4.

## Stretch (later, not this week)

"Ask the law" on each card: a RAG feature that answers questions about the rules for that license, with citations. It would use my Claude API key on the server only. Only if the main app is done and solid. Probably on its own branch.

## Why it matters to me

I am on my own HVAC journey, so this app is close to home. It is my first full stack app with a database. I care more about understanding every piece than about a long feature list. If I cannot explain a piece, it should not be in the demo.

## Where I am as a learner

I am relearning React and Next.js. I am strong with AI tools but newer to how React, Next.js, databases, and APIs fit together. So clarity at every step matters most, especially when I decide whether to approve a diff. I should never accept a change I cannot explain.

## The habit I am building: small steps, steer closely

The loop: ask, review the diff, accept, test it works, commit, next.

- Never let the agent make ten changes before I commit once. Small steps I understand and have saved are fast and safe.
- Steer closely (small tasks, review each step) when the change matters, touches something important, or I am unsure.
- Let it run a bit (bigger task, review at the end) only for low stakes, well understood work.
- Early on, I steer closely: small tasks, review every diff. Starting tight is how I build judgment safely.

## How I want to learn while building (idea, not rules yet)

I want a second agent that acts as a tutor. It would help me understand each change before I accept it.

- The build agent makes a change and reports it in PIOF (Purpose, Input, Output, Flow).
- The tutor reads the diff (the lines that changed) and explains it in plain words, 5th to 8th grade level, simple meaning first, then the real term.
- For each piece it would cover what it is, what it does in this code, and what would break if it were missing or wrong.
- It would point out new syntax worth learning, flag anything that does not match the PIOF, and ask me a few check questions.
- It only reads. It never edits code, runs git commands that change things, or writes my Reflection or Explained.

How this fits into the build (which tool, when it runs, what it can read) is still open. We decide that in the grill session.

## Hypothetical timeline (a target, not a commitment)

This is what I am aiming for. It stays loose until the grill session shows whether these goals are still doable.

- Tuesday Oct 13: get a clear understanding of the build, then set up the new project and see the first page.
- Wednesday Oct 14: components on the page, then the server route that gets live TDLR counts.
- Thursday Oct 15 (build day): saving searches to the database with create, read, update, delete, all lasting after a restart. Then stop adding features.
- Friday Oct 16: demo day. Rehearse and present.

Rough size: about 9 to 11 hours of building without the stretch. The RAG stretch would add about 4 to 6 hours, so it waits until after the demo.

## Open questions

Nothing below is decided. These are for the grill session.

Scope
- What is the smallest version that still shows full CRUD and the data flow?
- Do I keep the Week 4 single search feature, or does the watchlist replace it?
- What is out of scope this week, said plainly?

Data and database
- Is SQLite with Prisma the right fit, or is something simpler enough?
- What fields does a saved search have? (label, note, license type, county, dates?)
- Is the count saved in the database, or always fetched live?
- Can two saved searches be the same type and county?

License types and counties
- Where do license type options come from: live from TDLR like Week 4, or a short hardcoded list?
- Do I keep the HVAC pinned group?
- Is the county list still hardcoded? All 254 counties or a short list?

Editing
- What can be edited: only label and note, or also type and county?
- Edit in place on the card, or in a separate form?
- Do I need a confirm step before delete?

Server and data flow
- Which parts run on the server and which run in the browser?
- How does a card get its live count?
- What happens when TDLR is down or slow? What happens when the database fails?
- How do I show an error on purpose for the demo, like `?break=column` in Week 4?

Look and feel
- Do I keep the Week 4 look exactly? (see `UI.md`)
- What does the page show when nothing is saved yet?

Process
- What does my PIOF check look like for each piece?
- What goes in the prompt log this week, and in what format?
- How do I prove it works for the demo (reload, Network tab, database view)?
- How should the tutor agent be set up, and at what point in each change does it run?
- How small should each step be, and what must I be able to explain before I approve a diff?
- After the grill session, is this timeline still realistic, and what gets cut first if not?
