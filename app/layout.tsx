import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { SocketProvider } from "@/lib/socket-client"
import { ApiFetchInterceptor } from "@/lib/api-fetch-interceptor"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://nc-ecom.vercel.app"),
  title: "Namecheap Story | Premium Savings, Local Support",
  description:
    "Discover how Namecheap partners with local organic brands to bring exclusive discounts directly to you through strategic financial support.",
  keywords: ["Namecheap", "Discounts", "Organic Products", "Local Brands", "Financial Support"],
  authors: [{ name: "Namecheap Team" }],
  generator: "v0.app",
  manifest: "/manifest.json",
  openGraph: {
    title: "How Namecheap Brings You Extra Value",
    description:
      "A graphical story of our journey from studying user needs to delivering premium organic products at unbeatable prices.",
    url: "https://your-domain.com",
    siteName: "Namecheap Story",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "Namecheap Story Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Namecheap Story | Extra Discounts for You",
    description: "See how we support local brands to lower prices for our users.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
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
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <SocketProvider>
            <ApiFetchInterceptor />
            {children}
            <Toaster richColors position="top-right" />
          </SocketProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
