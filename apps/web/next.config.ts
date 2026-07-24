import type { NextConfig } from "next";
import path from "node:path";

const repositoryRoot = path.resolve(process.cwd(), "../..");
const isStaticExport = process.env.NEXT_OUTPUT_MODE === "export";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  turbopack: {
    root: repositoryRoot
  },
  typedRoutes: true,
  // Hostinger's container over-reports its CPU count (same root cause as
  // the Prisma connection_limit/TOKIO_WORKER_THREADS workarounds - see
  // docs/hostinger-deployment.md's Max Processes incident). Without this,
  // `next build`'s static-generation phase sizes its worker pool off that
  // inflated count and spawns one OS process per worker (observed: 47
  // workers in production), which alone can push the account's
  // process-count ceiling to its limit during every build.
  experimental: {
    cpus: 2
  },
  ...(isStaticExport
    ? {}
    : {
        outputFileTracingRoot: repositoryRoot,
        async headers() {
          return [
            {
              source: "/:path*",
              headers: [
                { key: "X-Content-Type-Options", value: "nosniff" },
                { key: "X-Frame-Options", value: "DENY" },
                {
                  key: "Referrer-Policy",
                  value: "strict-origin-when-cross-origin"
                },
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains"
                }
              ]
            }
          ];
        }
      })
};

export default nextConfig;
