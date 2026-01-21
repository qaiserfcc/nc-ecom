import { NextRequest, NextResponse } from 'next/server'
import { fbConversionsAPI } from '@/lib/facebook-conversions-api'

/**
 * Helper to extract client data from request
 */
function getClientData(request: NextRequest) {
  const clientIp = 
    request.headers.get('x-forwarded-for')?.split(',')[0] ||
    request.headers.get('x-real-ip') ||
    undefined

  const userAgent = request.headers.get('user-agent') || undefined
  
  return { clientIp, userAgent }
}

/**
 * Helper to extract Facebook cookies
 */
function getFacebookCookies(request: NextRequest) {
  const cookies = request.cookies
  return {
    fbp: cookies.get('_fbp')?.value,
    fbc: cookies.get('_fbc')?.value,
  }
}

/**
 * Track PageView server-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, email } = body

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      )
    }

    const { clientIp, userAgent } = getClientData(request)
    const { fbp, fbc } = getFacebookCookies(request)

    await fbConversionsAPI.trackPageView({
      url,
      email,
      clientIp,
      userAgent,
      fbp,
      fbc,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error tracking PageView:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
