'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ChevronDown, X } from 'lucide-react'

interface PerformanceMetricsDisplayProps {
  metrics: {
    pageLoadTime: number
    imagesLoadedCount: number
    apiRequestsCount: number
    cacheHitCount: number
    networkErrorCount: number
    avgApiResponseTime: number
    totalPageLoadTime: number
    timestamp: number
  }
  logMetrics: () => void
  clearCache?: () => void
  swIsRegistered?: boolean
}

export function PerformanceMetricsDisplay({
  metrics,
  logMetrics,
  clearCache,
  swIsRegistered,
}: PerformanceMetricsDisplayProps) {
  const [isOpen, setIsOpen] = useState(false)

  const cacheHitRate = metrics.apiRequestsCount > 0 
    ? ((metrics.cacheHitCount / metrics.apiRequestsCount) * 100).toFixed(1)
    : 0

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen && (
        <Card className="mb-2 p-4 w-80 bg-white shadow-lg">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center font-semibold border-b pb-2">
              <span>Performance Metrics</span>
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5"
                onClick={() => setIsOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-muted-foreground">Page Load</p>
                <p className="font-semibold">{metrics.pageLoadTime}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Load</p>
                <p className="font-semibold">{metrics.totalPageLoadTime}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Images</p>
                <p className="font-semibold">{metrics.imagesLoadedCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">API Calls</p>
                <p className="font-semibold">{metrics.apiRequestsCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cache Hits</p>
                <p className="font-semibold">{metrics.cacheHitCount}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Hit Rate</p>
                <p className="font-semibold text-green-600">{cacheHitRate}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Avg API Time</p>
                <p className="font-semibold">{metrics.avgApiResponseTime.toFixed(0)}ms</p>
              </div>
              <div>
                <p className="text-muted-foreground">Errors</p>
                <p className={`font-semibold ${metrics.networkErrorCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {metrics.networkErrorCount}
                </p>
              </div>
            </div>

            {swIsRegistered && (
              <div className="pt-2 border-t">
                <span className="text-xs text-green-600">✓ Service Worker Active</span>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={logMetrics}
                className="flex-1"
              >
                Log Metrics
              </Button>
              {clearCache && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={clearCache}
                  className="flex-1"
                >
                  Clear Cache
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-12 h-12 shadow-lg"
        variant={isOpen ? 'default' : 'outline'}
      >
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
    </div>
  )
}
