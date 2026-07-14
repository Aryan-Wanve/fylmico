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
