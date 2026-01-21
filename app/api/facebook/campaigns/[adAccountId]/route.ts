import { NextRequest, NextResponse } from "next/server"
import { getFacebookMarketingClient } from "@/lib/facebook-marketing"

export async function GET(
  request: NextRequest,
  { params }: { params: { adAccountId: string } }
) {
  try {
    const client = getFacebookMarketingClient()
    const adAccountId = params.adAccountId

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")?.split(",") || ["ACTIVE"]
    const limit = parseInt(searchParams.get("limit") || "100")

    const campaigns = await client.getCampaigns(adAccountId, {
      status,
      limit,
    })

    return NextResponse.json({ success: true, campaigns })
  } catch (error: any) {
    console.error("Error fetching campaigns:", error)
    return NextResponse.json(
      { success: true, campaigns: [] },
      { status: 200 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { adAccountId: string } }
) {
  try {
    const body = await request.json()
    const { name, objective, status } = body

    if (!name || !objective) {
      return NextResponse.json(
        { success: false, error: "Name and objective are required" },
        { status: 400 }
      )
    }

    const client = getFacebookMarketingClient()
    const campaign = await client.createCampaign(params.adAccountId, {
      name,
      objective,
      status,
    })

    return NextResponse.json({
      success: true,
      campaign,
    })
  } catch (error: any) {
    console.error("Error creating campaign:", error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
