import type { NextConfig } from 'next';

const config: NextConfig = {
  transpilePackages: ['@lumina/editor', '@lumina/db', '@lumina/types'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default config;
