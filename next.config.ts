import { env } from '@/lib/env';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    localPatterns: [{ pathname: '**' }],
    remotePatterns: [
      // production
      {
        protocol: 'https',
        hostname: new URL(env.SUPABASE_URL || '').hostname,
        pathname: '/storage/**',
      },
      // local
      ...(env.APP_ENV === 'dev'
        ? ([
            {
              protocol: 'http',
              hostname: '127.0.0.1',
              port: '54321',
              pathname: '/storage/**',
            },
            {
              protocol: 'http',
              hostname: 'localhost',
              port: '54321',
              pathname: '/storage/**',
            },
          ] as const)
        : []),
    ],
    dangerouslyAllowLocalIP: env.APP_ENV === 'dev',
  },
};

export default nextConfig;
