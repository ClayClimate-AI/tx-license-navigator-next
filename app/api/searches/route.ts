import { connection } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/searches: every saved search, newest first. [R1]
export async function GET() {
  // Run only when a request arrives, never at build time, so the list is always fresh. [R5]
  await connection();
  try {
    const searches = await prisma.savedSearch.findMany({ orderBy: { createdAt: "desc" } });
    return Response.json({ searches });
  } catch (err) {
    console.error("GET /api/searches failed:", err);
    return Response.json(
      { error: "We could not reach the saved searches database." },
      { status: 500 },
    );
  }
}
