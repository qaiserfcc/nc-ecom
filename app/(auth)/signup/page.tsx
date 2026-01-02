"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export default function SignUpPage() {
  const router = useRouter()
  const { signUp } = useAuth()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<"customer" | "admin">("customer")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const allowAdminSignup =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_ALLOW_ADMIN_SIGNUP === "true"
      ? true
      : process.env.NODE_ENV !== "production"

  const applyPreset = (preset: "customer" | "admin") => {
    const presets = {
      customer: {
        name: "Dev Shopper",
        email: "user@namecheap.com",
        password: "user123",
        role: "customer" as const,
      },
      admin: {
        name: "Dev Admin",
        email: "admin@namecheap.com",
        password: "admin123",
        role: "admin" as const,
      },
    }

    const chosen = presets[preset]
    setName(chosen.name)
    setEmail(chosen.email)
    setPassword(chosen.password)
    setConfirmPassword(chosen.password)
    setRole(chosen.role)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)

    try {
      const requestedRole = role === "admin" && allowAdminSignup ? "admin" : "customer"
      await signUp(email, password, name, requestedRole)
      router.push("/")
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link href="/" className="flex items-center justify-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg">
              NC
            </div>
            <span className="text-xl font-bold text-primary">Namecheap</span>
          </Link>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join our community of profit-sharing shoppers</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button type="button" variant="outline" onClick={() => applyPreset("customer")}
                className="w-full">
                Autofill Shopper
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => applyPreset("admin")}
                className="w-full"
              >
                Autofill Admin
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>User Role (dev only)</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value as "customer" | "admin")}
                className="grid grid-cols-2 gap-2"
              >
                <div className="flex items-center space-x-2 rounded-md border p-3">
                  <RadioGroupItem value="customer" id="role-customer" />
                  <Label htmlFor="role-customer" className="cursor-pointer">Shopper</Label>
                </div>
                <div className="flex items-center space-x-2 rounded-md border p-3 opacity-100">
                  <RadioGroupItem value="admin" id="role-admin" disabled={!allowAdminSignup} />
                  <Label
                    htmlFor="role-admin"
                    className={`cursor-pointer ${!allowAdminSignup ? "text-muted-foreground" : ""}`}
                  >
                    Admin
                  </Label>
                </div>
              </RadioGroup>
              {!allowAdminSignup && (
                <p className="text-xs text-muted-foreground">
                  Admin signups require NEXT_PUBLIC_ALLOW_ADMIN_SIGNUP=true (dev-only).
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Account
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/signin" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
