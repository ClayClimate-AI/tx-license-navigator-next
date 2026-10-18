import { connection } from "next/server";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { createBody } from "@/lib/validation";

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

// POST /api/searches: save one search. 201 { search } on success. [C3, C4]
export async function POST(request: Request) {
  // A body that is not JSON at all is also a 400, not a 500.
  const json = await request.json().catch(() => null);
  const parsed = createBody.safeParse(json);
  if (!parsed.success) {
    // Empty label, label over 80, note over 280, unknown county, or an extra key. [E1, C3]
    return Response.json({ error: "Check the label and note, then try again." }, { status: 400 });
  }

  try {
    const search = await prisma.savedSearch.create({ data: parsed.data });
    return Response.json({ search }, { status: 201 });
  } catch (err) {
    // P2002: this type and county are already saved (@@unique). [C4]
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return Response.json({ error: "You already saved this search." }, { status: 409 });
    }
    console.error("POST /api/searches failed:", err);
    return Response.json(
      { error: "We could not reach the saved searches database." },
      { status: 500 },
    );
  }
}
