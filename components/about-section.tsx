"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Leaf, Award } from "lucide-react"
import { useDesignTheme } from "@/lib/contexts/design-theme-context"
import { getContentForTheme } from "@/lib/content-variations"

export default function AboutSection() {
  const { currentTheme } = useDesignTheme()
  const content = getContentForTheme(currentTheme)

  return (
    <section className="py-8 sm:py-12 md:py-16 bg-[#fcfdfd]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900">{content.about.headline}</h2>
            <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">{content.about.description}</p>
            <p className="text-gray-600 mb-4 text-sm sm:text-base leading-relaxed">
              <strong>First way:</strong> We buy in bulk to get 20% discount from suppliers, then sell individual items
              to you with 10% discount from retail price.
            </p>
            <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
              <strong>Second way:</strong> Our referral program earns us 20% commission - we share half (10%) with you
              and keep 10% for operations.
            </p>
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
              Join our community where everyone wins - better prices for you, sustainable growth for us, and shared
              profits that benefit our entire network of members.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-white border-gray-100">
              <CardContent className="pt-6 text-center">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-primary mb-3" />
                <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Quality First</p>
                <p className="text-xs sm:text-sm text-gray-600">100% authentic organic products</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100">
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-primary mb-3" />
                <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Community First</p>
                <p className="text-xs sm:text-sm text-gray-600">Share profits with referrals</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100">
              <CardContent className="pt-6 text-center">
                <Leaf className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-primary mb-3" />
                <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Eco-Friendly</p>
                <p className="text-xs sm:text-sm text-gray-600">Sustainable sourcing practices</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-gray-100">
              <CardContent className="pt-6 text-center">
                <Award className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-primary mb-3" />
                <p className="font-semibold text-sm sm:text-base text-gray-900 mb-1">Trusted</p>
                <p className="text-xs sm:text-sm text-gray-600">10,000+ satisfied customers</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Choose Namecheap - Dynamic Content */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 sm:p-8 md:p-10">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">{content.features.title}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {content.features.items.map((item, index) => (
              <div key={index} className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold">
                  ✓
                </div>
                <div>
                  <p className="font-semibold text-sm sm:text-base text-gray-900">{item.title}</p>
                  <p className="text-xs sm:text-sm text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
