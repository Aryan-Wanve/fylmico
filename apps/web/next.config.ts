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
        outputFileTracingRoot: repositoryRoot
      })
};

export default nextConfig;
