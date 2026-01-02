"use client"

import type React from "react"

import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
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
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
            NC
          </div>
          <span className="font-bold text-primary">Admin</span>
        </Link>
      </div>
      <ScrollArea className="flex-1 py-4">
        <nav className="px-2 space-y-1">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? "bg-primary text-primary-foreground" : "hover:bg-muted text-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </ScrollArea>
      <div className="p-4 border-t space-y-2">
        <Link
          href="/"
          className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Store
        </Link>
        <Button variant="ghost" className="w-full justify-start text-destructive" onClick={handleSignOut}>
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col border-r bg-background">
        <Sidebar />
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden sticky top-0 z-50 flex items-center justify-between h-14 px-4 border-b bg-background">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar />
          </SheetContent>
        </Sheet>
        <span className="font-bold text-primary">Admin Panel</span>
        <div className="w-10" />
      </header>

      {/* Main Content */}
      <main className="md:pl-64">
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  )
}
