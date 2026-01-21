"use client"

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

/**
 * Server-side event tracking helper
 * Sends events to both Facebook Pixel (client) and Conversions API (server)
 */

// Track PageView
export function trackPageView(url?: string) {
  const pageUrl = url || window.location.href
  
  // Client-side tracking (Facebook Pixel)
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView')
  }

  // Server-side tracking (Conversions API)
  fetch('/api/events/pageview', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: pageUrl }),
  }).catch(err => console.error('Server-side PageView tracking failed:', err))
}

// Track ViewContent (Product View)
export function trackViewContent(params: {
  contentId: string
  contentName: string
  contentType?: string
  value?: number
  currency?: string
}) {
  // Client-side
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'ViewContent', {
      content_ids: [params.contentId],
      content_name: params.contentName,
      content_type: params.contentType || 'product',
      value: params.value,
      currency: params.currency || 'USD',
    })
  }

  // Server-side
  fetch('/api/events/view-content', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }),
  }).catch(err => console.error('Server-side ViewContent tracking failed:', err))
}

// Track AddToCart
export function trackAddToCart(params: {
  contentId: string
  contentName: string
  value: number
  quantity?: number
  currency?: string
}) {
  // Client-side
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'AddToCart', {
      content_ids: [params.contentId],
      content_name: params.contentName,
      content_type: 'product',
      value: params.value,
      currency: params.currency || 'USD',
      contents: [{
        id: params.contentId,
        quantity: params.quantity || 1,
      }],
    })
  }

  // Server-side
  fetch('/api/events/add-to-cart', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }),
  }).catch(err => console.error('Server-side AddToCart tracking failed:', err))
}

// Track InitiateCheckout
export function trackInitiateCheckout(params: {
  contents: Array<{ id: string; quantity: number; item_price: number }>
  value: number
  numItems: number
  currency?: string
}) {
  // Client-side
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'InitiateCheckout', {
      content_ids: params.contents.map(c => c.id),
      contents: params.contents,
      value: params.value,
      currency: params.currency || 'USD',
      num_items: params.numItems,
    })
  }

  // Server-side
  fetch('/api/events/checkout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }),
  }).catch(err => console.error('Server-side InitiateCheckout tracking failed:', err))
}

// Track Purchase
export function trackPurchase(params: {
  orderId: string
  contents: Array<{ id: string; quantity: number; item_price: number }>
  value: number
  numItems: number
  currency?: string
  email?: string
  phone?: string
  firstName?: string
  lastName?: string
  city?: string
  state?: string
  zip?: string
  country?: string
}) {
  // Client-side
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Purchase', {
      content_ids: params.contents.map(c => c.id),
      contents: params.contents,
      value: params.value,
      currency: params.currency || 'USD',
      num_items: params.numItems,
    })
  }

  // Server-side
  fetch('/api/events/purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...params,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    }),
  }).catch(err => console.error('Server-side Purchase tracking failed:', err))
}

/**
 * Auto-track page views on route changes
 */
export function AutoPageViewTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname) {
      // Small delay to ensure page is loaded
      const timer = setTimeout(() => {
        trackPageView()
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [pathname])

  return null
}
