import Header from "@/components/header"
import Footer from "@/components/footer"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { HelpCircle, Package, CreditCard, RefreshCw, Users, ShoppingBag } from "lucide-react"

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <HelpCircle className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-foreground">
              Frequently Asked Questions
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Find answers to common questions about our products, ordering, and services.
            </p>
          </div>

          {/* General Questions */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <ShoppingBag className="w-8 h-8 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">General Questions</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>What is Namecheap?</AccordionTrigger>
                <AccordionContent>
                  Namecheap is a community-driven e-commerce platform specializing in premium organic and natural beauty and health products. We offer authentic products from trusted brands with a unique profit-sharing model that benefits our community members.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Are all your products organic?</AccordionTrigger>
                <AccordionContent>
                  Yes, we exclusively offer certified organic and natural products. Every product in our catalog has been carefully vetted for quality, authenticity, and organic certification standards.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How does the referral program work?</AccordionTrigger>
                <AccordionContent>
                  Our referral program allows you to earn commission by sharing products with your friends and family. When someone makes a purchase using your referral link, you earn a percentage of the sale. It's our way of rewarding you for spreading the word about organic living.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>What are bulk buy discounts?</AccordionTrigger>
                <AccordionContent>
                  We offer tiered pricing that automatically applies discounts when you purchase multiple units of the same product. The more you buy, the more you save. This makes it economical to stock up on your favorite products or split orders with friends.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Ordering & Payment */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-8 h-8 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Ordering & Payment</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-5">
                <AccordionTrigger>What payment methods do you accept?</AccordionTrigger>
                <AccordionContent>
                  We accept multiple payment methods including credit/debit cards, online banking, and cash on delivery (COD). All online payments are processed through our secure payment gateway to ensure your financial information is protected.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-6">
                <AccordionTrigger>Is cash on delivery available?</AccordionTrigger>
                <AccordionContent>
                  Yes! Cash on delivery is available for all orders. Simply select this option at checkout and pay when you receive your products. This ensures you can shop with confidence and inspect your order before payment.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-7">
                <AccordionTrigger>How do I place an order?</AccordionTrigger>
                <AccordionContent>
                  Placing an order is simple: browse our products, add items to your cart, proceed to checkout, enter your delivery information, select your payment method, and confirm your order. You'll receive an order confirmation email with all the details.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-8">
                <AccordionTrigger>Can I modify or cancel my order?</AccordionTrigger>
                <AccordionContent>
                  You can modify or cancel your order within 2 hours of placing it. Contact our customer support team immediately at qaiserfcc@gmail.com or call +92 311 0484849. Once the order is processed for shipping, modifications may not be possible.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Shipping & Delivery */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Package className="w-8 h-8 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Shipping & Delivery</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-9">
                <AccordionTrigger>What are your shipping charges?</AccordionTrigger>
                <AccordionContent>
                  Shipping charges vary based on your location and order value. We offer free shipping on orders above a certain amount. Exact shipping costs will be calculated and displayed at checkout before you confirm your order.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-10">
                <AccordionTrigger>How long does delivery take?</AccordionTrigger>
                <AccordionContent>
                  Standard delivery typically takes 3-7 business days depending on your location. Major cities receive deliveries faster (3-5 days) while remote areas may take up to 7 days. You'll receive tracking information once your order ships.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-11">
                <AccordionTrigger>Do you ship internationally?</AccordionTrigger>
                <AccordionContent>
                  Currently, we ship within Pakistan and select Middle Eastern countries. We're working on expanding our international shipping capabilities. Contact us at qaiserfcc@gmail.com for specific international shipping inquiries.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-12">
                <AccordionTrigger>How can I track my order?</AccordionTrigger>
                <AccordionContent>
                  Once your order ships, you'll receive a tracking number via email and SMS. You can track your order in real-time through your account dashboard or by entering the tracking number on our website.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Returns & Exchanges */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <RefreshCw className="w-8 h-8 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Returns & Exchanges</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-13">
                <AccordionTrigger>What is your return policy?</AccordionTrigger>
                <AccordionContent>
                  We offer a 30-day return policy for unopened products in their original packaging. If you're not satisfied with your purchase, contact us within 30 days for a full refund or exchange. Products must be in resalable condition.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-14">
                <AccordionTrigger>How do I return a product?</AccordionTrigger>
                <AccordionContent>
                  To initiate a return, contact our customer support team with your order number and reason for return. We'll provide you with return instructions and a return authorization number. Once we receive and inspect the product, we'll process your refund.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-15">
                <AccordionTrigger>What if I receive a damaged product?</AccordionTrigger>
                <AccordionContent>
                  If you receive a damaged or defective product, please contact us immediately with photos of the damage. We'll arrange for a replacement or full refund at no additional cost. Your satisfaction is our priority.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-16">
                <AccordionTrigger>How long does it take to process a refund?</AccordionTrigger>
                <AccordionContent>
                  Once we receive your returned product and verify its condition, refunds are processed within 5-7 business days. The refund will be credited to your original payment method. COD orders will be refunded via bank transfer.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Account & Membership */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Account & Membership</h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-17">
                <AccordionTrigger>Do I need an account to shop?</AccordionTrigger>
                <AccordionContent>
                  While you can browse products without an account, creating an account is required to complete purchases. An account also gives you access to order tracking, wishlist, referral earnings, and exclusive member benefits.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-18">
                <AccordionTrigger>Is it free to create an account?</AccordionTrigger>
                <AccordionContent>
                  Yes, creating an account is completely free and takes just a few minutes. Simply provide your email, create a password, and you're ready to start shopping and earning through referrals.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-19">
                <AccordionTrigger>How do I access my referral earnings?</AccordionTrigger>
                <AccordionContent>
                  Your referral earnings are displayed in your account dashboard. You can track all your referrals, commissions earned, and payment history. Earnings can be withdrawn once they reach the minimum threshold or used for future purchases.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-20">
                <AccordionTrigger>Is my personal information secure?</AccordionTrigger>
                <AccordionContent>
                  Absolutely. We take data security seriously and use industry-standard encryption to protect your personal information. We never share your data with third parties without your consent. Read our Privacy Policy for more details.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          {/* Still Have Questions */}
          <section className="bg-muted/50 rounded-xl p-6 sm:p-8 md:p-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Still Have Questions?</h2>
            <p className="text-muted-foreground mb-6 text-sm sm:text-base max-w-2xl mx-auto">
              Can't find the answer you're looking for? Our customer support team is ready to help you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:qaiserfcc@gmail.com"
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
              >
                Email Us
              </a>
              <a
                href="tel:+923110484849"
                className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition font-medium"
              >
                Call Us
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
