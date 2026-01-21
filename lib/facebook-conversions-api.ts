/**
 * Facebook Conversions API - Server-Side Event Tracking
 * Sends events directly to Facebook for better tracking accuracy and iOS 14+ compatibility
 */

import crypto from 'crypto'

interface ServerEvent {
  event_name: 
    | 'PageView'
    | 'ViewContent'
    | 'AddToCart'
    | 'InitiateCheckout'
    | 'Purchase'
    | 'Search'
    | 'AddToWishlist'
  event_time: number
  event_source_url?: string
  action_source: 'website'
  user_data: {
    em?: string[] // hashed email
    ph?: string[] // hashed phone
    fn?: string[] // hashed first name
    ln?: string[] // hashed last name
    ct?: string[] // hashed city
    st?: string[] // hashed state
    zp?: string[] // hashed zip
    country?: string[] // hashed country
    client_ip_address?: string
    client_user_agent?: string
    fbc?: string // Facebook click ID
    fbp?: string // Facebook browser ID
  }
  custom_data?: {
    content_ids?: string[]
    content_name?: string
    content_type?: string
    contents?: Array<{
      id: string
      quantity: number
      item_price?: number
    }>
    currency?: string
    value?: number
    num_items?: number
    search_string?: string
  }
}

interface ConversionsAPIPayload {
  data: ServerEvent[]
  test_event_code?: string
}

export class FacebookConversionsAPI {
  private pixelId: string
  private accessToken: string
  private testEventCode?: string
  private apiVersion = 'v19.0'

  constructor() {
    this.pixelId = process.env.META_PIXEL_ID || '400049882525730'
    this.accessToken = process.env.META_CONVERSIONS_API_TOKEN || process.env.META_ACCESS_TOKEN || ''
    this.testEventCode = process.env.META_TEST_EVENT_CODE
  }

  /**
   * Hash data for privacy (SHA256)
   */
  private hash(data: string): string {
    return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex')
  }

