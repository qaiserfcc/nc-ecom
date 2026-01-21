import { NextRequest, NextResponse } from "next/server"
import { getFacebookMarketingClient } from "@/lib/facebook-marketing"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pixelId, eventName, email, phone, value, currency } = body

    if (!pixelId || !eventName) {
      return NextResponse.json(
        { success: false, error: "Pixel ID and event name are required" },
        { status: 400 }
      )
    }

    const client = getFacebookMarketingClient()

    // Hash user data if provided
    const hashString = (str: string) => {
      const crypto = require("crypto")
      return crypto.createHash("sha256").update(str.toLowerCase()).digest("hex")
    }

    const userData: any = {}
    if (email) userData.em = hashString(email)
    if (phone) userData.ph = hashString(phone)

    const event = {
      event_id: `event_${Date.now()}`,
      event_name: eventName,
      event_time: Math.floor(Date.now() / 1000),
      action_source: "website",
      user_data: userData,
      custom_data: {
        value: value || 0,
        currency: currency || "USD",
      },
    }

    const result = await client.sendPixelEvent(pixelId, event as any)

    return NextResponse.json({
      success: true,
      message: "Pixel event sent successfully",
      result,
    })
  } catch (error: any) {
    console.error("Error sending pixel event:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
