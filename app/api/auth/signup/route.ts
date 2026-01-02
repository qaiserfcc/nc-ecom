import { type NextRequest, NextResponse } from "next/server"
import { signUp, setAuthCookie } from "@/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Email, password, and name are required" }, { status: 400 })
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 })
    }

    const requestedRole = role === "admin" ? "admin" : "customer"
    const result = await signUp(email, password, name, requestedRole)

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    await setAuthCookie(result.token)

    return NextResponse.json({ user: result.user })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
