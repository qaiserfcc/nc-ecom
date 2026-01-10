import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { handleApiError } from "@/lib/api-error-handler"

export async function POST() {
  try {
    const cookieStore = await cookies()
    cookieStore.delete("auth-token")
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
