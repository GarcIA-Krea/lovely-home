import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Remote image domains for property photos
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Standalone output for lean production builds
  output: 'standalone',
  // Reduce dev memory footprint on low-RAM machines
  productionBrowserSourceMaps: false,
  // Turbopack config (Next.js 16 default bundler)
  turbopack: {},
};

export default nextConfig;

