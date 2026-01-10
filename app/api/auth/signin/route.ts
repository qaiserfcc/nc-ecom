import { type NextRequest, NextResponse } from "next/server"
import { signIn, setAuthCookie } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const result = await signIn(email, password)

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 401 })
    }

    await setAuthCookie(result.token)

    return NextResponse.json({ user: result.user })
  } catch (error) {
    return handleApiError(error)
  }
}
