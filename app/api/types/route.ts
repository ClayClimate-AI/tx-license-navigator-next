import { fetchTopTypes, TdlrError } from "@/lib/tdlr";

const TDLR_ERROR = "We could not reach the Texas data service.";

// GET /api/types: the top 50 license types by holder count, largest first. [S1]
// No input, so there is nothing for Zod to check here.
export async function GET() {
  try {
    const types = await fetchTopTypes();
    return Response.json({ types });
  } catch (err) {
    console.error("GET /api/types failed:", err);
    // TDLR's own code, or null for a timeout or no connection. [S6]
    const status = err instanceof TdlrError ? err.status : null;
    const timedOut = err instanceof TdlrError && err.timedOut;
    return Response.json({ error: TDLR_ERROR, status }, { status: timedOut ? 504 : 502 });
  }
}
