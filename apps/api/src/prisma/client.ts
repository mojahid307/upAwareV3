import { PrismaClient } from "@prisma/client";

/**
 * Prisma singleton — prevents connection exhaustion during hot-reload in dev.
 * In production a single instance is fine; in dev we stash it on `globalThis`
 * so nodemon restarts reuse the same client.
 */

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
