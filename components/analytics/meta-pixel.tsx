"use client"

import { useEffect, useState } from "react"
import Script from "next/script"

interface MetaPixelConfig {
  pixel_id: string
  is_active: boolean
  enable_automatic_events: boolean
  enable_advanced_matching: boolean
}

declare global {
  interface Window {
    fbq: any
    _fbq: any
  }
}

export function MetaPixel() {
  const [config, setConfig] = useState<MetaPixelConfig | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    // Fetch Meta Pixel configuration
    fetch("/api/admin/meta-pixel")
      .then((res) => res.json())
      .then((data) => {
        if (data.is_active && data.pixel_id) {
          setConfig(data)
        }
      })
      .catch((error) => {
        console.error("Failed to load Meta Pixel config:", error)
      })
  }, [])

  useEffect(() => {
    if (!config || !loaded) return

    // Initialize Meta Pixel
    if (typeof window !== "undefined" && window.fbq) {
      window.fbq("init", config.pixel_id, config.enable_advanced_matching ? {} : undefined)
      
      // Track initial page view if automatic events are enabled
      if (config.enable_automatic_events) {
        window.fbq("track", "PageView")
      }
    }
  }, [config, loaded])

  if (!config || !config.is_active) {
    return null
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onLoad={() => setLoaded(true)}
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
          `,
        }}
      />
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=${config.pixel_id}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  )
}

// Helper function to track Meta Pixel events
export function trackMetaPixelEvent(
  eventName: string,
  data?: {
    content_ids?: string[]
    content_type?: string
    content_name?: string
    value?: number
    currency?: string
    [key: string]: any
  }
) {
  if (typeof window !== "undefined" && window.fbq) {
    window.fbq("track", eventName, data)
  }
}

// Conversion API tracking function
export async function trackConversionEvent(
  eventName: string,
  data?: {
    product_id?: number
    order_id?: number
    value?: number
    currency?: string
    content_ids?: string[]
    content_type?: string
    custom_data?: any
  }
) {
  try {
    await fetch("/api/analytics/conversion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_name: eventName,
        event_source_url: window.location.href,
        ...data,
      }),
    })
  } catch (error) {
    console.error("Failed to track conversion event:", error)
  }
}
