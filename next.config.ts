import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product images served from Supabase Storage
    remotePatterns: [{ protocol: "https", hostname: "*.supabase.co" }],
  },
  experimental: {
    // /admin uploads product photos through a Server Action (default limit is 1 MB)
    serverActions: { bodySizeLimit: "25mb" },
  },
};

export default nextConfig;
