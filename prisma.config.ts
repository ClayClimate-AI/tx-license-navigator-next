// Prisma 7 does not load .env on its own.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Direct (unpooled) URL for the CLI. process.env, not env(), so
    // `prisma generate` still works on Netlify, where DIRECT_URL is not set.
    url: process.env.DIRECT_URL ?? "",
  },
});
