import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // App Router uses .tsx (page, layout, etc). Pages Router API uses .api.ts so colocated
  // .test.ts files next to handlers are not treated as routes.
  pageExtensions: ['api.ts', 'tsx'],
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
