import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma/client";

// One client for the whole app. In dev, Next.js reloads modules on every save;
// keeping the client on globalThis stops each reload from opening a new pool.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  // Pooled URL: many requests share a few open connections through Neon's pooler.
  const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
