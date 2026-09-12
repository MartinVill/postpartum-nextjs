import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ['192.168.1.36', '192.168.1.34', 'localhost', '127.0.0.1'],
  async rewrites() {
    // Firebase redirect authentication stores state in its helper origin. By
    // proxying the helper through our own domain, modern mobile browsers and
    // TWAs can retain that state after returning from Google.
    return [
      {
        source: '/__/auth/:path*',
        destination: 'https://postpartum-fitness-app.firebaseapp.com/__/auth/:path*',
      },
      {
        source: '/__/firebase/:path*',
        destination: 'https://postpartum-fitness-app.firebaseapp.com/__/firebase/:path*',
      },
    ];
  },
};

export default nextConfig;
