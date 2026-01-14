/**
 * Production Deployment Configuration
 *
 * This file contains all the environment variables and deployment settings
 * required for the optimized e-commerce application.
 */

export interface DeploymentConfig {
  // Database configuration
  database: {
    url: string
    poolSize: number
    connectionTimeoutMillis: number
    idleTimeoutMillis: number
    allowExitOnIdle: boolean
  }

  // Redis configuration
  redis: {
    url: string
    maxRetriesPerRequest: number
    lazyConnect: boolean
    retryDelayOnFailover: number
    maxRetriesPerRequestFailover: number
  }

  // Next.js configuration
  nextjs: {
    images: {
      domains: string[]
      formats: string[]
      deviceSizes: number[]
      imageSizes: number[]
      dangerouslyAllowSVG: boolean
      contentSecurityPolicy: string
    }
    experimental: {
      optimizeCss: boolean
      scrollRestoration: boolean
      webVitalsAttribution: string[]
    }
    poweredByHeader: boolean
    compress: boolean
    reactStrictMode: boolean
  }

  // CDN configuration (optional)
  cdn?: {
    baseUrl: string
    apiKey?: string
    region?: string
  }

  // Analytics and monitoring
  analytics: {
    enabled: boolean
    googleAnalyticsId?: string
    mixpanelToken?: string
  }

  // Security headers
  security: {
    contentSecurityPolicy: string
    referrerPolicy: string
    permissionsPolicy: string
  }

  // Performance monitoring
  monitoring: {
    enabled: boolean
    sentryDsn?: string
    logLevel: string
  }
}

