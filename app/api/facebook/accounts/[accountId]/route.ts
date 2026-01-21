import { NextRequest, NextResponse } from "next/server"
import { getFacebookMarketingClient } from "@/lib/facebook-marketing"

export async function GET(
  request: NextRequest,
  { params }: { params: { accountId: string } }
) {
  try {
    const client = getFacebookMarketingClient()
    const accountId = params.accountId

    const [adAccounts, pages] = await Promise.all([
      client.getAdAccounts(accountId),
      client.getPages(accountId),
    ])

    return NextResponse.json({
      success: true,
      adAccounts,
      pages,
    })
  } catch (error: any) {
    console.error("Error fetching account details:", error)
    
    // Return empty data instead of error if endpoints fail
    return NextResponse.json(
      { 
        success: true,
        adAccounts: [],
        pages: [],
      },
      { status: 200 }
    )
  }
}

