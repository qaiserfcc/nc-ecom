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
  MessageCircle,
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
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-20">
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
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                pathname === "/" ? "bg-secondary text-primary" : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
            >
              Story
            </Link>
            <Link
              href="/home"
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                pathname.startsWith("/home") ? "bg-secondary text-primary" : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                pathname.startsWith("/shop") ? "bg-secondary text-primary" : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
            >
              Shop
            </Link>
            <Link
              href="/contact"
              className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                pathname.startsWith("/contact") ? "bg-secondary text-primary" : "text-gray-600 hover:text-primary hover:bg-gray-50"
              }`}
            >
              Quote
            </Link>
            {isAuthenticated && (
              <Link
                href="/orders"
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  pathname.startsWith("/orders") ? "bg-secondary text-primary" : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`}
              >
                Orders
              </Link>
            )}
            {isAdmin && (
              <Link 
                href="/admin" 
                className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${
                  pathname.startsWith("/admin") ? "bg-secondary text-primary" : "text-gray-600 hover:text-primary hover:bg-gray-50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* WhatsApp */}
            <a 
              href="https://wa.me/923110484849?text=Hi%20Namecheap%2C%20I%20would%20like%20to%20place%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full hover:bg-gray-100 p-2 transition-colors"
              title="Order on WhatsApp"
            >
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
            </a>

            {/* Wishlist */}
            <Link href={isAuthenticated ? "/wishlist" : "/signin"}>
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100">
                <Heart className="w-5 h-5 text-gray-600" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#338838] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount > 99 ? "99+" : wishlistCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* Cart */}
            <Link href={isAuthenticated ? "/cart" : "/signin"}>
              <Button variant="ghost" size="icon" className="relative rounded-full hover:bg-gray-100">
                <ShoppingCart className="w-5 h-5 text-gray-600" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#338838] text-white text-xs font-semibold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 99 ? "99+" : cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isLoading ? (
              <Button variant="ghost" size="icon" disabled className="rounded-full">
                <User className="w-5 h-5 animate-pulse text-gray-400" />
              </Button>
            ) : isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2 hidden sm:flex rounded-full px-4 hover:bg-gray-100">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary" />
                    </div>
                    <span className="max-w-[100px] truncate text-sm font-medium text-gray-700">{user?.name?.split(" ")[0]}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl shadow-lg border-gray-100">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-semibold text-gray-900">{user?.name}</span>
                      <span className="text-xs text-gray-500">{user?.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer py-2 px-3">
                      <Settings className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-gray-700">Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/orders" className="cursor-pointer py-2 px-3">
                      <Package className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-gray-700">My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/wishlist" className="cursor-pointer py-2 px-3">
                      <Heart className="w-4 h-4 mr-2 text-gray-600" />
                      <span className="text-gray-700">Wishlist</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-gray-100" />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer py-2 px-3">
                          <LayoutDashboard className="w-4 h-4 mr-2 text-primary" />
                          <span className="text-primary font-medium">Admin Dashboard</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator className="bg-gray-100" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer py-2 px-3">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link href="/signin">
                  <Button variant="ghost" size="sm" className="rounded-full px-5 text-gray-700 hover:bg-gray-100">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm" className="rounded-full px-5 bg-primary hover:bg-primary/90 text-white">
                    Sign Up
                  </Button>
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
              className="md:hidden rounded-full hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden pb-4 flex flex-col gap-1 border-t border-gray-100 pt-3 bg-white">
            <Link
              href="/"
              className={cn(
                "px-4 py-3 rounded-xl mx-3 font-medium transition-all duration-200",
                pathname === "/" ? "bg-secondary text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Story
            </Link>
            <Link
              href="/home"
              className={cn(
                "px-4 py-3 rounded-xl mx-3 font-medium transition-all duration-200",
                pathname.startsWith("/home") ? "bg-secondary text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/shop"
              className={cn(
                "px-4 py-3 rounded-xl mx-3 font-medium transition-all duration-200",
                pathname.startsWith("/shop") ? "bg-secondary text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Shop
            </Link>
            <Link
              href="/contact"
              className={cn(
                "px-4 py-3 rounded-xl mx-3 font-medium transition-all duration-200",
                pathname.startsWith("/contact") ? "bg-secondary text-primary" : "text-gray-600 hover:bg-gray-50 hover:text-primary"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              Quote
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  href="/orders"
                  className="px-4 py-3 mx-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Orders
                </Link>
                <Link
                  href="/profile"
                  className="px-4 py-3 mx-3 rounded-xl font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Profile Settings
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="px-4 py-3 mx-3 rounded-xl font-medium text-primary bg-secondary hover:bg-secondary/80 transition-all duration-200 flex items-center gap-2"
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
                  className="px-4 py-3 mx-3 rounded-xl font-medium text-red-600 hover:bg-red-50 transition-all duration-200 text-left flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <div className="flex gap-2 px-6 pt-2">
                <Link href="/signin" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl border-2 hover:bg-gray-50">
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full rounded-xl bg-primary hover:bg-primary/90">Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
        )}
      </div>
    </header>
  )
}
