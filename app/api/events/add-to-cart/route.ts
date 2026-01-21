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
 * Track AddToCart server-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { contentId, contentName, value, quantity, currency, url, email } = body

    if (!contentId || !contentName || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'contentId, contentName, and value are required' },
        { status: 400 }
      )
    }

    const { clientIp, userAgent } = getClientData(request)
    const { fbp, fbc } = getFacebookCookies(request)

    await fbConversionsAPI.trackAddToCart({
      contentId,
      contentName,
      value,
      quantity,
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
    console.error('Error tracking AddToCart:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