export const deploymentConfig: DeploymentConfig = {
  // Database configuration for production
  database: {
    url: process.env.DATABASE_URL || '',
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10'),
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000'),
    allowExitOnIdle: true,
  },

  // Redis configuration for production
  redis: {
    url: process.env.REDIS_URL || '',
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryDelayOnFailover: 100,
    maxRetriesPerRequestFailover: 3,
  },

  // Next.js production configuration
  nextjs: {
    images: {
      domains: [
        'localhost',
        'cdn.example.com', // Replace with your CDN domain
        'images.unsplash.com',
        'picsum.photos',
      ],
      formats: ['image/webp', 'image/avif'],
      deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
      imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
      dangerouslyAllowSVG: false,
      contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    },
    experimental: {
      optimizeCss: true,
      scrollRestoration: true,
      webVitalsAttribution: ['CLS', 'FID', 'FCP', 'LCP', 'TTFB'],
    },
    poweredByHeader: false,
    compress: true,
    reactStrictMode: true,
  },

  // CDN configuration (uncomment and configure when using CDN)
  // cdn: {
  //   baseUrl: process.env.CDN_BASE_URL || '',
  //   apiKey: process.env.CDN_API_KEY,
  //   region: process.env.CDN_REGION || 'us-east-1',
  // },

  // Analytics configuration
  analytics: {
    enabled: process.env.NODE_ENV === 'production',
    googleAnalyticsId: process.env.GA_TRACKING_ID,
    mixpanelToken: process.env.MIXPANEL_TOKEN,
  },

  // Security headers for production
  security: {
    contentSecurityPolicy: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google-analytics.com *.googletagmanager.com;
      style-src 'self' 'unsafe-inline' fonts.googleapis.com;
      font-src 'self' fonts.gstatic.com;
      img-src 'self' data: https: *.cdn.example.com;
      connect-src 'self' *.sentry.io *.mixpanel.com;
      frame-src 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `.replace(/\s+/g, ' ').trim(),
    referrerPolicy: 'strict-origin-when-cross-origin',
    permissionsPolicy: 'camera=(), microphone=(), geolocation=()',
  },

  // Monitoring configuration
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    sentryDsn: process.env.SENTRY_DSN,
    logLevel: process.env.LOG_LEVEL || 'info',
  },
}

/**
 * Environment variable validation
 */
export function validateEnvironment() {
  const required = [
    'DATABASE_URL',
    'REDIS_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]

  const missing = required.filter(key => !process.env[key])

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  // Validate URLs
  try {
    new URL(process.env.DATABASE_URL!)
    new URL(process.env.REDIS_URL!)
    new URL(process.env.NEXTAUTH_URL!)
  } catch {
    throw new Error('Invalid URL format in environment variables')
  }

  console.log('✅ Environment validation passed')
}

/**
 * Health check endpoints configuration
 */
export const healthChecks = {
  database: async () => {
    try {
      // Implement database health check
      return { status: 'healthy', latency: 0 }
    } catch (error) {
      return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  redis: async () => {
    try {
      // Implement Redis health check
      return { status: 'healthy', latency: 0 }
    } catch (error) {
      return { status: 'unhealthy', error: error instanceof Error ? error.message : 'Unknown error' }
    }
  },

  overall: async () => {
    const dbHealth = await healthChecks.database()
    const redisHealth = await healthChecks.redis()

    const isHealthy = dbHealth.status === 'healthy' && redisHealth.status === 'healthy'

    return {
      status: isHealthy ? 'healthy' : 'unhealthy',
      services: {
        database: dbHealth,
        redis: redisHealth,
      },
      timestamp: new Date().toISOString(),
    }
  },
}

/**
 * Deployment checklist
 */
export const deploymentChecklist = [
  {
    name: 'Environment Variables',
    items: [
      'DATABASE_URL configured',
      'REDIS_URL configured',
      'NEXTAUTH_SECRET set',
      'NEXTAUTH_URL set',
      'CDN_BASE_URL configured (if using CDN)',
      'GA_TRACKING_ID set (if using analytics)',
      'SENTRY_DSN set (if using error monitoring)',
    ],
  },
  {
    name: 'Database Setup',
    items: [
      'Database indexes created',
      'Connection pooling configured',
      'Read replicas configured (optional)',
      'Backup strategy in place',
    ],
  },
  {
    name: 'Redis Setup',
    items: [
      'Redis instance running',
      'Connection pooling configured',
      'Cache TTL settings optimized',
      'Memory limits configured',
    ],
  },
  {
    name: 'CDN Setup (Optional)',
    items: [
      'CDN provider configured',
      'Image optimization enabled',
      'Caching rules set',
      'Domain configured',
    ],
  },
  {
    name: 'Monitoring',
    items: [
      'Error tracking configured',
      'Performance monitoring enabled',
      'Health checks implemented',
      'Logging configured',
    ],
  },
  {
    name: 'Security',
    items: [
      'HTTPS enabled',
      'Security headers configured',
      'CORS policy set',
      'Rate limiting configured',
    ],
  },
]

/**
 * Performance benchmarks for monitoring
 */
export const performanceBenchmarks = {
  pageLoad: {
    excellent: '< 1.5s',
    good: '1.5s - 2.5s',
    needsImprovement: '2.5s - 4s',
    poor: '> 4s',
  },
  cacheHitRate: {
    excellent: '> 95%',
    good: '90% - 95%',
    needsImprovement: '80% - 90%',
    poor: '< 80%',
  },
  databaseQuery: {
    excellent: '< 50ms',
    good: '50ms - 200ms',
    needsImprovement: '200ms - 500ms',
    poor: '> 500ms',
  },
  imageOptimization: {
    excellent: '< 100ms',
    good: '100ms - 300ms',
    needsImprovement: '300ms - 500ms',
    poor: '> 500ms',
  },
}

/**
 * Rollback procedures
 */
export const rollbackProcedures = {
  database: [
    'Restore from backup',
    'Re-run migration scripts',
    'Verify data integrity',
    'Update connection strings',
  ],
  redis: [
    'Flush cache if needed',
    'Restart Redis service',
    'Verify cache keys',
    'Update connection strings',
  ],
  application: [
    'Deploy previous version',
    'Verify application health',
    'Check logs for errors',
    'Monitor performance metrics',
  ],
}