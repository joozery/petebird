import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.r2.dev' }],
  },
  experimental: {
    agentUpgrade: 'security',
  },
};

export default nextConfig;
