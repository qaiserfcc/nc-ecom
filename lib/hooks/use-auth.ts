"use client"

import { useCallback } from "react"
import useSWR from "swr"

interface User {
  id: string
  email: string
  name: string
  phone?: string
  address?: string
  city?: string
  postal_code?: string
  country?: string
  role: "customer" | "admin"
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR("/api/auth/me", fetcher, {
    revalidateOnFocus: true,
  })

  const user = data?.user as User | null

  const signUp = useCallback(
    async (email: string, password: string, name: string, role: "customer" | "admin" = "customer") => {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name, role }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      await mutate()
      return result.user
    },
    [mutate],
  )

  const signIn = useCallback(
    async (email: string, password: string) => {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error)
      await mutate()
      return result.user
    },
    [mutate],
  )

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" })
    await mutate()
  }, [mutate])

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.role === "admin",
    signUp,
    signIn,
    signOut,
    refresh: mutate,
  }
}
