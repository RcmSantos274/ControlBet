import type { NextConfig } from 'next'

const isProd = process.env.NODE_ENV === 'production'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: { unoptimized: true },
  ...(isProd
    ? { output: 'export' }
    : {
        async rewrites() {
          const apiUrl = process.env.API_URL ?? 'http://localhost:3001'
          return [{ source: '/api/:path*', destination: `${apiUrl}/api/:path*` }]
        },
      }),
}

export default nextConfig
