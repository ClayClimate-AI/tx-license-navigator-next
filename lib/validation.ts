import { z } from "zod";
import { COUNTY_VALUES } from "./counties";

// Rules from docs/spec/design.md, Validation. A failed parse means the route answers 400. [E1]

// Largest value a Postgres INT column can hold. A bigger id would crash Prisma (500), not 404.
const MAX_INT = 2147483647;

// params.id arrives as text. "abc", "1.5" and "0" fail.
export const idParam = z.coerce.number().int().min(1).max(MAX_INT);

const licenseType = z.string().trim().min(1).max(100);
const county = z.enum(COUNTY_VALUES);
const label = z.string().trim().min(1).max(80);
const noteText = z.string().trim().max(280);
// Empty note is stored as null.
const toNull = (s: string | undefined) => (s ? s : null);

export const countQuery = z.object({
  type: licenseType,
  county,
  break: z.literal("column").optional(),
});

// POST /api/searches. Note is optional on create. [C3]
export const createBody = z.strictObject({
  licenseType,
  county,
  label,
  note: noteText.optional().transform(toNull),
});

// PATCH /api/searches/[id]. Only label and note, both required; type and county stay fixed. [U2]
export const updateBody = z.strictObject({
  label,
  note: noteText.transform(toNull),
});
