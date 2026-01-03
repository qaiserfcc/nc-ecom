import { Card, CardContent } from "@/components/ui/card"
import { Heart, Users, Leaf, Award } from "lucide-react"

export default function AboutSection() {
  return (
    <section className="py-8 sm:py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center mb-12 md:mb-16">
          <div>
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-foreground">About Namecheap</h2>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base leading-relaxed">
              Namecheap is a community platform that shares its own profit with users by giving them more discount than
              the official price. We make quality products affordable through smart buying and profit sharing.
            </p>
            <p className="text-muted-foreground mb-4 text-sm sm:text-base leading-relaxed">
              <strong>First way:</strong> We buy in bulk to get 20% discount from suppliers, then sell individual 
              items to you with 10% discount from retail price.
            </p>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base leading-relaxed">
              <strong>Second way:</strong> Our referral program earns us 20% commission - we share half (10%) with 
              you and keep 10% for operations.
            </p>
            <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
              Join our community where everyone wins - better prices for you, sustainable growth for us, and shared profits 
              that benefit our entire network of members.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/10">
              <CardContent className="pt-6 text-center">
                <Heart className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-primary mb-3" />
                <p className="font-semibold text-sm sm:text-base text-foreground mb-1">Quality First</p>
                <p className="text-xs sm:text-sm text-muted-foreground">100% authentic organic products</p>
              </CardContent>
            </Card>

            <Card className="bg-secondary/10">
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-secondary mb-3" />
                <p className="font-semibold text-sm sm:text-base text-foreground mb-1">Community First</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Share profits with referrals</p>
              </CardContent>
            </Card>

            <Card className="bg-accent/10">
              <CardContent className="pt-6 text-center">
                <Leaf className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-accent mb-3" />
                <p className="font-semibold text-sm sm:text-base text-foreground mb-1">Eco-Friendly</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Sustainable sourcing practices</p>
              </CardContent>
            </Card>

            <Card className="bg-destructive/10">
              <CardContent className="pt-6 text-center">
                <Award className="w-8 h-8 sm:w-10 sm:h-10 mx-auto text-destructive mb-3" />
                <p className="font-semibold text-sm sm:text-base text-foreground mb-1">Trusted</p>
                <p className="text-xs sm:text-sm text-muted-foreground">10,000+ satisfied customers</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Why Choose Namecheap */}
        <div className="bg-muted/50 rounded-xl p-6 sm:p-8 md:p-10">
          <h3 className="text-xl sm:text-2xl font-bold mb-6 text-foreground">Why Choose Namecheap?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold">
                ✓
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base text-foreground">10% Bulk Buy Savings</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  We buy in bulk with 20% discount, share 10% with you
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold">
                ✓
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base text-foreground">10% Referral Commission</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Earn 10% from our 20% referral income when you share
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold">
                ✓
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base text-foreground">Automatic Discounts</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Latest promotions applied automatically at checkout
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-1 text-xs font-bold">
                ✓
              </div>
              <div>
                <p className="font-semibold text-sm sm:text-base text-foreground">Cash on Delivery</p>
                <p className="text-xs sm:text-sm text-muted-foreground">Pay safely when you receive your order</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
