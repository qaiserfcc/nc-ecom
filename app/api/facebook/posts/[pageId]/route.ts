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

    const posts = await client.getPagePosts(pageId, { limit })
    const postsWithInsights = await Promise.all(
      posts.map(async (post) => {
        const insights = await client.getPostInsights(post.id)
        return { ...post, insights }
      })
    )

    return NextResponse.json({
      success: true,
      posts: postsWithInsights,
    })
  } catch (error: any) {
    console.error("Error fetching page posts:", error)
    return NextResponse.json(
      { success: true, posts: [] },
      { status: 200 }
    )
  }
}
