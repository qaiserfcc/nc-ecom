"use client"

import Script from 'next/script'

export function StructuredData() {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Namecheap.to",
    "alternateName": ["Namecheap Alternative", "Name Cheap"],
    "url": "https://www.namecheap.to",
    "logo": "https://www.namecheap.to/logo.png",
    "description": "Premium domain registration, web hosting, SSL certificates, and email hosting at namecheap prices. Your trusted namecheap partner.",
    "sameAs": [
      "https://www.facebook.com/namecheapto",
      "https://twitter.com/namecheapto",
      "https://www.instagram.com/namecheapto"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "email": "support@namecheap.to"
    }
  }

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Namecheap.to",
    "alternateName": "Namecheap Alternative",
    "url": "https://www.namecheap.to",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.namecheap.to/shop?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  }

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://www.namecheap.to"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Domains",
        "item": "https://www.namecheap.to/shop"
      }
    ]
  }

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
        }}
      />
      <Script
        id="breadcrumb-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />
    </>
  )
}
