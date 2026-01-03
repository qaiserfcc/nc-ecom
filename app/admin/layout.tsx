"use client"

import type React from "react"

import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Tag,
  BarChart3,
  Menu,
  LogOut,
  ChevronLeft,
  Loader2,
  Image,
} from "lucide-react"

const sidebarItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/products", icon: Package, label: "Products" },
  { href: "/admin/bundles", icon: Package, label: "Bundles" },
  { href: "/admin/brands", icon: Package, label: "Brands" },
  { href: "/admin/orders", icon: ShoppingCart, label: "Orders" },
  { href: "/admin/users", icon: Users, label: "Users" },
  { href: "/admin/banners", icon: Image, label: "Banners" },
  { href: "/admin/discounts", icon: Tag, label: "Discounts" },
  { href: "/admin/analytics", icon: BarChart3, label: "Analytics" },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAdmin, signOut } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !isAdmin) {
    router.push("/signin")
    return null
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            NC
          </div>
          <span className="font-bold text-primary">Admin</span>
        </button>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="px-2 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 cursor-pointer relative z-10 ${
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-md" 
                    : "text-foreground hover:bg-muted hover:shadow-sm"
                }`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-left font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t space-y-2">
        <button
          onClick={() => router.push("/")}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200 cursor-pointer font-medium"
        >
          <ChevronLeft className="w-4 h-4 flex-shrink-0" />
          Back to Store
        </button>
        <Button variant="ghost" className="w-full justify-start text-destructive hover:bg-destructive/10 cursor-pointer font-medium" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2 flex-shrink-0" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/30 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:flex-col md:w-64 md:fixed md:inset-y-0 md:left-0 md:z-40 border-r bg-background">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-14 px-4 border-b bg-background">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="z-50">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 z-50">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <span className="font-bold text-primary">Admin Panel</span>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="w-full md:ml-64 md:pt-0 pt-14">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
