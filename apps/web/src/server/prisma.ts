import { PrismaClient } from "@fylmico/database";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Cache on `global` in every environment, not just dev. Next.js's route
// handlers are compiled into separate per-route chunks even in a single
// long-running `next start` process; without this cache each chunk that
// imports this module re-runs `new PrismaClient()`, opening a fresh
// connection pool per route and exhausting Supabase's Session Pooler
// (pool_size 15) within a few requests - the "max clients reached" /
// "timer has gone away" crash loop this guarded against dev-only.
export const prisma = globalForPrisma.prisma ?? new PrismaClient();

globalForPrisma.prisma = prisma;
