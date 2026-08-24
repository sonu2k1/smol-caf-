import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@smol-cafe/ui", "@smol-cafe/db"],
};

export default nextConfig;
