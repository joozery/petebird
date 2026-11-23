import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Let phones/tablets on the local network open the dev server via the Mac's
  // LAN IP (e.g. http://192.168.1.131:3000). Without this, `next dev` blocks
  // its JS chunks for non-localhost origins, so pages never hydrate and admin
  // forms can't save. Dev-only; has no effect on `next build`/`next start`.
  allowedDevOrigins: ['192.168.*.*', '10.*.*.*', '172.16.*.*', '*.local'],
  images: {
    remotePatterns: [{ protocol: 'https', hostname: '*.r2.dev' }],
  },
};

export default nextConfig;
