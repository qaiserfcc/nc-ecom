'use client'

import { useEffect, useRef, useCallback } from 'react'

interface PerformanceMetrics {
  pageLoadTime: number // Time to first meaningful paint
  imagesLoadedCount: number
  apiRequestsCount: number
  cacheHitCount: number
  networkErrorCount: number
  avgApiResponseTime: number
  totalPageLoadTime: number
  timestamp: number
}

interface PerformanceTracker {
  metrics: PerformanceMetrics
  recordImageLoad: (loadTime: number) => void
  recordApiRequest: (duration: number, cached?: boolean) => void
  recordNetworkError: () => void
  getMetrics: () => PerformanceMetrics
  logMetrics: () => void
}

export function usePerformanceMonitoring(): PerformanceTracker {
  const metricsRef = useRef<PerformanceMetrics>({
    pageLoadTime: 0,
    imagesLoadedCount: 0,
    apiRequestsCount: 0,
    cacheHitCount: 0,
    networkErrorCount: 0,
    avgApiResponseTime: 0,
    totalPageLoadTime: 0,
    timestamp: Date.now(),
  })

  const apiTimingsRef = useRef<number[]>([])

  // Record page load time using Web Vitals
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use Performance API to measure page load
      window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
        if (perfData) {
          metricsRef.current.pageLoadTime = perfData.loadEventEnd - perfData.fetchStart
          metricsRef.current.totalPageLoadTime = perfData.loadEventEnd - perfData.fetchStart
          console.log('[Performance] Page load time:', metricsRef.current.pageLoadTime, 'ms')
        }
      })

      // Monitor long tasks
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.duration > 50) {
                console.warn('[Performance] Long task detected:', {
                  name: entry.name,
                  duration: entry.duration,
                })
              }
            }
          })
          observer.observe({ entryTypes: ['longtask'] })
        } catch (e) {
          // PerformanceObserver might not support longtask
        }
      }

      // Monitor network activity
      if ('PerformanceObserver' in window) {
        try {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.initiatorType === 'fetch' || entry.initiatorType === 'xmlhttprequest') {
                const duration = entry.responseEnd - entry.startTime
                console.log('[Performance] Network request:', {
                  name: entry.name,
                  duration: duration,
                  size: (entry as any).transferSize || 0,
                })
              }
            }
          })
          observer.observe({ entryTypes: ['resource'] })
        } catch (e) {
          // Observer setup failed
        }
      }
    }
  }, [])

  const recordImageLoad = useCallback((loadTime: number) => {
    metricsRef.current.imagesLoadedCount += 1
  }, [])

  const recordApiRequest = useCallback((duration: number, cached?: boolean) => {
    metricsRef.current.apiRequestsCount += 1
    
    if (cached) {
      metricsRef.current.cacheHitCount += 1
    }

    apiTimingsRef.current.push(duration)

    // Calculate average
    const sum = apiTimingsRef.current.reduce((a, b) => a + b, 0)
    metricsRef.current.avgApiResponseTime = sum / apiTimingsRef.current.length

    console.log('[Performance] API request recorded:', {
      duration,
      cached,
      avgResponseTime: metricsRef.current.avgApiResponseTime,
    })
  }, [])

  const recordNetworkError = useCallback(() => {
    metricsRef.current.networkErrorCount += 1
    console.warn('[Performance] Network error recorded:', {
      totalErrors: metricsRef.current.networkErrorCount,
    })
  }, [])

  const getMetrics = useCallback((): PerformanceMetrics => {
    return { ...metricsRef.current }
  }, [])

  const logMetrics = useCallback(() => {
    const metrics = getMetrics()
    console.table({
      'Page Load Time (ms)': metrics.pageLoadTime,
      'Total Load Time (ms)': metrics.totalPageLoadTime,
      'Images Loaded': metrics.imagesLoadedCount,
      'API Requests': metrics.apiRequestsCount,
      'Cache Hits': metrics.cacheHitCount,
      'Network Errors': metrics.networkErrorCount,
      'Avg API Response (ms)': metrics.avgApiResponseTime.toFixed(2),
      'Cache Hit Rate': (
        (metrics.cacheHitCount / metrics.apiRequestsCount * 100 || 0).toFixed(2) + '%'
      ),
    })

    // Send to analytics if configured
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'page_performance', {
        page_load_time: metrics.pageLoadTime,
        images_loaded: metrics.imagesLoadedCount,
        api_requests: metrics.apiRequestsCount,
        cache_hit_rate: metrics.cacheHitCount / metrics.apiRequestsCount || 0,
        network_errors: metrics.networkErrorCount,
      })
    }
  }, [getMetrics])

  return {
    metrics: metricsRef.current,
    recordImageLoad,
    recordApiRequest,
    recordNetworkError,
    getMetrics,
    logMetrics,
  }
}

// Helper hook to automatically track API calls with SWR
export function useApiPerformanceTracking() {
  const performanceTracker = usePerformanceMonitoring()

  const trackApiCall = useCallback((
    startTime: number,
    duration: number,
    fromCache?: boolean
  ) => {
    performanceTracker.recordApiRequest(duration, fromCache)
  }, [performanceTracker])

  return {
    trackApiCall,
    ...performanceTracker,
  }
}
