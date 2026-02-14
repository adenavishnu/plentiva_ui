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
    return [
      {
        source: "/api/uploads/:path*",
        destination: `${process.env.NEXT_PUBLIC_UPLOAD_URL ?? "http://localhost:8081"}/api/uploads/:path*`,
      },
      {
        source: "/api/products/:path*",
        destination: `${process.env.NEXT_PUBLIC_PRODUCT_URL ?? "http://localhost:8082"}/api/products/:path*`,
      },
      {
        source: "/api/v1/payments/:path*",
        destination: `${process.env.NEXT_PUBLIC_PAYMENT_URL ?? "http://localhost:8080"}/api/v1/payments/:path*`,
      },
    ];
  },
};

export default nextConfig;
