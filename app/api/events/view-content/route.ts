import { NextRequest, NextResponse } from 'next/server'
import { fbConversionsAPI } from '@/lib/facebook-conversions-api'

function getClientData(request: NextRequest) {
  const clientIp = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    undefined
  const userAgent = request.headers.get('user-agent') || undefined
  return { clientIp, userAgent }
}

function getFacebookCookies(request: NextRequest) {
  const cookies = request.cookies
  return {
    fbp: cookies.get('_fbp')?.value,
    fbc: cookies.get('_fbc')?.value,
  }
}

/**
 * Track ViewContent (Product View) server-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentId, contentName, contentType, value, currency, url, email } = body

    if (!contentId || !contentName) {
      return NextResponse.json(
        { success: false, error: 'contentId and contentName are required' },
        { status: 400 }
      )
    }

    const { clientIp, userAgent } = getClientData(request)
    const { fbp, fbc } = getFacebookCookies(request)

    await fbConversionsAPI.trackViewContent({
      contentId,
      contentName,
      contentType: contentType || 'product',
      value,
      currency,
      url,
      email,
      clientIp,
      userAgent,
      fbp,
      fbc,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error tracking ViewContent:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
