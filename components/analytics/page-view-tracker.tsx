"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAnalyticsTracking } from "./analytics-provider"

export function PageViewTracker() {
  const pathname = usePathname()
  const { trackPageView } = useAnalyticsTracking()

  useEffect(() => {
    if (!pathname) return
    const title = typeof document !== "undefined" ? document.title : ""
    trackPageView(pathname, title)
  }, [pathname, trackPageView])

  return null
}
