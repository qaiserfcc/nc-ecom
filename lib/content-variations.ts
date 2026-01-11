/**
 * Static content variations for different design themes
 * This allows dynamic content that matches the theme aesthetic
 */

import type { ThemeVariant } from "./design-themes"

export interface ContentVariation {
  hero: {
    title: string
    subtitle: string
    cta: string
  }
  features: {
    title: string
    items: Array<{
      title: string
      description: string
    }>
  }
  about: {
    headline: string
    description: string
  }
}

export const contentVariations: Record<ThemeVariant, ContentVariation> = {
  "orange-classic": {
    hero: {
      title: "Discover Premium Organic Products",
      subtitle: "Extra discounts on quality beauty and health essentials",
      cta: "Shop Now",
    },
    features: {
      title: "Why Choose Namecheap",
      items: [
        {
          title: "100% Authentic",
          description: "All products are certified organic and authentic",
        },
        {
          title: "Extra 10% Off",
          description: "Get additional discounts on already reduced prices",
        },
        {
          title: "Fast Delivery",
          description: "Quick and reliable shipping to your doorstep",
        },
        {
          title: "Community Rewards",
          description: "Share profits through our referral program",
        },
      ],
    },
    about: {
      headline: "Your Partner in Organic Living",
      description:
        "We connect you with the best local organic brands, providing unbeatable prices through bulk buying power and strategic partnerships.",
    },
  },
  "green-eco": {
    hero: {
      title: "Embrace Natural Beauty & Wellness",
      subtitle: "Eco-friendly organic products for sustainable living",
      cta: "Explore Products",
    },
    features: {
      title: "Sustainable Excellence",
      items: [
        {
          title: "Eco-Certified",
          description: "All products meet strict environmental standards",
        },
        {
          title: "Green Savings",
          description: "Save more while supporting sustainable brands",
        },
        {
          title: "Carbon-Neutral Delivery",
          description: "We offset emissions from every shipment",
        },
        {
          title: "Plant-Based Promise",
          description: "100% natural ingredients, zero harmful chemicals",
        },
      ],
    },
    about: {
      headline: "Growing a Greener Future Together",
      description:
        "Join our mission to make organic, eco-friendly products accessible to everyone while supporting local sustainable brands.",
    },
  },
  "purple-premium": {
    hero: {
      title: "Luxury Organic Experience",
      subtitle: "Premium quality meets exceptional value",
      cta: "Discover Luxury",
    },
    features: {
      title: "Premium Benefits",
      items: [
        {
          title: "Premium Selection",
          description: "Curated collection of luxury organic brands",
        },
        {
          title: "VIP Discounts",
          description: "Exclusive savings on premium products",
        },
        {
          title: "White Glove Service",
          description: "Premium packaging and expedited shipping",
        },
        {
          title: "Rewards Program",
          description: "Earn points on every luxury purchase",
        },
      ],
    },
    about: {
      headline: "Redefining Premium Organic Shopping",
      description:
        "Experience the perfect blend of luxury and value with our carefully selected premium organic products at unbeatable prices.",
    },
  },
  "blue-modern": {
    hero: {
      title: "Smart Organic Shopping",
      subtitle: "Modern marketplace for health-conscious individuals",
      cta: "Start Shopping",
    },
    features: {
      title: "Modern Shopping Experience",
      items: [
        {
          title: "Smart Deals",
          description: "AI-powered recommendations for best savings",
        },
        {
          title: "Tech-Enabled Savings",
          description: "Real-time price matching and alerts",
        },
        {
          title: "Digital First",
          description: "Seamless mobile and web experience",
        },
        {
          title: "Instant Rewards",
          description: "Automated cashback and loyalty points",
        },
      ],
    },
    about: {
      headline: "The Future of Organic Shopping",
      description:
        "Leveraging technology to bring you the best organic products at the best prices, with a modern, hassle-free shopping experience.",
    },
  },
}

export function getContentForTheme(theme: ThemeVariant): ContentVariation {
  return contentVariations[theme]
}
