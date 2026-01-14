/**
 * Performance Monitoring and Analytics
 *
 * This module provides comprehensive performance tracking for:
 * - Cache hit rates and effectiveness
 * - Database query performance
 * - Image optimization metrics
 * - ISR regeneration times
 * - Overall page load performance
 */

import { performanceMonitoring, cacheConfig } from './cache-config'

interface PerformanceMetrics {
  timestamp: number
  operation: string
  duration: number
  cacheHit?: boolean
  cacheKey?: string
  metadata?: Record<string, any>
}

interface CacheStats {
  hits: number
  misses: number
  hitRate: number
  totalRequests: number
  memoryUsage?: number
  keyCount?: number
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private maxMetrics = 1000 // Keep last 1000 metrics

  // Track operation performance
  trackOperation(
    operation: string,
    startTime: number,
    metadata?: Record<string, any>
  ) {
    const duration = Date.now() - startTime
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      operation,
      duration,
      metadata,
    }

    this.metrics.push(metric)

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics)
    }

    // Log slow operations
    if (duration > 1000) {
      console.warn(`Slow operation: ${operation} took ${duration}ms`, metadata)
    }
  }

  // Track cache performance
  trackCacheOperation(
    key: string,
    hit: boolean,
    duration: number,
    metadata?: Record<string, any>
  ) {
    const metric: PerformanceMetrics = {
      timestamp: Date.now(),
      operation: 'cache',
      duration,
      cacheHit: hit,
      cacheKey: key,
      metadata,
    }

    this.metrics.push(metric)
    performanceMonitoring.trackCacheHit(key, hit)
  }

  // Get cache statistics
  getCacheStats(): CacheStats {
    const cacheMetrics = this.metrics.filter(m => m.operation === 'cache')

    if (cacheMetrics.length === 0) {
      return {
        hits: 0,
        misses: 0,
        hitRate: 0,
        totalRequests: 0,
      }
    }

    const hits = cacheMetrics.filter(m => m.cacheHit).length
    const misses = cacheMetrics.filter(m => !m.cacheHit).length
    const totalRequests = hits + misses
    const hitRate = totalRequests > 0 ? (hits / totalRequests) * 100 : 0

    return {
      hits,
      misses,
      hitRate,
      totalRequests,
    }
  }

  // Get performance summary
  getPerformanceSummary(timeRange: number = 3600000) { // Last hour by default
    const now = Date.now()
    const recentMetrics = this.metrics.filter(m => now - m.timestamp < timeRange)

    const operations = recentMetrics.reduce((acc, metric) => {
      if (!acc[metric.operation]) {
        acc[metric.operation] = []
      }
      acc[metric.operation].push(metric.duration)
      return acc
    }, {} as Record<string, number[]>)

    const summary = Object.entries(operations).map(([operation, durations]) => {
      const sorted = durations.sort((a, b) => a - b)
      return {
        operation,
        count: durations.length,
        avg: durations.reduce((a, b) => a + b, 0) / durations.length,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p95: sorted[Math.floor(sorted.length * 0.95)],
        p99: sorted[Math.floor(sorted.length * 0.99)],
      }
    })

    return {
      timeRange,
      totalMetrics: recentMetrics.length,
      operations: summary,
      cacheStats: this.getCacheStats(),
    }
  }

  // Export metrics for external analysis
  exportMetrics() {
    return {
      metrics: this.metrics,
      summary: this.getPerformanceSummary(),
      config: cacheConfig,
    }
  }

  // Clear old metrics
  clearOldMetrics(olderThan: number = 86400000) { // 24 hours
    const cutoff = Date.now() - olderThan
    this.metrics = this.metrics.filter(m => m.timestamp > cutoff)
  }
}

// Singleton instance
export const performanceMonitor = new PerformanceMonitor()

/**
 * Performance tracking decorators
 */
export function trackPerformance(operation: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      try {
        const result = await method.apply(this, args)
        performanceMonitor.trackOperation(operation, startTime, {
          method: propertyName,
          success: true,
        })
        return result
      } catch (error) {
        performanceMonitor.trackOperation(operation, startTime, {
          method: propertyName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        throw error
      }
    }
  }
}

/**
 * Cache performance tracking
 */
export function trackCache(key: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      try {
        const result = await method.apply(this, args)
        const hit = result !== null && result !== undefined
        performanceMonitor.trackCacheOperation(key, hit, Date.now() - startTime, {
          method: propertyName,
        })
        return result
      } catch (error) {
        performanceMonitor.trackCacheOperation(key, false, Date.now() - startTime, {
          method: propertyName,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        throw error
      }
    }
  }
}

/**
 * Database query performance tracking
 */
export function trackQuery(queryType: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      try {
        const result = await method.apply(this, args)
        performanceMonitor.trackOperation(`db:${queryType}`, startTime, {
          method: propertyName,
          resultCount: Array.isArray(result) ? result.length : 1,
        })
        return result
      } catch (error) {
        performanceMonitor.trackOperation(`db:${queryType}`, startTime, {
          method: propertyName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        throw error
      }
    }
  }
}

/**
 * Image processing performance tracking
 */
export function trackImageProcessing(operation: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now()
      try {
        const result = await method.apply(this, args)
        performanceMonitor.trackOperation(`image:${operation}`, startTime, {
          method: propertyName,
          inputSize: args[0]?.length || 0,
          outputSize: result?.length || 0,
        })
        return result
      } catch (error) {
        performanceMonitor.trackOperation(`image:${operation}`, startTime, {
          method: propertyName,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        })
        throw error
      }
    }
  }
}

/**
 * Real User Monitoring (RUM) utilities
 */
export const rumUtils = {
  // Track page load performance
  trackPageLoad: () => {
    if (typeof window === 'undefined') return

    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      if (navigation) {
        performanceMonitor.trackOperation('page:load', navigation.loadEventStart - navigation.fetchStart, {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          url: window.location.href,
        })
      }
    })
  },

  // Track Largest Contentful Paint (LCP)
  trackLCP: () => {
    if (typeof window === 'undefined') return

    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      performanceMonitor.trackOperation('web-vitals:lcp', 0, {
        value: lastEntry.startTime,
        element: (lastEntry as any).element?.tagName,
      })
    }).observe({ entryTypes: ['largest-contentful-paint'] })
  },

  // Track First Input Delay (FID)
  trackFID: () => {
    if (typeof window === 'undefined') return

    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        performanceMonitor.trackOperation('web-vitals:fid', 0, {
          value: (entry as any).processingStart - entry.startTime,
          inputType: (entry as any).name,
        })
      })
    }).observe({ entryTypes: ['first-input'] })
  },

  // Track Cumulative Layout Shift (CLS)
  trackCLS: () => {
    if (typeof window === 'undefined') return

    let clsValue = 0
    new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          clsValue += (entry as any).value
        }
      })
      performanceMonitor.trackOperation('web-vitals:cls', 0, {
        value: clsValue,
      })
    }).observe({ entryTypes: ['layout-shift'] })
  },
}

/**
 * Initialize performance monitoring
 */
export function initPerformanceMonitoring() {
  // Clear old metrics every hour
  setInterval(() => {
    performanceMonitor.clearOldMetrics()
  }, 3600000)

  // Initialize RUM tracking
  if (typeof window !== 'undefined') {
    rumUtils.trackPageLoad()
    rumUtils.trackLCP()
    rumUtils.trackFID()
    rumUtils.trackCLS()
  }
}