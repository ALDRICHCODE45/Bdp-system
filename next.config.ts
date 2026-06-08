import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
    optimizePackageImports: ["lucide-react", "date-fns", "recharts"],
  },
  async redirects() {
    return [
      {
        source: "/ingresos",
        destination: "/movimientos",
        permanent: true,
      },
      {
        source: "/egresos",
        destination: "/movimientos",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
