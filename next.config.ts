import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["utfs.io"], // ✅ Allow external images from "utfs.io"
  },
};

export default nextConfig;
