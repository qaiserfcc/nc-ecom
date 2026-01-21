import { NextRequest, NextResponse } from "next/server"
import { getFacebookMarketingClient } from "@/lib/facebook-marketing"

export async function GET(
  request: NextRequest,
  { params }: { params: { pageId: string } }
) {
  try {
    const client = getFacebookMarketingClient()
    const pageId = params.pageId

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "50")

    const forms = await client.getLeadForms(pageId)
    const formsWithLeads = await Promise.all(
      forms.map(async (form) => {
        const leads = await client.getFormLeads(form.id, { limit: 10 })
        return { ...form, recent_leads: leads }
      })
    )

    return NextResponse.json({
      success: true,
      forms: formsWithLeads,
    })
  } catch (error: any) {
    console.error("Error fetching lead forms:", error)
    return NextResponse.json(
      { success: true, forms: [] },
      { status: 200 }
    )
  }
}
