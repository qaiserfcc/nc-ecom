"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { ThemeVariant, designThemes, defaultTheme } from "@/lib/design-themes"

interface DesignThemeContextType {
  currentTheme: ThemeVariant
  setTheme: (theme: ThemeVariant) => void
  themes: typeof designThemes
}

const DesignThemeContext = createContext<DesignThemeContextType | undefined>(undefined)

export function DesignThemeProvider({ children }: { children: React.ReactNode }) {
  const [currentTheme, setCurrentTheme] = useState<ThemeVariant>(defaultTheme)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load theme from localStorage
    const savedTheme = localStorage.getItem("design-theme") as ThemeVariant
    if (savedTheme && designThemes[savedTheme]) {
      setCurrentTheme(savedTheme)
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

  return (
    <DesignThemeContext.Provider value={{ currentTheme, setTheme, themes: designThemes }}>
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
