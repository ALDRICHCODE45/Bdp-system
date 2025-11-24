import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb", // Permite archivos de hasta 10MB
    },
  },
};

export default nextConfig;
