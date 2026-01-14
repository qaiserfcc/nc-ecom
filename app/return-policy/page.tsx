import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Clock, Package, AlertTriangle } from "lucide-react"

export const metadata = {
  title: "Return Policy - 7 Day Return Guarantee",
  description: "Our hassle-free 7-day return policy. Learn about our return process, eligible items, and how to initiate a return.",
}

export default function ReturnPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Return Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 14, 2026
            </p>
          </div>

          <Alert className="mb-8 border-primary">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              We offer a <strong>7-day return policy</strong> from the date of delivery. Your satisfaction is our priority.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Return Policy Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  At Namecheap E-commerce, we want you to be completely satisfied with your purchase. 
                  If you&apos;re not happy with your order for any reason, you may return it within 
                  7 days of delivery for a full refund or exchange.
                </p>
                <p className="text-muted-foreground">
                  We make returns easy and hassle-free. Simply follow our return process outlined below, 
                  and we&apos;ll take care of the rest.
                </p>
              </CardContent>
            </Card>

            {/* Eligibility */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  Eligible for Return
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Unused items:</strong> Products must be in their original condition, unworn, 
                      unwashed, and with all original tags attached.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Original packaging:</strong> Items should be returned in their original packaging 
                      whenever possible.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Proof of purchase:</strong> Original receipt or order confirmation is required.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Within 7 days:</strong> Return must be initiated within 7 days of delivery date.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <strong>Defective or damaged items:</strong> We accept returns for manufacturing defects 
                      or items damaged during shipping.
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Non-Returnable */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <XCircle className="h-5 w-5 text-red-600" />
                  Non-Returnable Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Personal care items, cosmetics, and beauty products (unless defective or damaged)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Intimate or sanitary goods
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Gift cards and promotional items
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Final sale or clearance items (marked as non-returnable)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Items without proof of purchase
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <XCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      Custom or personalized products
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Return Process */}
            <Card>
              <CardHeader>
                <CardTitle>How to Return an Item</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Step 1: Initiate Your Return</h3>
                  <p className="text-muted-foreground mb-2">
                    Contact our customer service team within 7 days of receiving your order:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Email: returns@namecheap.to</li>
                    <li>Phone: +92-XXX-XXXXXXX (9 AM - 6 PM PKT, Monday - Saturday)</li>
                    <li>WhatsApp: Available through our contact page</li>
                  </ul>
                  <p className="text-muted-foreground mt-2">
                    Provide your order number, item details, and reason for return.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Step 2: Receive Return Authorization</h3>
                  <p className="text-muted-foreground">
                    Our team will review your request and send you a Return Authorization (RA) number 
                    along with return shipping instructions within 24-48 hours.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Step 3: Package Your Return</h3>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Securely pack the item in its original packaging if available</li>
                    <li>Include all accessories, manuals, and free gifts that came with the product</li>
                    <li>Include a copy of your invoice or packing slip</li>
                    <li>Clearly write the RA number on the outside of the package</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Step 4: Ship Your Return</h3>
                  <p className="text-muted-foreground mb-2">
                    Ship the package to the address provided by our customer service team. 
                    We recommend using a trackable shipping service.
                  </p>
                  <Alert className="mt-3">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Important:</strong> Return shipping costs are the customer&apos;s responsibility 
                      unless the item is defective or we sent the wrong item.
                    </AlertDescription>
                  </Alert>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">Step 5: Refund Processing</h3>
                  <p className="text-muted-foreground">
                    Once we receive and inspect your return, we will send you an email to confirm receipt. 
                    Your refund will be processed within 5-7 business days to your original payment method.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Exchanges */}
            <Card>
              <CardHeader>
                <CardTitle>Exchanges</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  If you need to exchange an item for a different size, color, or product, please follow 
                  the same return process outlined above. Once we receive your returned item, you can 
                  place a new order for the replacement item.
                </p>
                <p className="text-muted-foreground">
                  For faster service, you may also place a new order before returning the original item, 
                  subject to availability.
                </p>
              </CardContent>
            </Card>

            {/* Damaged or Defective */}
            <Card>
              <CardHeader>
                <CardTitle>Damaged or Defective Items</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  If you receive a damaged or defective item, please contact us immediately with:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                  <li>Your order number</li>
                  <li>Photos of the damaged/defective item</li>
                  <li>Photos of the packaging (if damaged in shipping)</li>
                  <li>Description of the issue</li>
                </ul>
                <p className="text-muted-foreground mt-3">
                  We will arrange for a replacement or full refund, including return shipping costs, 
                  at no charge to you.
                </p>
              </CardContent>
            </Card>

            {/* Refund Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Refund Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                      1
                    </div>
                    <div>
                      <p className="font-semibold">Return Received</p>
                      <p className="text-sm text-muted-foreground">We&apos;ll email you when we receive your return</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                      2
                    </div>
                    <div>
                      <p className="font-semibold">Inspection (1-2 business days)</p>
                      <p className="text-sm text-muted-foreground">We inspect the returned item to ensure it meets our return criteria</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                      3
                    </div>
                    <div>
                      <p className="font-semibold">Refund Processed (5-7 business days)</p>
                      <p className="text-sm text-muted-foreground">Refund is issued to your original payment method</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-semibold">
                      4
                    </div>
                    <div>
                      <p className="font-semibold">Funds Available (3-5 business days)</p>
                      <p className="text-sm text-muted-foreground">Depending on your bank/card issuer, funds may take additional time to appear</p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Questions About Returns?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  If you have any questions about our return policy or need assistance with a return, 
                  our customer service team is here to help:
                </p>
                <div className="bg-muted p-4 rounded-lg space-y-2">
                  <p className="font-semibold">Customer Service</p>
                  <p className="text-sm text-muted-foreground">Email: support@namecheap.to</p>
                  <p className="text-sm text-muted-foreground">Phone: +92-XXX-XXXXXXX</p>
                  <p className="text-sm text-muted-foreground">Hours: 9 AM - 6 PM PKT, Monday - Saturday</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
