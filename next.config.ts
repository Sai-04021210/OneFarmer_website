import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3003',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '192.168.0.8',
        port: '3003',
        pathname: '/uploads/**',
      }
    ],
  },
  async headers() {
    const localhostUrl = process.env.NEXT_PUBLIC_LOCALHOST_URL || 'http://localhost:3003';
    const localIpUrl = process.env.NEXT_PUBLIC_LOCAL_IP_URL || 'http://192.168.0.8:3003';
    const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-inline' 'unsafe-eval';
    style-src 'self' 'unsafe-inline';
    img-src 'self' ${localhostUrl} ${localIpUrl} data:;
    font-src 'self';
    object-src 'none';
    frame-ancestors 'none';
  `.replace(/\s{2,}/g, ' ').trim();

    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          }
        ],
      },
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
        ],
      },
      {
        source: '/uploads/plant-videos/:path*.(mp4|webm|ogg|avi|mov)',
        headers: [
          {
            key: 'Content-Type',
            value: 'video/mp4',
          },
          {
            key: 'Accept-Ranges',
            value: 'bytes',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
