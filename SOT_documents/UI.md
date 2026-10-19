# UI Context: the Week 4 Look

This file is context only. Part 1 is facts about how Week 4 looked, taken from the Week 4 source code (`src/App.jsx` and `src/components/`). Part 2 is open questions for Week 5. Nothing in Part 2 is decided.

## Part 1: Week 4 look (facts)

### Overall
- One column, centered, max width `max-w-3xl`.
- Page background light gray `#F3F5F8`. Main text dark `#1B2733`.
- Styled with Tailwind only. No component library.
- Plain government style. Calm, readable, no flashy effects.

### Header (three bands, top to bottom)
1. Thin navy strip `#14304F`, small text (13px) in `#DCE5EF`: "A student project. Not an official State of Texas website."
2. Blue title band `#1F5C99`: site name "Second Chance License Navigator" (22px, bold, white) and a subtitle "HVAC license demand by Texas county" (14px, `#CFE0F2`).
3. Thin red stripe `#A3243B`, 4px tall.

### Page top
- Page heading (h1): "Look up HVAC license demand by county", 26px bold, navy `#14304F`.
- Intro line, 16px, `#2B3A49`.
- Trust note: green left border `#2D5A27` on light green `#EAF2E6`, text `#1F3D1B`. Says "We show counts only. We never show names, addresses, or personal license records."

### Form
- White box with a light border `#C7D0DB`.
- Legend: "Choose a license and a county" (17px bold).
- Two selects side by side on wider screens: License type and County. Each has a bold label (15px) and a gray hint (14px, `#4A5A6A`).
- License type hint: "Technicians work for a company. Contractors run the business."
- County hint: "The county where the business is listed."
- License type list had two groups: "HVAC" and "All other license types". While loading it said "Loading license types…".
- County error text in red `#A3243B`: "There is a problem: …"
- Button: navy `#14304F`, white bold text, hover `#0E2238`. Says "Show license count", or "Checking…" while busy.
- Week 5 wording (#7, all license types): subtitle "License demand by Texas county"; h1 "Look up license demand by county"; intro "See how many people hold a Texas license, such as HVAC or electrician, in a county. Use it to judge local demand before you train or apply."; license type hint "HVAC types are listed first. For HVAC, technicians work for a company and contractors run the business."; empty result last line "Try a nearby county or another license type." (#10)
- Outline button (Week 5, saved cards: Delete, Keep): white, navy `#14304F` border and bold text, hover light navy tint `#EEF2F6`. The confirmed Delete uses the red Try again style (`#A3243B`, hover `#82192D`).

### Status line
- One short line above the result, also read out by screen readers. Example: "Ready. Choose a license type and a county."

### Result card states (Week 4 wording)
| State | Look | Words |
|---|---|---|
| Idle | Dashed gray border, very light gray box | "Your result will appear here" / "Pick a license type and a county, then select Show license count." |
| Loading | White box, gray border | "Checking Texas license records" / "This usually takes a few seconds." |
| Success | White box, thick blue left border `#1F5C99` | Small "RESULT" label, then "{type} in {county} County", then the count at 44px extra bold navy `#14304F`, then "people hold this license with {county} County listed as their business county." and "A count is not a job listing." |
| Empty (zero) | Light yellow `#FFFBEB`, border `#E3C46B` | "No matching records found" / "TDLR lists no {type} licenses with {county} County as the business county." / "Try a nearby county or the other license type." |
| Error | Light pink `#FDF2F4`, red border `#A3243B` | "We could not reach the Texas data service." then "(error 400)" or "(no connection)" in mono, then "This is a problem on our side, not something you did. Your choices are saved." and a red "Try again" button |

- Success and empty cards had a "See the exact data request" link (blue `#1A5FB4`, underlined) that opens the real query URL.
- Empty is shown as an answer, not a failure.

### Footer
- Navy `#14304F`, text `#DCE5EF`, 14px.
- "Source: TDLR All Licenses on data.texas.gov (dataset 7358-krk7)." and "General information, not legal advice."

### Accessibility
- Yellow focus ring on every control: 3px outline, color `#F2B807`.
- Real labels on every select. Hints tied in with `aria-describedby`.
- Field errors use `role="alert"` and `aria-invalid`.
- Status line uses `role="status"` and `aria-live="polite"`, always on the page.
- After a search, keyboard focus moves to the result heading.
- Text is 14px or larger for normal reading. Numbers use tabular figures.

## Part 2: Week 5 additions to think about (open questions)

Week 4 had no saved list, edit, or delete, so none of this has a look yet.

Page shape
- Do I keep the same header, trust note, and footer?
- What is the new page heading?
- Where does the save form sit compared to the saved list?
- Does the Week 4 single result card still exist?

Saving
- What fields show in the save form beyond type and county (label, note)?
- How should the note be worded so it reads as "why I'm tracking this"?
- What does the page show right after a save works? After a save fails?

Saved list
- What does each saved card show: label, type, county, note, live count, date?
- How does each card show the four states (loading, zero, error, ready)? Same colors as Week 4?
- What does the page look like when nothing is saved yet?
- What order are cards in?

Editing
- Edit right on the card, or in a separate form?
- What can change, and what does the card look like while editing?
- How do Save and Cancel look and read?

Deleting
- Is there a confirm step? What does it say?
- What tells the user it worked, including for screen readers?
- Where does keyboard focus go after a delete?

Accessibility
- Which Week 4 rules carry over as is?
- What new things need to be announced (saved, updated, deleted)?
