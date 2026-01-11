/**
 * Header style variants configuration
 */

export type HeaderStyleVariant = "classic" | "minimal" | "modern"

export interface HeaderStyle {
  id: HeaderStyleVariant
  name: string
  description: string
  config: {
    sticky: boolean
    transparent: boolean
    shadow: string
    padding: string
    logoSize: "small" | "medium" | "large"
    navPosition: "center" | "right"
    showBorder: boolean
  }
}

export const headerStyles: Record<HeaderStyleVariant, HeaderStyle> = {
  classic: {
    id: "classic",
    name: "Classic",
    description: "Traditional header with full navigation",
    config: {
      sticky: true,
      transparent: false,
      shadow: "border-b border-gray-100",
      padding: "h-20",
      logoSize: "medium",
      navPosition: "right",
      showBorder: true,
    },
  },
  minimal: {
    id: "minimal",
    name: "Minimal",
    description: "Clean and minimal header design",
    config: {
      sticky: true,
      transparent: false,
      shadow: "shadow-sm",
      padding: "h-16",
      logoSize: "small",
      navPosition: "right",
      showBorder: false,
    },
  },
  modern: {
    id: "modern",
    name: "Modern",
    description: "Modern header with gradient and effects",
    config: {
      sticky: true,
      transparent: false,
      shadow: "shadow-lg",
      padding: "h-24",
      logoSize: "large",
      navPosition: "center",
      showBorder: false,
    },
  },
}

export const defaultHeaderStyle: HeaderStyleVariant = "classic"
