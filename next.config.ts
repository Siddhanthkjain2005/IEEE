import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  ...(process.env.AQUALENS_TARGET === "google-cloud" ? { output: "standalone" as const } : {}),
};

export default nextConfig;
