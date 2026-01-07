"use client"

import Link from "next/link"
import Image from "next/image"
import {
  ShoppingCart,
  Heart,
  User,
  Menu,
  X,
  LogOut,
  Package,
  Settings,
  LayoutDashboard,
  ChevronDown,
} from "lucide-react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/hooks/use-auth"
import useSWR from "swr"

const fetcher = (url: string) => fetch(url).then((res) => (res.ok ? res.json() : null))

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user, isLoading, isAuthenticated, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  // Fetch cart and wishlist counts
  const { data: cartData } = useSWR(isAuthenticated ? "/api/cart" : null, fetcher)
  const { data: wishlistData } = useSWR(isAuthenticated ? "/api/wishlist" : null, fetcher)

  const cartCount = cartData?.itemCount || 0
  const wishlistCount = wishlistData?.count || 0

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-background border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <Image 
              src="/logo-banner-xl.png" 
              alt="Namecheap Extra Discount" 
              width={800} 
              height={200} 
              className="h-[55px] w-auto"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/"
              className={`text-foreground hover:text-primary font-medium transition-colors duration-200 relative group ${
                pathname === "/" ? "text-primary" : ""
              }`}
            >
              Story
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/home"
              className={`text-foreground hover:text-primary font-medium transition-colors duration-200 relative group ${
                pathname.startsWith("/home") ? "text-primary" : ""
              }`}
            >
              Home
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/shop"
              className={`text-foreground hover:text-primary font-medium transition-colors duration-200 relative group ${
                pathname.startsWith("/shop") ? "text-primary" : ""
              }`}
            >
              Shop
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            <Link
              href="/contact"
              className={`text-foreground hover:text-primary font-medium transition-colors duration-200 relative group ${
                pathname.startsWith("/contact") ? "text-primary" : ""
              }`}
            >
              Quote
              <span className="absolute bottom-0 left-0 w-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
            </Link>
            {isAuthenticated && (
              <Link
                href="/orders"
                className={`text-foreground hover:text-primary font-medium transition-colors duration-200 relative group ${
                  pathname.startsWith("/orders") ? "text-primary" : ""
                }`}
              >
                Orders
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
              </Link>
            )}
            {isAdmin && (
              <Link href="/admin" className="text-primary font-medium transition flex items-center gap-1 relative group">
                <LayoutDashboard className="w-4 h-4" />
                Admin
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-primary group-hover:opacity-100 opacity-100 transition-opacity duration-300"></span>
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Wishlist */}
            <Link href={isAuthenticated ? "/wishlist" : "/signin"}>
              <Button variant="ghost" size="icon" className="relative">
                <Heart className="w-5 h-5" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href={isAuthenticated ? "/cart" : "/signin"}>
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-destructive text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isLoading ? (
              <Button variant="ghost" size="icon" disabled>
                <User className="w-5 h-5 animate-pulse" />
              </Button>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-1 hidden sm:flex">
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="max-w-[100px] truncate text-sm">{user?.name?.split(" ")[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-xs text-muted-foreground">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Profile Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer">
                      <Package className="w-4 h-4 mr-2" />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer">
                      <Heart className="w-4 h-4 mr-2" />
                      Wishlist
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer text-primary">
                          <LayoutDashboard className="w-4 h-4 mr-2" />
                          Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile User Icon */}
            {isAuthenticated && (
              <Link href="/profile" className="sm:hidden">
                <Button variant="ghost" size="icon">
                  <User className="w-5 h-5" />
                </Button>
              </Link>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-1 border-t border-border pt-3">
            <Link
              href="/"
              className={`px-4 py-3 rounded-md ${pathname === "/" ? "text-primary bg-muted" : "text-foreground hover:bg-muted"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Story
            </Link>
            <Link
              href="/home"
              className={`px-4 py-3 rounded-md ${pathname.startsWith("/home") ? "text-primary bg-muted" : "text-foreground hover:bg-muted"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`px-4 py-3 rounded-md ${pathname.startsWith("/shop") ? "text-primary bg-muted" : "text-foreground hover:bg-muted"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/contact"
              className={`px-4 py-3 rounded-md ${pathname.startsWith("/contact") ? "text-primary bg-muted" : "text-foreground hover:bg-muted"}`}
              onClick={() => setMobileMenuOpen(false)}
            >
              Quote
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/orders"
                  className="px-4 py-3 text-foreground hover:bg-muted rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-3 text-foreground hover:bg-muted rounded-md"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="px-4 py-3 text-primary font-medium hover:bg-muted rounded-md flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleSignOut()
                    setMobileMenuOpen(false)
                  }}
                  className="px-4 py-3 text-destructive hover:bg-muted rounded-md text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-4 pt-2">
                <Link href="/signin" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full bg-transparent">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
