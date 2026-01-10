import { NextResponse } from "next/server"
import { getSession } from "@/lib/auth"
import { handleApiError } from "@/lib/api-error-handler"

export async function GET() {
  try {
    const session = await getSession()

    if (!session) {
      return NextResponse.json({ user: null })
    }

    return NextResponse.json({ user: session.user })
  } catch (error) {
    return handleApiError(error)
  }
}
