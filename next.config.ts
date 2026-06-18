import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/app",
        destination: "/dashboard",
        permanent: false,
      },
      {
        source: "/quick",
        destination: "/dashboard/quick",
        permanent: false,
      },
      {
        source: "/guided",
        destination: "/dashboard/guided",
        permanent: false,
      },
      {
        source: "/history",
        destination: "/dashboard/history",
        permanent: false,
      },
      {
        source: "/summary",
        destination: "/dashboard/summary",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
