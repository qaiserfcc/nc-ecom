"use client"

import { Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useDesignTheme } from "@/lib/contexts/design-theme-context"
import { ThemeVariant } from "@/lib/design-themes"
import { HeaderStyleVariant } from "@/lib/header-styles"
import { FooterStyleVariant } from "@/lib/footer-styles"
import { cn } from "@/lib/utils"

export function DesignSwitcher() {
  const {
    currentTheme,
    setTheme,
    themes,
    headerStyle,
    setHeaderStyle,
    headerStyles,
    footerStyle,
    setFooterStyle,
    footerStyles,
  } = useDesignTheme()

  const themeOrder: ThemeVariant[] = ["orange-classic", "green-eco", "purple-premium", "blue-modern"]
  const headerStyleOrder: HeaderStyleVariant[] = ["classic", "minimal", "modern"]
  const footerStyleOrder: FooterStyleVariant[] = ["classic", "compact", "extended"]

  const getThemeColorClass = (themeId: ThemeVariant) => {
    switch (themeId) {
      case "orange-classic":
        return "bg-[#ff7a1a]"
      case "green-eco":
        return "bg-[#338838]"
      case "purple-premium":
        return "bg-[#7c3aed]"
      case "blue-modern":
        return "bg-[#2563eb]"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative rounded-full hover:bg-gray-100"
          title="Change Design Theme"
        >
          <Palette className="w-5 h-5 text-gray-600" />
          <span className="sr-only">Change design theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 rounded-2xl shadow-lg border-gray-100">
        <DropdownMenuLabel className="text-base font-semibold">Design Settings</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100" />

        {/* Color Themes */}
        <div className="p-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">Color Theme</div>
          {themeOrder.map((themeId) => {
            const theme = themes[themeId]
            const isActive = currentTheme === themeId
            return (
              <DropdownMenuItem
                key={themeId}
                onClick={() => setTheme(themeId)}
                className={cn(
                  "cursor-pointer rounded-xl mb-1 py-3 px-3",
                  isActive ? "bg-gray-100" : "hover:bg-gray-50"
                )}
              >
                <div className="flex items-center gap-3 w-full">
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex-shrink-0",
                      getThemeColorClass(themeId),
                      isActive && "ring-2 ring-offset-2 ring-gray-400"
                    )}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 flex items-center gap-2">
                      {theme.name}
                      {isActive && (
                        <span className="text-xs bg-gray-200 px-2 py-0.5 rounded-full text-gray-700">Active</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">{theme.description}</div>
                  </div>
                </div>
              </DropdownMenuItem>
            )
          })}
        </div>

        <DropdownMenuSeparator className="bg-gray-100" />

        {/* Header Styles */}
        <div className="p-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">Header Style</div>
          <div className="flex gap-2">
            {headerStyleOrder.map((styleId) => {
              const style = headerStyles[styleId]
              const isActive = headerStyle === styleId
              return (
                <button
                  key={styleId}
                  onClick={() => setHeaderStyle(styleId)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {style.name}
                </button>
              )
            })}
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-100" />

        {/* Footer Styles */}
        <div className="p-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-2">Footer Style</div>
          <div className="flex gap-2">
            {footerStyleOrder.map((styleId) => {
              const style = footerStyles[styleId]
              const isActive = footerStyle === styleId
              return (
                <button
                  key={styleId}
                  onClick={() => setFooterStyle(styleId)}
                  className={cn(
                    "flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {style.name}
                </button>
              )
            })}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
