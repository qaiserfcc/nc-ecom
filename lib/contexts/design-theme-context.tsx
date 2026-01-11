"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { ThemeVariant, designThemes, defaultTheme } from "@/lib/design-themes"
import { HeaderStyleVariant, headerStyles, defaultHeaderStyle } from "@/lib/header-styles"
import { FooterStyleVariant, footerStyles, defaultFooterStyle } from "@/lib/footer-styles"

interface DesignThemeContextType {
  currentTheme: ThemeVariant
  setTheme: (theme: ThemeVariant) => void
  themes: typeof designThemes
  headerStyle: HeaderStyleVariant
  setHeaderStyle: (style: HeaderStyleVariant) => void
  headerStyles: typeof headerStyles
  footerStyle: FooterStyleVariant
  setFooterStyle: (style: FooterStyleVariant) => void
  footerStyles: typeof footerStyles
}

const DesignThemeContext = createContext<DesignThemeContextType | undefined>(undefined)

export function DesignThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>(defaultTheme)
  const [headerStyle, setHeaderStyleState] = useState<HeaderStyleVariant>(defaultHeaderStyle)
  const [footerStyle, setFooterStyleState] = useState<FooterStyleVariant>(defaultFooterStyle)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage with validation
    const savedTheme = localStorage.getItem("design-theme")
    if (savedTheme && savedTheme in designThemes) {
      setCurrentTheme(savedTheme as ThemeVariant)
    }

    // Load header style from localStorage with validation
    const savedHeaderStyle = localStorage.getItem("header-style")
    if (savedHeaderStyle && savedHeaderStyle in headerStyles) {
      setHeaderStyleState(savedHeaderStyle as HeaderStyleVariant)
    }

    // Load footer style from localStorage with validation
    const savedFooterStyle = localStorage.getItem("footer-style")
    if (savedFooterStyle && savedFooterStyle in footerStyles) {
      setFooterStyleState(savedFooterStyle as FooterStyleVariant)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Apply theme CSS variables to root element
    const root = document.documentElement
    const theme = designThemes[currentTheme]

    Object.entries(theme.cssVars).forEach(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, "-$1").toLowerCase()
      root.style.setProperty(`--${cssKey}`, value)
    })

    // Save to localStorage
    localStorage.setItem("design-theme", currentTheme)
  }, [currentTheme, mounted])

  const setTheme = (theme: ThemeVariant) => {
    setCurrentTheme(theme)
  }

  const setHeaderStyle = (style: HeaderStyleVariant) => {
    setHeaderStyleState(style)
    if (mounted) {
      localStorage.setItem("header-style", style)
    }
  }

  const setFooterStyle = (style: FooterStyleVariant) => {
    setFooterStyleState(style)
    if (mounted) {
      localStorage.setItem("footer-style", style)
    }
  }

  return (
    <DesignThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        themes: designThemes,
        headerStyle,
        setHeaderStyle,
        headerStyles,
        footerStyle,
        setFooterStyle,
        footerStyles,
      }}
    >
      {children}
    </DesignThemeContext.Provider>
  )
}

export function useDesignTheme() {
  const context = useContext(DesignThemeContext)
  if (!context) {
    throw new Error("useDesignTheme must be used within DesignThemeProvider")
  }
  return context
}
