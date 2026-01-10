import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"

// Track analytics events
export function useAnalytics() {
  const pathname = usePathname()

  // Track page view
  useEffect(() => {
    trackEvent("PageView", {
      page_url: window.location.href,
      page_title: document.title,
    })
  }, [pathname])

  const trackEvent = useCallback(
    async (
      event_name: string,
      data?: {
        event_category?: string
        page_url?: string
        page_title?: string
        product_id?: number
        order_id?: number
        event_value?: number
        event_data?: any
      }
    ) => {
      try {
        await fetch("/api/analytics/track", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            event_name,
            ...data,
          }),
        })
      } catch (error) {
        console.error("Failed to track event:", error)
      }
    },
    []
  )

  const trackProductView = useCallback(
    (productId: number, productName: string, productPrice: number) => {
      trackEvent("view", {
        event_category: "product",
        product_id: productId,
        event_value: productPrice,
        event_data: { product_name: productName },
      })
    },
    [trackEvent]
  )

  const trackAddToCart = useCallback(
    (productId: number, productName: string, productPrice: number, quantity: number) => {
      trackEvent("add_to_cart", {
        event_category: "ecommerce",
        product_id: productId,
        event_value: productPrice * quantity,
        event_data: {
          product_name: productName,
          quantity,
        },
      })
    },
    [trackEvent]
  )

  const trackAddToWishlist = useCallback(
    (productId: number, productName: string) => {
      trackEvent("add_to_wishlist", {
        event_category: "engagement",
        product_id: productId,
        event_data: { product_name: productName },
      })
    },
    [trackEvent]
  )

  const trackPurchase = useCallback(
    (orderId: number, orderValue: number, items: any[]) => {
      trackEvent("purchase", {
        event_category: "ecommerce",
        order_id: orderId,
        event_value: orderValue,
        event_data: { items },
      })
    },
    [trackEvent]
  )

  const trackSearch = useCallback(
    (searchQuery: string) => {
      trackEvent("search", {
        event_category: "engagement",
        event_data: { search_query: searchQuery },
      })
    },
    [trackEvent]
  )

  return {
    trackEvent,
    trackProductView,
    trackAddToCart,
    trackAddToWishlist,
    trackPurchase,
    trackSearch,
  }
}
