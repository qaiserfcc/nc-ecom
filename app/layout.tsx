import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { SocketProvider } from "@/lib/socket-client"
import { ApiFetchInterceptor } from "@/lib/api-fetch-interceptor"
import { MetaPixel } from "@/components/analytics/meta-pixel"
import { AnalyticsProvider } from "@/components/analytics/analytics-provider"
import { PageViewTracker } from "@/components/analytics/page-view-tracker"
import { DesignThemeProvider } from "@/lib/contexts/design-theme-context"
import { ConfirmDialogProvider } from "@/components/ui/confirm-dialog"
import { StructuredData } from "@/components/seo/structured-data"
import { AutoPageViewTracker } from "@/lib/event-tracking"
import ExitIntentPopup from "@/components/exit-intent-popup"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.namecheap.to"),
  title: {
    default: "Namecheap.to - Premium Domains, Hosting & SSL Certificates | Namecheap Deals",
    template: "%s | Namecheap.to - Namecheap Alternative",
  },
  description:
    "Namecheap.to offers premium domain names, web hosting, SSL certificates, and email hosting at unbeatable prices. Get your namecheap domain today! Official namecheap partner providing cheap domains, namecheap hosting, namecheap SSL, and namecheap email services.",
  keywords: [
    "namecheap",
    "namecheap.to", 
    "name cheap",
    "namecheap domains",
    "namecheap hosting",
    "namecheap SSL",
    "cheap domains",
    "domain registration",
    "web hosting",
    "SSL certificates",
    "namecheap alternative",
    "namecheap deals",
    "namecheap coupon",
    "namecheap promo",
    "buy domain namecheap",
    "namecheap domain transfer",
    "namecheap email hosting",
    "namecheap whois",
    "namecheap dns",
    "namecheap marketplace",
  ],
  authors: [{ name: "Namecheap.to Team", url: "https://www.namecheap.to" }],
  creator: "Namecheap.to",
  publisher: "Namecheap.to",
  generator: "Next.js",
  manifest: "/manifest.json",
  applicationName: "Namecheap.to",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  other: {
    "facebook-domain-verification": "4vzvc0ddl1litp4blutl3qf0mf2w4n",
    "google-site-verification": "your-google-verification-code",
  },
  openGraph: {
    title: "Namecheap.to - Your Trusted Namecheap Partner for Domains & Hosting",
    description:
      "Get premium domains, hosting, and SSL certificates at namecheap prices. Namecheap.to is your one-stop shop for all namecheap services.",
    url: "https://www.namecheap.to",
    siteName: "Namecheap.to - Namecheap Alternative",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Namecheap.to - Premium Domains & Hosting",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Namecheap.to - Namecheap Domains, Hosting & SSL",
    description: "Premium namecheap services at unbeatable prices. Domains, hosting, SSL, and more!",
    images: ["/og-image.svg"],
    creator: "@namecheapto",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: "https://www.namecheap.to",
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "96x96",
        type: "image/x-icon",
      },
      {
        url: "/favicon-64x64.png",
        sizes: "64x64",
        type: "image/png",
      },
      {
        url: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#ff7a1a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="bg-background" suppressHydrationWarning>
      <head>
        <StructuredData />
      </head>
      <body className={`font-sans antialiased`}>
        <DesignThemeProvider>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <ConfirmDialogProvider>
              <AnalyticsProvider>
                <SocketProvider>
                  <ApiFetchInterceptor />
                  <PageViewTracker />
                  <AutoPageViewTracker />
                  <ExitIntentPopup 
                    enabled={true}
                    trigger="all"
                    scrollThreshold={50}
                    timeDelay={30}
                    showOnce={true}
                  />
                  {children}
                  <Toaster richColors position="top-right" />
                </SocketProvider>
              </AnalyticsProvider>
            </ConfirmDialogProvider>
          </ThemeProvider>
        </DesignThemeProvider>
        <Analytics />
        <SpeedInsights />
        <MetaPixel />
      </body>
    </html>
  )
}
