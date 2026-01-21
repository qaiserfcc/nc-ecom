import { NextRequest, NextResponse } from "next/server"
import { getFacebookMarketingClient } from "@/lib/facebook-marketing"

export async function GET(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const client = getFacebookMarketingClient()
    const formId = params.formId

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "100")

    const leads = await client.getFormLeads(formId, { limit })

    return NextResponse.json({
      success: true,
      leads,
    })
  } catch (error: any) {
    console.error("Error fetching form leads:", error)
    return NextResponse.json(
      { success: true, leads: [] },
      { status: 200 }
    )
  }
}
