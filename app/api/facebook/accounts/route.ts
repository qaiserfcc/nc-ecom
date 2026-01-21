import { NextRequest, NextResponse } from "next/server"
import { getFacebookMarketingClient } from "@/lib/facebook-marketing"

export async function GET(request: NextRequest) {
  try {
    const client = getFacebookMarketingClient()
    const accounts = await client.getBusinessAccounts()

    return NextResponse.json({
      success: true,
      accounts,
    })
  } catch (error: any) {
    console.error("Error fetching business accounts:", error)
    
    // Return more detailed error info
    const errorMessage = error.response?.data?.error?.message || error.message || "Unknown error"
    const errorCode = error.response?.status || 500
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: {
          status: errorCode,
          type: error.response?.data?.error?.type,
          code: error.code,
        }
      },
      { status: errorCode > 399 ? errorCode : 500 }
    )
  }
}

