import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'akabab.github.io',
        pathname: '/starwars-api/api/**',
      },
    ],
  },
}

export default nextConfig
