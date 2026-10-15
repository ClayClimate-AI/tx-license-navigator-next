# Requirements

What the app must do. Each line is a checkable statement; the ID is what tasks and the prompt log point at. How each is built (schema, routes, wording) lives in `design.md`.

## Who it is for

People with a criminal record deciding whether an HVAC trade is worth training for in Texas. A holder count is a demand signal, not a job listing.

## Search (carried over from Week 4)

- **S1** When the page loads, the app shall load license types from TDLR (top 50 by holder count) with `A/C Technician` and `A/C Contractor` pinned in an "HVAC" group.
- **S2** The county select shall offer the 13 Week 4 counties, including Loving.
- **S3** When the user submits a type and county, the app shall show the TDLR holder count for that pair.
- **S4** The result shall show one of five states: idle, loading, success, empty (count is 0), error.
- **S5** Success and empty results shall show a "See the exact data request" link to the real TDLR query URL.
- **S6** When the TDLR call fails or takes longer than 8 seconds, the result shall show the error state with its code and a Try again button.
- **S7** When the page URL has `?break=column`, the count request shall fail with TDLR's 400 so the error state can be demoed.

## Watchlist: create

- **C1** When the result is success or empty, the result card shall offer "Save to watchlist". Idle, loading, and error hide it.
- **C2** Save shall store the type and county of the search on screen, not the current select values.
- **C3** The save form shall have a label (required, 1–80 characters, prefilled "{type} in {county} County", editable) and a note (optional, up to 280 characters).
- **C4** When the same type and county are already saved, the save shall fail with "You already saved this search." and keep what the user typed.

## Watchlist: read

- **R1** The page shall always show a "My saved searches" section, newest first.
- **R2** When nothing is saved, the section shall say "Nothing saved yet. Run a search above, then select Save to watchlist."
- **R3** Each saved card shall show its label, type, county display name, note, and a live TDLR count with its own loading, empty, and error states.
- **R4** A failed count on one card shall leave the other cards unaffected.
- **R5** Saved searches shall still be there after a page reload and a server restart.

## Watchlist: update

- **U1** Each card shall offer Edit, which turns the label and note into fields on the card with Save and Cancel.
- **U2** Only the label and note can change. Type and county stay fixed.

## Watchlist: delete

- **D1** Each card shall offer Delete, which asks on the card: "Delete this saved search?" with Delete and Keep.
- **D2** Delete removes the saved search; Keep returns the card to normal.

## Errors

- **E1** Any request with an invalid body or id shall be refused (400) before it reaches the database.
- **E2** Edit or delete of an id that does not exist shall be refused (404).
- **E3** When the database cannot be reached, the user shall see "We could not reach the saved searches database." Failed saves and edits keep what the user typed. A failed list load offers Try again.

## Accessibility (Week 4 rules carry over, plus)

- **A1** The status line shall announce "Saved.", "Changes saved.", and "Deleted."
- **A2** Focus after save: the new card's heading. After edit: that card's Edit button. After delete: the "My saved searches" heading. After Cancel or Keep: the button that opened the form.

## Privacy

- **P1** TDLR queries shall use only `license_type`, `business_county`, and `count(*)`. The app never fetches or shows personal records.
- **P2** Database credentials shall stay on the server and out of git.

## Delivery

- **V1** The app shall be live on Netlify, backed by Neon `main`, by Thursday Oct 15 night.

## Out of scope this week

- "Ask the law" RAG feature.
- Automated tests (a manual check list is in `tasks.md`).
- Caching TDLR counts, storing counts in the database, user accounts.
