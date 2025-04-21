import type { NextConfig } from "next";


const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: '',
  assetPrefix: './',
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'bucket.voidval.com',
        port: '',
        pathname: '/comment/upload/**',
        search: '',
      },
    ],
  },
};


export default nextConfig;
