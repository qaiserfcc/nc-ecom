/**
 * Design themes configuration for the website
 * Each theme includes color schemes that work with the Namecheap brand
 */

export type ThemeVariant = "orange-classic" | "green-eco" | "purple-premium" | "blue-modern"

export interface DesignTheme {
  id: ThemeVariant
  name: string
  description: string
  colors: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    card: string
    cardForeground: string
    border: string
    ring: string
  }
  // CSS variables for oklch color format
  cssVars: {
    primary: string
    primaryForeground: string
    secondary: string
    secondaryForeground: string
    accent: string
    accentForeground: string
    background: string
    foreground: string
    muted: string
    mutedForeground: string
    card: string
    cardForeground: string
    border: string
    ring: string
  }
}

export const designThemes: Record<ThemeVariant, DesignTheme> = {
  "orange-classic": {
    id: "orange-classic",
    name: "Orange Classic",
    description: "Vibrant orange theme matching Namecheap logo",
    colors: {
      primary: "#ff7a1a",
      primaryForeground: "#ffffff",
      secondary: "#f5f5f5",
      secondaryForeground: "#1a1a1a",
      accent: "#ff7a1a",
      accentForeground: "#ffffff",
      background: "#fcfdfd",
      foreground: "#1a1a1a",
      muted: "#f0f0f0",
      mutedForeground: "#737373",
      card: "#fafafa",
      cardForeground: "#1a1a1a",
      border: "#e5e5e5",
      ring: "#ff7a1a",
    },
    cssVars: {
      primary: "oklch(0.72 0.18 45)",
      primaryForeground: "oklch(1 0 0)",
      secondary: "oklch(0.96 0 0)",
      secondaryForeground: "oklch(0.15 0 0)",
      accent: "oklch(0.72 0.18 45)",
      accentForeground: "oklch(1 0 0)",
      background: "oklch(0.99 0 0)",
      foreground: "oklch(0.15 0 0)",
      muted: "oklch(0.94 0 0)",
      mutedForeground: "oklch(0.45 0 0)",
      card: "oklch(0.98 0 0)",
      cardForeground: "oklch(0.15 0 0)",
      border: "oklch(0.9 0 0)",
      ring: "oklch(0.72 0.18 45)",
    },
  },
  "green-eco": {
    id: "green-eco",
    name: "Green Eco",
    description: "Natural green theme for organic products",
    colors: {
      primary: "#338838",
      primaryForeground: "#ffffff",
      secondary: "#f0f7f0",
      secondaryForeground: "#1a1a1a",
      accent: "#4ade80",
      accentForeground: "#ffffff",
      background: "#fcfdfb",
      foreground: "#1a1a1a",
      muted: "#e8f5e8",
      mutedForeground: "#737373",
      card: "#f8fdf8",
      cardForeground: "#1a1a1a",
      border: "#d1e7d1",
      ring: "#338838",
    },
    cssVars: {
      primary: "oklch(0.55 0.15 145)",
      primaryForeground: "oklch(1 0 0)",
      secondary: "oklch(0.97 0.02 145)",
      secondaryForeground: "oklch(0.15 0 0)",
      accent: "oklch(0.75 0.15 145)",
      accentForeground: "oklch(1 0 0)",
      background: "oklch(0.99 0.01 145)",
      foreground: "oklch(0.15 0 0)",
      muted: "oklch(0.95 0.03 145)",
      mutedForeground: "oklch(0.45 0 0)",
      card: "oklch(0.98 0.02 145)",
      cardForeground: "oklch(0.15 0 0)",
      border: "oklch(0.88 0.04 145)",
      ring: "oklch(0.55 0.15 145)",
    },
  },
  "purple-premium": {
    id: "purple-premium",
    name: "Purple Premium",
    description: "Luxurious purple theme for premium feel",
    colors: {
      primary: "#7c3aed",
      primaryForeground: "#ffffff",
      secondary: "#f5f3ff",
      secondaryForeground: "#1a1a1a",
      accent: "#a78bfa",
      accentForeground: "#ffffff",
      background: "#fdfcff",
      foreground: "#1a1a1a",
      muted: "#ede9fe",
      mutedForeground: "#737373",
      card: "#faf8ff",
      cardForeground: "#1a1a1a",
      border: "#ddd6fe",
      ring: "#7c3aed",
    },
    cssVars: {
      primary: "oklch(0.58 0.22 285)",
      primaryForeground: "oklch(1 0 0)",
      secondary: "oklch(0.97 0.03 285)",
      secondaryForeground: "oklch(0.15 0 0)",
      accent: "oklch(0.72 0.18 285)",
      accentForeground: "oklch(1 0 0)",
      background: "oklch(0.99 0.01 285)",
      foreground: "oklch(0.15 0 0)",
      muted: "oklch(0.95 0.04 285)",
      mutedForeground: "oklch(0.45 0 0)",
      card: "oklch(0.98 0.02 285)",
      cardForeground: "oklch(0.15 0 0)",
      border: "oklch(0.88 0.06 285)",
      ring: "oklch(0.58 0.22 285)",
    },
  },
  "blue-modern": {
    id: "blue-modern",
    name: "Blue Modern",
    description: "Fresh blue theme for modern look",
    colors: {
      primary: "#2563eb",
      primaryForeground: "#ffffff",
      secondary: "#eff6ff",
      secondaryForeground: "#1a1a1a",
      accent: "#60a5fa",
      accentForeground: "#ffffff",
      background: "#fcfcfd",
      foreground: "#1a1a1a",
      muted: "#e0f2fe",
      mutedForeground: "#737373",
      card: "#f8fafc",
      cardForeground: "#1a1a1a",
      border: "#bfdbfe",
      ring: "#2563eb",
    },
    cssVars: {
      primary: "oklch(0.55 0.22 250)",
      primaryForeground: "oklch(1 0 0)",
      secondary: "oklch(0.97 0.02 250)",
      secondaryForeground: "oklch(0.15 0 0)",
      accent: "oklch(0.72 0.15 250)",
      accentForeground: "oklch(1 0 0)",
      background: "oklch(0.99 0.005 250)",
      foreground: "oklch(0.15 0 0)",
      muted: "oklch(0.95 0.03 250)",
      mutedForeground: "oklch(0.45 0 0)",
      card: "oklch(0.98 0.01 250)",
      cardForeground: "oklch(0.15 0 0)",
      border: "oklch(0.88 0.05 250)",
      ring: "oklch(0.55 0.22 250)",
    },
  },
}

export const defaultTheme: ThemeVariant = "orange-classic"
