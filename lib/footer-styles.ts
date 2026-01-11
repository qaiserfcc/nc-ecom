/**
 * Footer style variants configuration
 */

export type FooterStyleVariant = "classic" | "compact" | "extended"

export interface FooterStyle {
  id: FooterStyleVariant
  name: string
  description: string
  config: {
    columns: number
    showNewsletter: boolean
    showSocial: boolean
    padding: string
    bgStyle: "light" | "gradient" | "dark"
  }
}

export const footerStyles: Record<FooterStyleVariant, FooterStyle> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Traditional footer with multiple columns",
    config: {
      columns: 4,
      showNewsletter: false,
      showSocial: true,
      padding: "py-8 sm:py-12 md:py-16",
      bgStyle: "light",
    },
  },
  compact: {
    id: "compact",
    name: "Compact",
    description: "Minimal footer with essential links",
    config: {
      columns: 2,
      showNewsletter: false,
      showSocial: true,
      padding: "py-6 sm:py-8",
      bgStyle: "light",
    },
  },
  extended: {
    id: "extended",
    name: "Extended",
    description: "Full-featured footer with newsletter",
    config: {
      columns: 4,
      showNewsletter: true,
      showSocial: true,
      padding: "py-12 sm:py-16 md:py-20",
      bgStyle: "gradient",
    },
  },
}

export const defaultFooterStyle: FooterStyleVariant = "classic"
