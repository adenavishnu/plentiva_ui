import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: ".",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "uploadservice11759.s3.us-east-2.amazonaws.com",
      },
    ],
  },
  async rewrites() {
    const gatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL ?? "http://localhost:8762";
    return [
      {
        source: "/api/:path*",
        destination: `${gatewayUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
