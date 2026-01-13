"use client"

import { createContext, useContext, useCallback, ReactNode } from "react"
import { trackMetaPixelEvent, trackConversionEvent } from "./meta-pixel"

interface AnalyticsContextType {
  trackPageView: (url: string, title: string) => void
  trackProductView: (productId: number, productName: string, price: number) => void
  trackAddToCart: (productId: number, productName: string, price: number, quantity: number) => void
  trackAddToWishlist: (productId: number, productName: string) => void
  trackPurchase: (orderId: number, value: number, items: any[]) => void
  trackSearch: (query: string) => void
  trackCustomEvent: (eventName: string, data?: any) => void
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined)

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const isAllowedDomain = () => {
    if (typeof window === "undefined") return false
    const host = window.location.hostname
    return host === "www.namecheap.to"
  }

  const trackPageView = useCallback((url: string, title: string) => {
    if (!isAllowedDomain()) return
    // Track in our database
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "PageView",
        page_url: url,
        page_title: title,
      }),
    }).catch(console.error)

    // Track with Meta Pixel
    trackMetaPixelEvent("PageView")
    
    // Track with Conversion API
    trackConversionEvent("PageView").catch(console.error)
  }, [])

  const trackProductView = useCallback((productId: number, productName: string, price: number) => {
    if (!isAllowedDomain()) return
    // Track in database
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "view",
        event_category: "product",
        product_id: productId,
        event_value: price,
        event_data: { product_name: productName },
      }),
    }).catch(console.error)

    // Track with Meta Pixel
    trackMetaPixelEvent("ViewContent", {
      content_ids: [productId.toString()],
      content_type: "product",
      content_name: productName,
      value: price,
      currency: "PKR",
    })

    // Track with Conversion API
    trackConversionEvent("ViewContent", {
      product_id: productId,
      value: price,
      currency: "PKR",
      content_ids: [productId.toString()],
      content_type: "product",
      custom_data: { product_name: productName },
    }).catch(console.error)
  }, [])

  const trackAddToCart = useCallback(
    (productId: number, productName: string, price: number, quantity: number) => {
      if (!isAllowedDomain()) return
      const value = price * quantity

      // Track in database
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_name: "add_to_cart",
          event_category: "ecommerce",
          product_id: productId,
          event_value: value,
          event_data: { product_name: productName, quantity },
        }),
      }).catch(console.error)

      // Track with Meta Pixel
      trackMetaPixelEvent("AddToCart", {
        content_ids: [productId.toString()],
        content_type: "product",
        content_name: productName,
        value: value,
        currency: "PKR",
      })

      // Track with Conversion API
      trackConversionEvent("AddToCart", {
        product_id: productId,
        value: value,
        currency: "PKR",
        content_ids: [productId.toString()],
        content_type: "product",
        custom_data: { product_name: productName, quantity },
      }).catch(console.error)
    },
    []
  )

  const trackAddToWishlist = useCallback((productId: number, productName: string) => {
    if (!isAllowedDomain()) return
    // Track in database
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "add_to_wishlist",
        event_category: "engagement",
        product_id: productId,
        event_data: { product_name: productName },
      }),
    }).catch(console.error)

    // Track with Meta Pixel
    trackMetaPixelEvent("AddToWishlist", {
      content_ids: [productId.toString()],
      content_type: "product",
      content_name: productName,
    })

    // Track with Conversion API
    trackConversionEvent("AddToWishlist", {
      product_id: productId,
      content_ids: [productId.toString()],
      content_type: "product",
      custom_data: { product_name: productName },
    }).catch(console.error)
  }, [])

  const trackPurchase = useCallback((orderId: number, value: number, items: any[]) => {
    if (!isAllowedDomain()) return
    // Track in database
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "purchase",
        event_category: "ecommerce",
        order_id: orderId,
        event_value: value,
        event_data: { items },
      }),
    }).catch(console.error)

    // Track with Meta Pixel
    trackMetaPixelEvent("Purchase", {
      value: value,
      currency: "PKR",
      content_ids: items.map((item) => item.product_id.toString()),
      content_type: "product",
    })

    // Track with Conversion API
    trackConversionEvent("Purchase", {
      order_id: orderId,
      value: value,
      currency: "PKR",
      content_ids: items.map((item) => item.product_id.toString()),
      content_type: "product",
      custom_data: { items },
    }).catch(console.error)
  }, [])

  const trackSearch = useCallback((query: string) => {
    if (!isAllowedDomain()) return
    // Track in database
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: "search",
        event_category: "engagement",
        event_data: { search_query: query },
      }),
    }).catch(console.error)

    // Track with Meta Pixel
    trackMetaPixelEvent("Search", {
      search_string: query,
    })

    // Track with Conversion API
    trackConversionEvent("Search", {
      custom_data: { search_query: query },
    }).catch(console.error)
  }, [])

  const trackCustomEvent = useCallback((eventName: string, data?: any) => {
    if (!isAllowedDomain()) return
    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_name: eventName,
        event_data: data,
      }),
    }).catch(console.error)
  }, [])

  const value: AnalyticsContextType = {
    trackPageView,
    trackProductView,
    trackAddToCart,
    trackAddToWishlist,
    trackPurchase,
    trackSearch,
    trackCustomEvent,
  }

  return <AnalyticsContext.Provider value={value}>{children}</AnalyticsContext.Provider>
}

export function useAnalyticsTracking() {
  const context = useContext(AnalyticsContext)
  if (context === undefined) {
    throw new Error("useAnalyticsTracking must be used within an AnalyticsProvider")
  }
  return context
}
