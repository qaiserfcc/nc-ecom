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
 * Track Purchase server-side
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      orderId, 
      contents, 
      value, 
      numItems, 
      currency, 
      email,
      phone,
      firstName,
      lastName,
      city,
      state,
      zip,
      country,
      url 
    } = body

    if (!orderId || !contents || !Array.isArray(contents) || value === undefined) {
      return NextResponse.json(
        { success: false, error: 'orderId, contents, and value are required' },
        { status: 400 }
      )
    }

    const { clientIp, userAgent } = getClientData(request)
    const { fbp, fbc } = getFacebookCookies(request)

    await fbConversionsAPI.trackPurchase({
      orderId,
      contents,
      value,
      numItems: numItems || contents.length,
      currency,
      email,
      phone,
      firstName,
      lastName,
      city,
      state,
      zip,
      country,
      url,
      clientIp,
      userAgent,
      fbp,
      fbc,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error tracking Purchase:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
