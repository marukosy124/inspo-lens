import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    localPatterns: [{ pathname: '**' }],
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
        pathname: '/**',
      },
      new URL('https://d1pdrmgjti1pvmh1.public.blob.vercel-storage.com/**'),
    ],
  },
};

export default nextConfig;
