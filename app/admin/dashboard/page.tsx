"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function DashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/admin")
  }, [router])

  return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Redirecting...</h2>
        <p className="text-muted-foreground">Taking you to the unified admin dashboard</p>
      </div>
    </div>
  )
}
