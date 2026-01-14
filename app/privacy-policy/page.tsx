import Header from "@/components/header"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Lock, Eye, UserCheck, Database, Mail, Globe } from "lucide-react"

export const metadata = {
  title: "Privacy Policy - Your Data Protection",
  description: "Learn how we collect, use, and protect your personal information. Our commitment to your privacy and data security.",
}

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
            <p className="text-lg text-muted-foreground">
              Last updated: January 14, 2026
            </p>
          </div>

          <Alert className="mb-8 border-primary">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your privacy is important to us. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you visit our website and use our services.
            </AlertDescription>
          </Alert>

          <div className="space-y-6">
            {/* Introduction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Introduction
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Namecheap E-commerce (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates www.namecheap.to 
                  and related services (collectively, the &quot;Service&quot;). This Privacy Policy informs you of 
                  our policies regarding the collection, use, and disclosure of personal information when you 
                  use our Service.
                </p>
                <p className="text-muted-foreground">
                  By accessing or using the Service, you agree to the collection and use of information in 
                  accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used 
                  have the same meanings as in our Terms and Conditions.
                </p>
              </CardContent>
            </Card>

            {/* Information We Collect */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Information We Collect
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3">1. Personal Information</h3>
                  <p className="text-muted-foreground mb-2">
                    While using our Service, we may ask you to provide certain personally identifiable 
                    information that can be used to contact or identify you. This may include:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Full name</li>
                    <li>Email address</li>
                    <li>Phone number</li>
                    <li>Shipping and billing address</li>
                    <li>Payment information (processed securely through third-party payment processors)</li>
                    <li>Account credentials (username and encrypted password)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">2. Usage Data</h3>
                  <p className="text-muted-foreground mb-2">
                    We automatically collect certain information when you visit, use, or navigate the Service:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>IP address and device information</li>
                    <li>Browser type and version</li>
                    <li>Pages visited and time spent on pages</li>
                    <li>Referring website addresses</li>
                    <li>Operating system and device identifiers</li>
                    <li>Clickstream data and interaction patterns</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">3. Cookies and Tracking Technologies</h3>
                  <p className="text-muted-foreground">
                    We use cookies, web beacons, and similar tracking technologies to track activity on 
                    our Service and store certain information. You can instruct your browser to refuse all 
                    cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, 
                    you may not be able to use some portions of our Service.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-3">4. Order and Transaction Information</h3>
                  <p className="text-muted-foreground mb-2">
                    When you make a purchase or attempt to make a purchase through the Service, we collect:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                    <li>Order details and product information</li>
                    <li>Purchase history</li>
                    <li>Shipping preferences</li>
                    <li>Communication preferences</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Your Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  How We Use Your Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 p-1 rounded mt-0.5">
                      <UserCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Process and fulfill orders</p>
                      <p className="text-sm text-muted-foreground">
                        To process your transactions, manage your orders, arrange shipping, and handle returns
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 p-1 rounded mt-0.5">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Communicate with you</p>
                      <p className="text-sm text-muted-foreground">
                        Send order confirmations, shipping updates, customer service responses, and account notifications
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 p-1 rounded mt-0.5">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Prevent fraud and enhance security</p>
                      <p className="text-sm text-muted-foreground">
                        Detect and prevent fraudulent transactions, protect against malicious activity, and secure your account
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 p-1 rounded mt-0.5">
                      <Globe className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Improve our Service</p>
                      <p className="text-sm text-muted-foreground">
                        Analyze usage patterns, understand customer preferences, and enhance user experience
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 p-1 rounded mt-0.5">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Marketing and promotions</p>
                      <p className="text-sm text-muted-foreground">
                        Send promotional emails, newsletters, and special offers (you can opt-out at any time)
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 p-1 rounded mt-0.5">
                      <UserCheck className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Personalize your experience</p>
                      <p className="text-sm text-muted-foreground">
                        Provide personalized product recommendations and customized content based on your preferences
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary/10 p-1 rounded mt-0.5">
                      <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">Comply with legal obligations</p>
                      <p className="text-sm text-muted-foreground">
                        Meet regulatory requirements, respond to legal requests, and enforce our terms and conditions
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  How We Share Your Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  We do not sell, trade, or rent your personal information to third parties. However, we may 
                  share your information in the following circumstances:
                </p>
                
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold mb-1">Service Providers</h4>
                    <p className="text-sm text-muted-foreground">
                      We may share your information with third-party service providers who perform services 
                      on our behalf, such as payment processing, shipping, email delivery, hosting services, 
                      and analytics. These providers are bound by contractual obligations to keep your information 
                      confidential and use it only for the purposes we specify.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Business Transfers</h4>
                    <p className="text-sm text-muted-foreground">
                      If we are involved in a merger, acquisition, or sale of assets, your personal information 
                      may be transferred. We will provide notice before your information is transferred and 
                      becomes subject to a different privacy policy.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">Legal Requirements</h4>
                    <p className="text-sm text-muted-foreground">
                      We may disclose your information if required by law or in response to valid requests by 
                      public authorities (e.g., a court or government agency), or to protect our rights, privacy, 
                      safety, or property.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-1">With Your Consent</h4>
                    <p className="text-sm text-muted-foreground">
                      We may share your information with third parties when you give us explicit consent to do so.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Data Security
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  The security of your personal information is important to us. We implement appropriate 
                  technical and organizational measures to protect your data:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>SSL/TLS encryption for data transmission</li>
                  <li>Secure password hashing and encryption</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication mechanisms</li>
                  <li>Secure payment processing through PCI-DSS compliant providers</li>
                  <li>Regular backups and disaster recovery procedures</li>
                </ul>
                <Alert className="mt-4">
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    While we strive to protect your personal information, no method of transmission over the 
                    internet or electronic storage is 100% secure. We cannot guarantee absolute security but 
                    commit to using industry-standard practices.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Data Retention */}
            <Card>
              <CardHeader>
                <CardTitle>Data Retention</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  We retain your personal information only for as long as necessary to fulfill the purposes 
                  outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
                </p>
                <p className="text-muted-foreground">
                  When we no longer need your personal information, we will securely delete or anonymize it. 
                  Some information may be retained for longer periods for legal, regulatory, or business purposes.
                </p>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="h-5 w-5" />
                  Your Privacy Rights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Depending on your location, you may have the following rights regarding your personal information:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold">Access</p>
                      <p className="text-sm text-muted-foreground">
                        Request a copy of the personal information we hold about you
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold">Correction</p>
                      <p className="text-sm text-muted-foreground">
                        Request correction of inaccurate or incomplete personal information
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold">Deletion</p>
                      <p className="text-sm text-muted-foreground">
                        Request deletion of your personal information, subject to certain exceptions
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold">Portability</p>
                      <p className="text-sm text-muted-foreground">
                        Request transfer of your data to another service provider in a structured format
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold">Opt-out</p>
                      <p className="text-sm text-muted-foreground">
                        Opt-out of marketing communications at any time
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                      ✓
                    </div>
                    <div>
                      <p className="font-semibold">Object</p>
                      <p className="text-sm text-muted-foreground">
                        Object to processing of your personal information for certain purposes
                      </p>
                    </div>
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  To exercise these rights, please contact us at privacy@namecheap.to. We will respond to 
                  your request within 30 days.
                </p>
              </CardContent>
            </Card>

            {/* Third-Party Links */}
            <Card>
              <CardHeader>
                <CardTitle>Third-Party Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Our Service may contain links to third-party websites or services that are not owned or 
                  controlled by us. We have no control over and assume no responsibility for the content, 
                  privacy policies, or practices of any third-party sites or services.
                </p>
                <p className="text-muted-foreground">
                  We strongly advise you to review the privacy policy of every site you visit. This Privacy 
                  Policy applies only to our Service.
                </p>
              </CardContent>
            </Card>

            {/* Children's Privacy */}
            <Card>
              <CardHeader>
                <CardTitle>Children&apos;s Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Our Service is not intended for individuals under the age of 18. We do not knowingly collect 
                  personally identifiable information from children under 18. If you are a parent or guardian 
                  and become aware that your child has provided us with personal information, please contact us.
                </p>
                <p className="text-muted-foreground">
                  If we discover that we have collected personal information from a child under 18 without 
                  verification of parental consent, we will take steps to remove that information from our servers.
                </p>
              </CardContent>
            </Card>

            {/* International Transfers */}
            <Card>
              <CardHeader>
                <CardTitle>International Data Transfers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  Your information, including personal data, may be transferred to — and maintained on — 
                  computers located outside of your state, province, country, or other governmental jurisdiction 
                  where data protection laws may differ.
                </p>
                <p className="text-muted-foreground">
                  If you are located outside Pakistan and choose to provide information to us, please note 
                  that we transfer the data, including personal data, to Pakistan and process it there. Your 
                  consent to this Privacy Policy followed by your submission of such information represents 
                  your agreement to that transfer.
                </p>
              </CardContent>
            </Card>

            {/* Analytics and Advertising */}
            <Card>
              <CardHeader>
                <CardTitle>Analytics and Advertising</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Analytics Services</h4>
                  <p className="text-sm text-muted-foreground">
                    We may use third-party service providers like Google Analytics, Vercel Analytics, and others 
                    to monitor and analyze the use of our Service. These services may use cookies and similar 
                    technologies to collect information about your use of the Service.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Meta Pixel (Facebook Pixel)</h4>
                  <p className="text-sm text-muted-foreground">
                    We use Meta Pixel to measure the effectiveness of our advertising and understand user actions. 
                    This service may collect information about your activities on our website to serve you 
                    personalized advertisements. You can opt-out of personalized advertising by adjusting your 
                    Facebook ad preferences.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Changes to Policy */}
            <Card>
              <CardHeader>
                <CardTitle>Changes to This Privacy Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by 
                  posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date at 
                  the top of this policy.
                </p>
                <p className="text-muted-foreground">
                  We will notify you via email and/or a prominent notice on our Service prior to the change 
                  becoming effective. We encourage you to review this Privacy Policy periodically for any changes.
                </p>
                <p className="text-muted-foreground">
                  Changes to this Privacy Policy are effective when they are posted on this page. Your continued 
                  use of the Service after we post any modifications to the Privacy Policy will constitute your 
                  acknowledgment of the modifications and your consent to abide by the modified Privacy Policy.
                </p>
              </CardContent>
            </Card>

            {/* Contact Us */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Us
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions, concerns, or requests regarding this Privacy Policy or our data 
                  practices, please contact us:
                </p>
                <div className="bg-muted p-6 rounded-lg space-y-3">
                  <p className="font-semibold text-lg">Namecheap E-commerce</p>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground">
                      <strong>Email:</strong> privacy@namecheap.to
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Support Email:</strong> support@namecheap.to
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Phone:</strong> +92-XXX-XXXXXXX
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Address:</strong> [Your Business Address]
                    </p>
                    <p className="text-muted-foreground">
                      <strong>Hours:</strong> 9 AM - 6 PM PKT, Monday - Saturday
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  We will do our best to respond to your inquiry within 48 hours.
                </p>
              </CardContent>
            </Card>

            {/* Consent */}
            <Card className="border-primary">
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-center">
                  By using our Service, you acknowledge that you have read and understood this Privacy Policy 
                  and agree to its terms and conditions.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
