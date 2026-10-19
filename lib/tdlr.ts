import "server-only";

// All network code for the TDLR All Licenses dataset lives here (ported from Week 4 src/api/tdlr.js).
// Counts only: queries use license_type, business_county, and count(*) and nothing else. [P1]

export const DATASET_URL = "https://data.texas.gov/resource/7358-krk7.json";
const TIMEOUT_MS = 8000; // [S6]

// status is TDLR's HTTP code, or null for a timeout or no connection.
export class TdlrError extends Error {
  status: number | null;
  timedOut: boolean;
  constructor(message: string, status: number | null, timedOut = false) {
    super(message);
    this.status = status;
    this.timedOut = timedOut;
  }
}

// fetch failed before any HTTP status: AbortSignal.timeout rejects with a "TimeoutError".
function noAnswer(err: unknown): TdlrError {
  const timedOut = err instanceof Error && err.name === "TimeoutError";
  return new TdlrError(timedOut ? "TDLR did not answer within 8 seconds" : "Could not reach TDLR", null, timedOut);
}

// SoQL string literal: single quotes, with any inner single quote doubled.
function quote(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

// county is already an ALL CAPS value from lib/counties.ts (Zod checks it at the route).
// breakColumn asks for a column that does not exist, so TDLR answers 400 for the error demo. [S7]
export function buildCountUrl(type: string, county: string, breakColumn = false): string {
  const countyColumn = breakColumn ? "business_countyy" : "business_county";
  const params = new URLSearchParams({
    $select: "count(*) AS holders",
    $where: `license_type=${quote(type)} AND ${countyColumn}=${quote(county)}`,
  });
  return `${DATASET_URL}?${params}`;
}

// Returns a number. 0 means no matching records (the empty state, not an error). [S4]
export async function fetchHolderCount(type: string, county: string, breakColumn = false): Promise<number> {
  let rows: { holders?: string }[];
  try {
    const res = await fetch(buildCountUrl(type, county, breakColumn), {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new TdlrError(`TDLR answered HTTP ${res.status}`, res.status);
    rows = await res.json();
  } catch (err) {
    throw err instanceof TdlrError ? err : noAnswer(err);
  }
  if (rows.length === 0) return 0;

  // Socrata returns the count as a string ("12095"), so convert before use.
  const holders = Number(rows[0].holders);
  if (Number.isNaN(holders)) throw new TdlrError("TDLR returned a count that is not a number", null);
  return holders;
}

// Top 50 license types by holder count, largest first. Still counts only: type and count(*). [S1, P1]
export function buildTypesUrl(): string {
  const params = new URLSearchParams({
    $select: "license_type, count(*) AS holders",
    $where: "license_type IS NOT NULL",
    $group: "license_type",
    $order: "holders DESC",
    $limit: "50",
  });
  return `${DATASET_URL}?${params}`;
}

export type LicenseType = { name: string; holders: number };

export async function fetchTopTypes(): Promise<LicenseType[]> {
  let rows: { license_type: string; holders: string }[];
  try {
    const res = await fetch(buildTypesUrl(), {
      cache: "no-store",
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new TdlrError(`TDLR answered HTTP ${res.status}`, res.status);
    rows = await res.json();
  } catch (err) {
    throw err instanceof TdlrError ? err : noAnswer(err);
  }

  // Socrata returns counts as strings ("60809"), so convert before use.
  return rows.map((row) => ({ name: row.license_type, holders: Number(row.holders) }));
}
