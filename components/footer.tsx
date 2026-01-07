"use client"

import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"

export default function Footer() {
  const { isAuthenticated, isAdmin } = useAuth()

  return (
    <footer className="bg-[#f7f7f7] py-8 sm:py-12 md:py-16 border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-8">
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
              <li>
                <Link href="/about#shopping" className="text-gray-600 hover:text-primary transition-colors">
                  Shopping
                </Link>
              </li>
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
            </ul>
          </div>

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
              <li>
                <Link href="/shipping" className="text-gray-600 hover:text-primary transition-colors">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
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
              className="h-[72px] sm:h-[96px] w-auto"
            />
            <p className="text-xs sm:text-sm text-center text-gray-600">© 2025 Namecheap. All rights reserved. Bringing organic products and community benefits together.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
