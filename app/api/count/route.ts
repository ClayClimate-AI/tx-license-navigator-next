import type { NextRequest } from "next/server";
import { countQuery } from "@/lib/validation";
import { buildCountUrl, fetchHolderCount, TdlrError } from "@/lib/tdlr";

const TDLR_ERROR = "We could not reach the Texas data service.";

// GET /api/count?type=&county=[&break=column]: the TDLR holder count for one pair. [S3]
export async function GET(request: NextRequest) {
  const parsed = countQuery.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return Response.json(
      { error: "Choose a license type and one of the listed counties." },
      { status: 400 },
    );
  }
  const { type, county } = parsed.data;
  // ?break=column on the page is passed through here, so TDLR answers 400 for the demo. [S7]
  const breakColumn = parsed.data.break === "column";

  try {
    const count = await fetchHolderCount(type, county, breakColumn);
    // queryUrl feeds the "See the exact data request" link. [S5]
    return Response.json({ count, queryUrl: buildCountUrl(type, county, breakColumn) });
  } catch (err) {
    console.error("GET /api/count failed:", err);
    // TDLR's own code, or null for a timeout or no connection. [S6]
    const status = err instanceof TdlrError ? err.status : null;
    const timedOut = err instanceof TdlrError && err.timedOut;
    return Response.json({ error: TDLR_ERROR, status }, { status: timedOut ? 504 : 502 });
  }
}
