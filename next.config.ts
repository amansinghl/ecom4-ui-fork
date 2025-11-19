import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ecom.vamaship.com",
      },
    ],
  },
};

export default nextConfig;
