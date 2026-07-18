import { PrismaClient } from "@fylmico/database";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// When the URL doesn't specify `connection_limit`, Prisma defaults it to
// `num_physical_cpus * 2 + 1`. On shared/containerized hosting (Hostinger
// here), `os.cpus().length` frequently reports the *host* machine's full
// core count rather than the container's actual cgroup allocation - so a
// single PrismaClient instance can silently size its own pool at 17, 33,
// or more, exhausting Supabase's Session Pooler (pool_size 15) by itself
// and leaving nothing for anything else (including migrations) for as
// long as the process runs. Force a small, known-safe limit instead of
// trusting the environment's CPU count.
function withConnectionLimit(url: string, limit: number): string {
  const separator = url.includes("?") ? "&" : "?";
  return url.includes("connection_limit=")
    ? url
    : `${url}${separator}connection_limit=${limit}`;
}

// Cache on `global` in every environment, not just dev. Next.js's route
// handlers are compiled into separate per-route chunks even in a single
// long-running `next start` process; without this cache each chunk that
// imports this module re-runs `new PrismaClient()`, opening a fresh
// connection pool per route and exhausting Supabase's Session Pooler
// within a few requests - the "max clients reached" / "timer has gone
// away" crash loop this guarded against dev-only.
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: withConnectionLimit(process.env.DATABASE_URL ?? "", 5)
      }
    }
  });

globalForPrisma.prisma = prisma;
