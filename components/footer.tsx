"use client"

import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"

export default function Footer() {
  const { isAuthenticated, isAdmin } = useAuth()

  return (
    <footer className="bg-accent text-accent-foreground py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
          <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base">About Us</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/about" className="hover:text-secondary transition">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-secondary transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/press" className="hover:text-secondary transition">
                  Press
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base">Shopping</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/shop" className="hover:text-secondary transition">
                  Shop All
                </Link>
              </li>
              <li>
                <Link href="/shop?category=skincare" className="hover:text-secondary transition">
                  Skincare
                </Link>
              </li>
              <li>
                <Link href="/shop?category=haircare" className="hover:text-secondary transition">
                  Haircare
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base">Account</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              {isAuthenticated ? (
                <>
                  <li>
                    <Link href="/profile" className="hover:text-secondary transition">
                      My Profile
                    </Link>
                  </li>
                  <li>
                    <Link href="/orders" className="hover:text-secondary transition">
                      My Orders
                    </Link>
                  </li>
                  <li>
                    <Link href="/wishlist" className="hover:text-secondary transition">
                      Wishlist
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link href="/admin" className="hover:text-secondary transition">
                        Admin Panel
                      </Link>
                    </li>
                  )}
                </>
              ) : (
                <>
                  <li>
                    <Link href="/signin" className="hover:text-secondary transition">
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link href="/signup" className="hover:text-secondary transition">
                      Create Account
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4 text-sm sm:text-base">Support</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <Link href="/contact" className="hover:text-secondary transition">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-secondary transition">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-secondary transition">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-secondary transition">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-accent-foreground/20 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
          <p>© 2025 Namecheap. All rights reserved. Bringing organic products and community benefits together.</p>
        </div>
      </div>
    </footer>
  )
}
