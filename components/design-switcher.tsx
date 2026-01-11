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

export function DesignSwitcher() {
  const { currentTheme, setTheme, themes } = useDesignTheme()

  const themeOrder: ThemeVariant[] = ["orange-classic", "green-eco", "purple-premium", "blue-modern"]

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
      <DropdownMenuContent align="end" className="w-64 rounded-2xl shadow-lg border-gray-100">
        <DropdownMenuLabel className="text-base font-semibold">Design Themes</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-100" />
        <div className="p-2">
          {themeOrder.map((themeId) => {
            const theme = themes[themeId]
            const isActive = currentTheme === themeId
            return (
              <DropdownMenuItem
                key={themeId}
                onClick={() => setTheme(themeId)}
                className={`cursor-pointer rounded-xl mb-1 py-3 px-3 ${
                  isActive ? "bg-gray-100" : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3 w-full">
                  <div className={`w-6 h-6 rounded-full ${getThemeColorClass(themeId)} flex-shrink-0 ${isActive ? "ring-2 ring-offset-2 ring-gray-400" : ""}`} />
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
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
