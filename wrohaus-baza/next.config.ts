import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  experimental: {
    // Style w HTML — Instagram in-app nie czeka na drugi request CSS.
    inlineCss: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    return [
      {
        source: "/.well-known/apple-developer-merchantid-domain-association.txt",
        destination: "/.well-known/apple-developer-merchantid-domain-association",
      },
      {
        source: "/favicon.ico",
        destination: "/icon.svg",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "app.jarstol.eu",
      },
    ],
  },
};

export default nextConfig;
