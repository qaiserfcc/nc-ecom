"use client"

import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"
import { useDesignTheme } from "@/lib/contexts/design-theme-context"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail } from "lucide-react"

export default function Footer() {
  const { isAuthenticated, isAdmin } = useAuth()
  const { footerStyle, footerStyles: footerStylesConfig } = useDesignTheme()

  // Get current footer style config
  const currentFooterConfig = footerStylesConfig[footerStyle].config

  // Apply footer background based on style
  const footerBgClass =
    currentFooterConfig.bgStyle === "gradient"
      ? "bg-gradient-to-br from-gray-50 via-background to-gray-50"
      : currentFooterConfig.bgStyle === "dark"
        ? "bg-gray-900 text-white"
        : "bg-[#f7f7f7]"

  // Determine grid columns based on style
  const gridColsClass =
    currentFooterConfig.columns === 4
      ? "grid-cols-2 sm:grid-cols-2 md:grid-cols-4"
      : "grid-cols-2 sm:grid-cols-2"

  return (
    <footer className={cn(footerBgClass, currentFooterConfig.padding, "border-t border-gray-100")}>
      <div className="container mx-auto px-4">
        {/* Newsletter Section (Extended style only) */}
        {currentFooterConfig.showNewsletter && (
          <div className="mb-12 max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-3 text-gray-900">Stay Updated</h3>
            <p className="text-gray-600 mb-6">Subscribe to our newsletter for exclusive deals and updates</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <Input type="email" placeholder="Enter your email" className="flex-1" />
              <Button className="bg-primary hover:bg-primary/90">
                <Mail className="w-4 h-4 mr-2" />
                Subscribe
              </Button>
            </div>
          </div>
        )}

        {/* Footer Links */}
        <div className={cn("grid gap-6 sm:gap-8", gridColsClass, "mb-8")}>
          <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base text-gray-900">About Us</h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-primary transition-colors">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/about#press" className="text-gray-600 hover:text-primary transition-colors">
                  Press
                </Link>
              </li>
              {currentFooterConfig.columns >= 4 && (
                <li>
                  <Link href="/about#shopping" className="text-gray-600 hover:text-primary transition-colors">
                    Shopping
                  </Link>
                </li>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base text-gray-900">Shopping</h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link href="/shop" className="text-gray-600 hover:text-primary transition-colors">
                  Shop All
                </Link>
              </li>
              {currentFooterConfig.columns >= 4 && (
                <>
                  <li>
                    <Link href="/shop?category=skincare" className="text-gray-600 hover:text-primary transition-colors">
                      Skincare
                    </Link>
                  </li>
                  <li>
                    <Link href="/shop?category=haircare" className="text-gray-600 hover:text-primary transition-colors">
                      Haircare
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {currentFooterConfig.columns >= 4 && (
            <div>
              <h4 className="font-bold mb-4 text-sm sm:text-base text-gray-900">Account</h4>
              <ul className="space-y-3 text-xs sm:text-sm">
                {isAuthenticated ? (
                  <>
                    <li>
                      <Link href="/profile" className="text-gray-600 hover:text-primary transition-colors">
                        My Profile
                      </Link>
                    </li>
                    <li>
                      <Link href="/orders" className="text-gray-600 hover:text-primary transition-colors">
                        My Orders
                      </Link>
                    </li>
                    <li>
                      <Link href="/wishlist" className="text-gray-600 hover:text-primary transition-colors">
                        Wishlist
                      </Link>
                    </li>
                    {isAdmin && (
                      <li>
                        <Link href="/admin" className="text-gray-600 hover:text-primary transition-colors">
                          Admin Panel
                        </Link>
                      </li>
                    )}
                  </>
                ) : (
                  <>
                    <li>
                      <Link href="/signin" className="text-gray-600 hover:text-primary transition-colors">
                        Sign In
                      </Link>
                    </li>
                    <li>
                      <Link href="/signup" className="text-gray-600 hover:text-primary transition-colors">
                        Create Account
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </div>
          )}

          <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base text-gray-900">Support</h4>
            <ul className="space-y-3 text-xs sm:text-sm">
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-600 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              {currentFooterConfig.columns >= 4 && (
                <>
                  <li>
                    <Link href="/shipping" className="text-gray-600 hover:text-primary transition-colors">
                      Shipping Info
                    </Link>
                  </li>
                  <li>
                    <Link href="/return-policy" className="text-gray-600 hover:text-primary transition-colors">
                      Return Policy
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy-policy" className="text-gray-600 hover:text-primary transition-colors">
                      Privacy Policy
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 sm:pt-8">
          <div className="flex flex-col items-center gap-4">
            <Image
              src="/Namecheap-500x500.png"
              alt="Namecheap Logo"
              width={500}
              height={500}
              className={cn(
                "w-auto",
                currentFooterConfig.columns >= 4 ? "h-[72px] sm:h-[96px]" : "h-[60px] sm:h-[72px]"
              )}
            />
            <p className="text-xs sm:text-sm text-center text-gray-600">
              © 2025 Namecheap. All rights reserved. Bringing organic products and community benefits together.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
