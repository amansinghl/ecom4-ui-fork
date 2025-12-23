import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ecom.vamaship.com",
      },
      {
        protocol: "https",
        hostname: "vs-storage-test1.s3.amazonaws.com",
      },
    ],
  },
};

export default nextConfig;
