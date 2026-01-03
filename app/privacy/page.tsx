import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent } from "@/components/ui/card"
import { Shield, Lock, Eye, Database, UserCheck, FileText, AlertCircle, Mail } from "lucide-react"

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 sm:py-12 md:py-16">
          {/* Hero Section */}
          <div className="text-center mb-12 md:mb-16">
            <Shield className="w-16 h-16 text-primary mx-auto mb-4" />
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 text-foreground">Privacy Policy</h1>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
            <p className="text-sm text-muted-foreground mt-4">Last updated: January 2025</p>
          </div>

          {/* Key Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 md:mb-16">
            <Card>
              <CardContent className="pt-6 text-center">
                <Lock className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-base mb-2">Secure Data</h3>
                <p className="text-sm text-muted-foreground">Your information is encrypted and protected</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Eye className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-base mb-2">Transparency</h3>
                <p className="text-sm text-muted-foreground">Clear about data usage and purposes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <UserCheck className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-base mb-2">Your Control</h3>
                <p className="text-sm text-muted-foreground">You control your personal data</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <Database className="w-10 h-10 text-primary mx-auto mb-3" />
                <h3 className="font-semibold text-base mb-2">No Selling</h3>
                <p className="text-sm text-muted-foreground">We never sell your information</p>
              </CardContent>
            </Card>
          </div>

          {/* Introduction */}
          <section className="mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">Introduction</h2>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-4">
                  Welcome to Namecheap. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains what information we collect, how we use it, and what rights you have in relation to it.
                </p>
                <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                  By using our website and services, you agree to the collection and use of information in accordance with this policy. If you have any questions or concerns about our policy or our practices with regard to your personal information, please contact us at{" "}
                  <a href="mailto:qaiserfcc@gmail.com" className="text-primary hover:underline">
                    qaiserfcc@gmail.com
                  </a>.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Information We Collect */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-8 h-8 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Information We Collect</h2>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3 text-foreground">Personal Information</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    We collect personal information that you provide to us when you:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Create an account (name, email, password)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Place an order (shipping address, phone number)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Make a payment (payment information processed securely)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Contact customer support</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Participate in our referral program</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-lg mb-3 text-foreground">Automatically Collected Information</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    We automatically collect certain information when you visit our website:
                  </p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Device information (IP address, browser type, operating system)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Usage data (pages visited, time spent, clicks)</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="text-primary">•</span>
                      <span>Cookies and similar tracking technologies</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* How We Use Information */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">How We Use Your Information</h2>
            </div>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  We use your personal information for the following purposes:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Order Processing</p>
                      <p className="text-xs text-muted-foreground">To process and fulfill your orders</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Account Management</p>
                      <p className="text-xs text-muted-foreground">To manage your account and preferences</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Customer Support</p>
                      <p className="text-xs text-muted-foreground">To provide customer service and support</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Communications</p>
                      <p className="text-xs text-muted-foreground">To send order updates and notifications</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Marketing</p>
                      <p className="text-xs text-muted-foreground">To send promotional offers (with your consent)</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Improvements</p>
                      <p className="text-xs text-muted-foreground">To improve our products and services</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Security</p>
                      <p className="text-xs text-muted-foreground">To protect against fraud and unauthorized access</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Legal Compliance</p>
                      <p className="text-xs text-muted-foreground">To comply with legal obligations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Data Sharing */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <UserCheck className="w-8 h-8 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Data Sharing and Disclosure</h2>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  We may share your information with the following parties:
                </p>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2">Service Providers</h4>
                    <p className="text-sm text-muted-foreground">
                      We work with third-party service providers for payment processing, shipping, and analytics. They only have access to information necessary to perform their services.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2">Business Transfers</h4>
                    <p className="text-sm text-muted-foreground">
                      In the event of a merger, acquisition, or sale of assets, your information may be transferred to the new entity.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-foreground mb-2">Legal Requirements</h4>
                    <p className="text-sm text-muted-foreground">
                      We may disclose your information if required by law or to protect our rights, property, or safety.
                    </p>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mt-4">
                    <div className="flex gap-3">
                      <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-amber-800 dark:text-amber-200">
                        <strong>Important:</strong> We never sell your personal information to third parties for marketing purposes.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Data Security */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Lock className="w-8 h-8 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Data Security</h2>
            </div>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  We implement appropriate technical and organizational measures to protect your personal information:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Encryption</p>
                      <p className="text-xs text-muted-foreground">Data encrypted in transit and at rest</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Secure Servers</p>
                      <p className="text-xs text-muted-foreground">Protected servers with restricted access</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Regular Audits</p>
                      <p className="text-xs text-muted-foreground">Security assessments and updates</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-sm text-foreground">Access Controls</p>
                      <p className="text-xs text-muted-foreground">Limited staff access to personal data</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Your Rights */}
          <section className="mb-12 md:mb-16">
            <div className="flex items-center gap-3 mb-6">
              <Eye className="w-8 h-8 text-primary" />
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Your Rights</h2>
            </div>
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">You have the following rights regarding your personal information:</p>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Access</p>
                      <p className="text-xs text-muted-foreground">Request a copy of your personal data</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Correction</p>
                      <p className="text-xs text-muted-foreground">Update or correct inaccurate information</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Deletion</p>
                      <p className="text-xs text-muted-foreground">Request deletion of your personal data</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Opt-out</p>
                      <p className="text-xs text-muted-foreground">Unsubscribe from marketing communications</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Data Portability</p>
                      <p className="text-xs text-muted-foreground">Receive your data in a structured format</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-6">
                  To exercise these rights, please contact us at{" "}
                  <a href="mailto:qaiserfcc@gmail.com" className="text-primary hover:underline">
                    qaiserfcc@gmail.com
                  </a>
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Cookies */}
          <section className="mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-6 text-foreground">Cookies</h2>
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-4">
                  We use cookies and similar tracking technologies to enhance your browsing experience. Cookies help us:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Remember your preferences and settings</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Keep you signed in to your account</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Understand how you use our website</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-primary">•</span>
                    <span>Improve our services and user experience</span>
                  </li>
                </ul>
                <p className="text-sm text-muted-foreground">
                  You can control cookies through your browser settings. Note that disabling cookies may affect website functionality.
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Contact Us */}
          <section className="bg-muted/50 rounded-xl p-6 sm:p-8 md:p-10">
            <div className="text-center">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-foreground">Questions About Privacy?</h2>
              <p className="text-muted-foreground mb-6 text-sm sm:text-base max-w-2xl mx-auto">
                If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                <a
                  href="mailto:qaiserfcc@gmail.com"
                  className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition font-medium"
                >
                  qaiserfcc@gmail.com
                </a>
                <a
                  href="tel:+923110484849"
                  className="inline-flex items-center justify-center px-6 py-3 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition font-medium"
                >
                  +92 311 0484849
                </a>
              </div>
              <p className="text-sm text-muted-foreground">
                Address: Township Lahore, Pakistan
              </p>
            </div>
          </section>

          {/* Updates to Policy */}
          <section className="mt-12 md:mt-16">
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg mb-3 text-foreground">Updates to This Policy</h3>
                <p className="text-sm text-muted-foreground">
                  We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date. We encourage you to review this Privacy Policy periodically.
                </p>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
