import { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Image optimization settings
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    minimumCacheTTL: 31536000, // 1 year
  },

  // Experimental features for performance
  experimental: {
    optimizeCss: true,
    scrollRestoration: true,
    typedRoutes: true,
  },

  // Compression and optimization
  compress: true,

  // Power optimizations
  poweredByHeader: false,

  // Headers for caching and security
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/images/optimize/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/products',
        destination: '/shop',
        permanent: true,
      },
    ]
  },

  // Rewrites for API optimization
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  // Webpack optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks.chunks = 'all'
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
          priority: 10,
        },
        redis: {
          test: /[\\/]node_modules[\\/]ioredis[\\/]/,
          name: 'redis',
          chunks: 'all',
          priority: 20,
        },
        sharp: {
          test: /[\\/]node_modules[\\/]sharp[\\/]/,
          name: 'sharp',
          chunks: 'all',
          priority: 20,
        },
      }
    }

    // Add bundle analyzer in development
    if (dev && !isServer) {
      // You can add webpack-bundle-analyzer here if needed
    }

    return config
  },
}

export default nextConfig