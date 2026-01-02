"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import useSWR from "swr"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, User, Package, Heart, Settings, LogOut, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, signOut } = useAuth()
  const { data: profileData, mutate } = useSWR(isAuthenticated ? "/api/users/profile" : null, fetcher)
  const { data: ordersData } = useSWR(isAuthenticated ? "/api/orders?limit=5" : null, fetcher)
  const { data: wishlistData } = useSWR(isAuthenticated ? "/api/wishlist" : null, fetcher)

  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [country, setCountry] = useState("")
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (profileData?.user) {
      const p = profileData.user
      setName(p.name || "")
      setPhone(p.phone || "")
      setAddress(p.address || "")
      setCity(p.city || "")
      setPostalCode(p.postal_code || "")
      setCountry(p.country || "")
    }
  }, [profileData])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    setSaved(false)

    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, address, city, postal_code: postalCode, country }),
      })

      if (!res.ok) {
        throw new Error("Failed to update profile")
      }

      await mutate()
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
  }

  if (authLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
        <Footer />
      </>
    )
  }

  if (!isAuthenticated) {
    router.push("/signin")
    return null
  }

  const orders = ordersData?.orders || []
  const wishlistCount = wishlistData?.count || 0

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">My Account</h1>

          <Tabs defaultValue="profile" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
              <TabsTrigger value="profile" className="gap-2">
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Quick Stats */}
                <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{orders.length}</p>
                      <p className="text-sm text-muted-foreground">Orders</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <Heart className="w-8 h-8 mx-auto mb-2 text-primary" />
                      <p className="text-2xl font-bold">{wishlistCount}</p>
                      <p className="text-sm text-muted-foreground">Wishlist</p>
                    </CardContent>
                  </Card>
                  <Link href="/orders" className="col-span-2">
                    <Card className="h-full hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center justify-between">
                        <div>
                          <p className="font-medium">View All Orders</p>
                          <p className="text-sm text-muted-foreground">Track and manage your orders</p>
                        </div>
                        <Package className="w-8 h-8 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                </div>

                {/* Profile Form */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>Update your personal details and shipping address</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {error && (
                        <Alert variant="destructive">
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      {saved && (
                        <Alert className="bg-green-50 border-green-200">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <AlertDescription className="text-green-600">Profile updated successfully!</AlertDescription>
                        </Alert>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" value={user?.email || ""} disabled />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="Enter your phone number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Street Address</Label>
                        <Textarea
                          id="address"
                          placeholder="Enter your street address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input id="city" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="postalCode">Postal Code</Label>
                          <Input
                            id="postalCode"
                            placeholder="Postal code"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            placeholder="Country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                          />
                        </div>
                      </div>
                      <Button onClick={handleSave} disabled={saving}>
                        {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Orders */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {orders.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">No orders yet</p>
                      ) : (
                        <div className="space-y-3">
                          {orders.slice(0, 3).map((order: any) => (
                            <Link
                              key={order.id}
                              href={`/orders/${order.order_number}`}
                              className="block p-3 rounded-lg bg-muted/50 hover:bg-muted transition"
                            >
                              <p className="font-medium text-sm">{order.order_number}</p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(order.created_at).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-primary font-medium">
                                Rs. {Number(order.total_amount).toLocaleString()}
                              </p>
                            </Link>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>Manage your account preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">Sign Out</p>
                      <p className="text-sm text-muted-foreground">Sign out from your account</p>
                    </div>
                    <Button variant="destructive" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </>
  )
}