  /**
   * Prepare user data with hashing
   */
  private prepareUserData(data: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    clientIp?: string
    userAgent?: string
    fbc?: string
    fbp?: string
  }) {
    const userData: ServerEvent['user_data'] = {
      client_ip_address: data.clientIp,
      client_user_agent: data.userAgent,
      fbc: data.fbc,
      fbp: data.fbp,
    }

    if (data.email) userData.em = [this.hash(data.email)]
    if (data.phone) userData.ph = [this.hash(data.phone)]
    if (data.firstName) userData.fn = [this.hash(data.firstName)]
    if (data.lastName) userData.ln = [this.hash(data.lastName)]
    if (data.city) userData.ct = [this.hash(data.city)]
    if (data.state) userData.st = [this.hash(data.state)]
    if (data.zip) userData.zp = [this.hash(data.zip)]
    if (data.country) userData.country = [this.hash(data.country)]

    return userData
  }

  /**
   * Send event to Facebook Conversions API
   */
  private async sendEvent(event: ServerEvent): Promise<boolean> {
    if (!this.accessToken) {
      console.warn('[FB Conversions API] No access token configured')
      return false
    }

    const url = `https://graph.facebook.com/${this.apiVersion}/${this.pixelId}/events`
    
    const payload: ConversionsAPIPayload = {
      data: [event],
    }

    if (this.testEventCode) {
      payload.test_event_code = this.testEventCode
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          access_token: this.accessToken,
        }),
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('[FB Conversions API] Error:', result)
        return false
      }

      console.log(`[FB Conversions API] ${event.event_name} tracked successfully`)
      return true
    } catch (error) {
      console.error('[FB Conversions API] Request failed:', error)
      return false
    }
  }

  /**
   * Track PageView event
   */
  async trackPageView(params: {
    url: string
    email?: string
    clientIp?: string
    userAgent?: string
    fbp?: string
    fbc?: string
  }) {
    const event: ServerEvent = {
      event_name: 'PageView',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.url,
      action_source: 'website',
      user_data: this.prepareUserData({
        email: params.email,
        clientIp: params.clientIp,
        userAgent: params.userAgent,
        fbp: params.fbp,
        fbc: params.fbc,
      }),
    }

    return this.sendEvent(event)
  }

  /**
   * Track ViewContent event (Product View)
   */
  async trackViewContent(params: {
    contentId: string
    contentName: string
    contentType: string
    value?: number
    currency?: string
    url?: string
    email?: string
    clientIp?: string
    userAgent?: string
    fbp?: string
    fbc?: string
  }) {
    const event: ServerEvent = {
      event_name: 'ViewContent',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.url,
      action_source: 'website',
      user_data: this.prepareUserData({
        email: params.email,
        clientIp: params.clientIp,
        userAgent: params.userAgent,
        fbp: params.fbp,
        fbc: params.fbc,
      }),
      custom_data: {
        content_ids: [params.contentId],
        content_name: params.contentName,
        content_type: params.contentType,
        value: params.value,
        currency: params.currency || 'USD',
      },
    }

    return this.sendEvent(event)
  }

  /**
   * Track AddToCart event
   */
  async trackAddToCart(params: {
    contentId: string
    contentName: string
    value: number
    quantity?: number
    currency?: string
    url?: string
    email?: string
    clientIp?: string
    userAgent?: string
    fbp?: string
    fbc?: string
  }) {
    const event: ServerEvent = {
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.url,
      action_source: 'website',
      user_data: this.prepareUserData({
        email: params.email,
        clientIp: params.clientIp,
        userAgent: params.userAgent,
        fbp: params.fbp,
        fbc: params.fbc,
      }),
      custom_data: {
        content_ids: [params.contentId],
        content_name: params.contentName,
        content_type: 'product',
        contents: [{
          id: params.contentId,
          quantity: params.quantity || 1,
          item_price: params.value,
        }],
        value: params.value * (params.quantity || 1),
        currency: params.currency || 'USD',
        num_items: params.quantity || 1,
      },
    }

    return this.sendEvent(event)
  }

  /**
   * Track InitiateCheckout event
   */
  async trackInitiateCheckout(params: {
    contents: Array<{ id: string; quantity: number; item_price: number }>
    value: number
    numItems: number
    currency?: string
    url?: string
    email?: string
    clientIp?: string
    userAgent?: string
    fbp?: string
    fbc?: string
  }) {
    const event: ServerEvent = {
      event_name: 'InitiateCheckout',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.url,
      action_source: 'website',
      user_data: this.prepareUserData({
        email: params.email,
        clientIp: params.clientIp,
        userAgent: params.userAgent,
        fbp: params.fbp,
        fbc: params.fbc,
      }),
      custom_data: {
        content_ids: params.contents.map(c => c.id),
        contents: params.contents,
        value: params.value,
        currency: params.currency || 'USD',
        num_items: params.numItems,
      },
    }

    return this.sendEvent(event)
  }

  /**
   * Track Purchase event
   */
  async trackPurchase(params: {
    orderId: string
    contents: Array<{ id: string; quantity: number; item_price: number }>
    value: number
    numItems: number
    currency?: string
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    url?: string
    clientIp?: string
    userAgent?: string
    fbp?: string
    fbc?: string
  }) {
    const event: ServerEvent = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.url,
      action_source: 'website',
      user_data: this.prepareUserData({
        email: params.email,
        phone: params.phone,
        firstName: params.firstName,
        lastName: params.lastName,
        city: params.city,
        state: params.state,
        zip: params.zip,
        country: params.country,
        clientIp: params.clientIp,
        userAgent: params.userAgent,
        fbp: params.fbp,
        fbc: params.fbc,
      }),
      custom_data: {
        content_ids: params.contents.map(c => c.id),
        contents: params.contents,
        value: params.value,
        currency: params.currency || 'USD',
        num_items: params.numItems,
      },
    }

    return this.sendEvent(event)
  }

  /**
   * Track Search event
   */
  async trackSearch(params: {
    searchString: string
    url?: string
    email?: string
    clientIp?: string
    userAgent?: string
    fbp?: string
    fbc?: string
  }) {
    const event: ServerEvent = {
      event_name: 'Search',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.url,
      action_source: 'website',
      user_data: this.prepareUserData({
        email: params.email,
        clientIp: params.clientIp,
        userAgent: params.userAgent,
        fbp: params.fbp,
        fbc: params.fbc,
      }),
      custom_data: {
        search_string: params.searchString,
      },
    }

    return this.sendEvent(event)
  }

  /**
   * Track AddToWishlist event
   */
  async trackAddToWishlist(params: {
    contentId: string
    contentName: string
    value?: number
    currency?: string
    url?: string
    email?: string
    clientIp?: string
    userAgent?: string
    fbp?: string
    fbc?: string
  }) {
    const event: ServerEvent = {
      event_name: 'AddToWishlist',
      event_time: Math.floor(Date.now() / 1000),
      event_source_url: params.url,
      action_source: 'website',
      user_data: this.prepareUserData({
        email: params.email,
        clientIp: params.clientIp,
        userAgent: params.userAgent,
        fbp: params.fbp,
        fbc: params.fbc,
      }),
      custom_data: {
        content_ids: [params.contentId],
        content_name: params.contentName,
        content_type: 'product',
        value: params.value,
        currency: params.currency || 'USD',
      },
    }

    return this.sendEvent(event)
  }
}

// Export singleton instance
export const fbConversionsAPI = new FacebookConversionsAPI()
