import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"
import { getSession } from "@/lib/auth"
import { handleApiError, ApiErrors } from "@/lib/api-error-handler"
import { SocketEvents } from "@/lib/socket-events"

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== "object") {
      throw ApiErrors.badRequest("Invalid JSON body")
    }

    const name = (body as any).name
    const email = (body as any).email
    const phone = (body as any).phone
    const message = (body as any).message

    if (!isNonEmptyString(name)) {
      throw ApiErrors.badRequest("Name is required")
    }
    if (!isNonEmptyString(email)) {
      throw ApiErrors.badRequest("Email is required")
    }
    if (!isNonEmptyString(message)) {
      throw ApiErrors.badRequest("Message is required")
    }

    const session = await getSession()

    let userId: string | null = session?.user?.id ?? null

    if (!userId) {
      const existingUser = await sql`SELECT id FROM users WHERE email = ${email} LIMIT 1`
      if (existingUser.length > 0) {
        userId = String(existingUser[0].id)
      }
    }

    const result = await sql`
      INSERT INTO quotes (user_id, name, email, phone, message)
      VALUES (${userId}::uuid, ${name}, ${email}, ${isNonEmptyString(phone) ? phone : null}, ${message})
      RETURNING id, user_id, name, email, phone, message, status, created_at
    `

    const quote = result[0]

    await SocketEvents.notifyQuoteSubmitted(
      quote.id,
      quote.user_id ? String(quote.user_id) : null,
      String(quote.name),
      String(quote.email),
    ).catch(console.error)

    return NextResponse.json({ quote }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
