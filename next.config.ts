import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.36', '192.168.1.34', 'localhost', '127.0.0.1'],
  turbopack: {
    disabled: true,
  },
};

export default nextConfig;
