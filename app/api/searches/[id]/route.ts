import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db";
import { idParam } from "@/lib/validation";

type Context = { params: Promise<{ id: string }> };

// DELETE /api/searches/[id]: remove one saved search. 204 with no body on success. [D2]
export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  const parsed = idParam.safeParse(id);
  if (!parsed.success) {
    // "abc", "1.5", "0", or too big for a Postgres INT. [E1]
    return Response.json({ error: "That is not a valid saved search id." }, { status: 400 });
  }

  try {
    await prisma.savedSearch.delete({ where: { id: parsed.data } });
    return new Response(null, { status: 204 });
  } catch (err) {
    // P2025: no row with that id (never existed, or already deleted). [E2]
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
      return Response.json({ error: "That saved search no longer exists." }, { status: 404 });
    }
    console.error(`DELETE /api/searches/${id} failed:`, err);
    return Response.json(
      { error: "We could not reach the saved searches database." },
      { status: 500 },
    );
  }
}
