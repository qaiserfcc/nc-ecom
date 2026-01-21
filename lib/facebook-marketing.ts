import axios, { AxiosInstance } from "axios"

interface FacebookAccessToken {
  access_token: string
  token_type: string
  expires_in: number
}

interface FacebookAccount {
  id: string
  name: string
  email: string
}

interface FacebookPage {
  id: string
  name: string
  category?: string
  access_token?: string
}

interface FacebookCampaign {
  id: string
  name: string
  objective: string
  status: string
  budget?: {
    amount: number
    type: string
  }
  created_time: string
  insights?: {
    impressions: number
    clicks: number
    spend: number
  }
}

interface FacebookLeadForm {
  id: string
  name: string
  status: string
  questions?: Array<{
    key: string
    label: string
    type: string
  }>
}

interface FacebookLead {
  id: string
  created_time: string
  field_data: Array<{
    name: string
    values: string[]
  }>
}

interface FacebookPixelEvent {
  event_id: string
  event_name: string
  event_time: number
  action_source: string
  user_data?: {
    em?: string // hashed email
    ph?: string // hashed phone
    fn?: string // hashed first name
    ln?: string // hashed last name
    ct?: string // hashed city
    st?: string // hashed state
    zp?: string // hashed zip
    country?: string
  }
  custom_data?: {
    value?: number
    currency?: string
    content_name?: string
    content_type?: string
    content_ids?: string[]
    num_items?: number
  }
}

interface FacebookCatalogProduct {
  id: string
  retailer_id: string
  title: string
  description?: string
  price: number
  currency: string
  image_url?: string
  url?: string
  availability?: string
}

export class FacebookMarketingService {
  private client: AxiosInstance
  private accessToken: string
  private apiVersion = "v19.0"

  constructor(accessToken: string) {
    this.accessToken = accessToken
    this.client = axios.create({
      baseURL: `https://graph.facebook.com/${this.apiVersion}`,
      params: {
        access_token: accessToken,
      },
    })
  }

  /**
   * Get Facebook Business Accounts
   */
  async getBusinessAccounts(): Promise<FacebookAccount[]> {
    try {
      // Try to get current user info - this endpoint is more compatible
      const meResponse = await this.client.get("/me", {
        params: {
          fields: "id,name,email",
        },
      })

      const meData = meResponse.data

      // Try to get businesses - may fail if token doesn't support it
      try {
        const businessResponse = await this.client.get("/me/businesses", {
          params: {
            fields: "id,name,timezone,currency",
          },
        })

        if (businessResponse.data.data && businessResponse.data.data.length > 0) {
          return businessResponse.data.data
        }
      } catch (businessError) {
        console.log("Could not fetch /me/businesses, using fallback")
      }

      // Return current user as fallback - this will work with most tokens
      return [
        {
          id: meData.id,
          name: meData.name || "My Business",
          email: meData.email || "",
        },
      ]
    } catch (error) {
      console.error("Error fetching business accounts:", error)
      throw error
    }
  }

  /**
   * Get Ad Accounts for a Business
   */
  async getAdAccounts(businessId: string): Promise<any[]> {
    try {
      const response = await this.client.get(`/${businessId}/adaccounts`, {
        params: {
          fields: "id,name,account_status,timezone,currency,business_name",
        },
      })
      return response.data.data || []
    } catch (error) {
      console.error("Error fetching ad accounts:", error)
      // Return empty array on error instead of throwing
      return []
    }
  }

  /**
   * Get Pages for a Business
   */
  async getPages(businessId: string): Promise<FacebookPage[]> {
    try {
      const response = await this.client.get(`/${businessId}/owned_pages`, {
        params: {
          fields: "id,name,category,access_token",
        },
      })
      return response.data.data || []
    } catch (error) {
      console.error("Error fetching pages:", error)
      // Try alternate endpoint /me/accounts which works with user tokens
      try {
        const meAccountsResponse = await this.client.get("/me/accounts", {
          params: {
            fields: "id,name,category,access_token",
          },
        })
        return meAccountsResponse.data.data || []
      } catch (altError) {
        console.error("Error fetching pages from alternate endpoint:", altError)
        return []
      }
    }
  }

  /**
   * Get Page Details
   */
  async getPageDetails(pageId: string): Promise<any> {
    try {
      const response = await this.client.get(`/${pageId}`, {
        params: {
          fields:
            "id,name,category,picture,followers_count,likes,website,phone,email,about,description,founded,mission,products,genre,general_info,hours,influences,inspirational_people,interests,link,name,personal_interests,personal_website,restaurant_services,restaurant_specialties,username,website",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching page details:", error)
      throw error
    }
  }

  /**
   * Get Campaigns for an Ad Account
   */
  async getCampaigns(
    adAccountId: string,
    options: { status?: string[]; limit?: number } = {}
  ): Promise<FacebookCampaign[]> {
    try {
      const params: any = {
        fields:
          "id,name,objective,status,budget,created_time,updated_time,daily_budget,lifetime_budget",
        limit: options.limit || 100,
      }

      if (options.status?.length) {
        params.effective_status = options.status
      }

      const response = await this.client.get(`/${adAccountId}/campaigns`, {
        params,
      })

      // Fetch insights for each campaign
      const campaignsWithInsights = await Promise.all(
        (response.data.data || []).map(async (campaign: any) => {
          try {
            const insights = await this.getCampaignInsights(campaign.id)
            return { ...campaign, insights }
          } catch (insightError) {
            console.log("Could not fetch insights for campaign:", campaign.id)
            return campaign
          }
        })
      )

      return campaignsWithInsights
    } catch (error) {
      console.error("Error fetching campaigns:", error)
      return []
    }
  }

  /**
   * Get Campaign Insights
   */
  async getCampaignInsights(campaignId: string): Promise<any> {
    try {
      const response = await this.client.get(`/${campaignId}/insights`, {
        params: {
          fields: "impressions,clicks,spend,actions,action_values",
          date_preset: "last_30d",
        },
      })

      if (response.data.data.length > 0) {
        return response.data.data[0]
      }
      return null
    } catch (error) {
      console.error("Error fetching campaign insights:", error)
      return null
    }
  }

  /**
   * Create a Campaign
   */
  async createCampaign(
    adAccountId: string,
    data: {
      name: string
      objective: string
      status?: string
    }
  ): Promise<any> {
    try {
      const response = await this.client.post(
        `/${adAccountId}/campaigns`,
        {
          name: data.name,
          objective: data.objective,
          status: data.status || "PAUSED",
        }
      )
      return response.data
    } catch (error) {
      console.error("Error creating campaign:", error)
      throw error
    }
  }

  /**
   * Get Lead Forms for a Page
   */
  async getLeadForms(pageId: string): Promise<FacebookLeadForm[]> {
    try {
      const response = await this.client.get(`/${pageId}/leadgen_forms`, {
        params: {
          fields: "id,name,status,created_time,updated_time,questions",
        },
      })
      return response.data.data || []
    } catch (error) {
      console.error("Error fetching lead forms:", error)
      return []
    }
  }

  /**
   * Get Leads from a Form
   */
  async getFormLeads(
    formId: string,
    options: { limit?: number } = {}
  ): Promise<FacebookLead[]> {
    try {
      const response = await this.client.get(`/${formId}/leads`, {
        params: {
          fields: "id,created_time,field_data,ad_id,ad_name,adset_id,adset_name,campaign_id,campaign_name",
          limit: options.limit || 100,
        },
      })
      return response.data.data || []
    } catch (error) {
      console.error("Error fetching form leads:", error)
      return []
    }
  }

  /**
   * Get Page Posts
   */
  async getPagePosts(pageId: string, options: { limit?: number } = {}): Promise<any[]> {
    try {
      const response = await this.client.get(`/${pageId}/posts`, {
        params: {
          fields:
            "id,message,created_time,type,link,picture,full_picture,story,permalink_url,status_type",
          limit: options.limit || 50,
        },
      })
      return response.data.data || []
    } catch (error) {
      console.error("Error fetching page posts:", error)
      return []
    }
  }

  /**
   * Get Post Insights
   */
  async getPostInsights(postId: string): Promise<any> {
    try {
      const response = await this.client.get(`/${postId}/insights`, {
        params: {
          fields: "impressions,engaged_users,post_engaged_users,post_clicks,post_negative_feedback,post_impressions_organic",
        },
      })

      if (response.data.data.length > 0) {
        const metrics: any = {}
        response.data.data.forEach((metric: any) => {
          metrics[metric.name] = metric.values[0]?.value || 0
        })
        return metrics
      }
      return null
    } catch (error) {
      console.error("Error fetching post insights:", error)
      return null
    }
  }

  /**
   * Create a Post on Page
   */
  async createPost(
    pageId: string,
    data: {
      message?: string
      link?: string
      picture?: string
    }
  ): Promise<any> {
    try {
      const response = await this.client.post(`/${pageId}/feed`, data)
      return response.data
    } catch (error) {
      console.error("Error creating post:", error)
      throw error
    }
  }

  /**
   * Send Pixel Event (Conversion API)
   */
  async sendPixelEvent(pixelId: string, event: FacebookPixelEvent): Promise<any> {
    try {
      const response = await this.client.post(`/${pixelId}/events`, {
        data: [event],
        test_event_code: process.env.NODE_ENV === "development" ? "TEST12345" : undefined,
      })
      return response.data
    } catch (error) {
      console.error("Error sending pixel event:", error)
      throw error
    }
  }

  /**
   * Create a Catalog
   */
  async createCatalog(
    businessId: string,
    data: {
      name: string
      catalog_type: string
    }
  ): Promise<any> {
    try {
      const response = await this.client.post(
        `/${businessId}/catalogs`,
        {
          name: data.name,
          catalog_type: data.catalog_type,
        }
      )
      return response.data
    } catch (error) {
      console.error("Error creating catalog:", error)
      throw error
    }
  }

  /**
   * Add Product to Catalog
   */
  async addProductToCatalog(
    catalogId: string,
    product: FacebookCatalogProduct
  ): Promise<any> {
    try {
      const response = await this.client.post(
        `/${catalogId}/product_sets`,
        {
          retailer_id: product.retailer_id,
          title: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          image_url: product.image_url,
          url: product.url,
          availability: product.availability,
        }
      )
      return response.data
    } catch (error) {
      console.error("Error adding product to catalog:", error)
      throw error
    }
  }

  /**
   * Get Page Messages/Conversations
   */
  async getPageMessages(pageId: string, options: { limit?: number } = {}): Promise<any[]> {
    try {
      const response = await this.client.get(`/${pageId}/conversations`, {
        params: {
          fields: "id,participants,senders,wallpaper,former_participants,email,updated_time,message_count,can_reply,former_participants,link,wallpaper",
          limit: options.limit || 50,
        },
      })
      return response.data.data
    } catch (error) {
      console.error("Error fetching page messages:", error)
      throw error
    }
  }

  /**
   * Send Page Message
   */
  async sendPageMessage(
    recipientId: string,
    message: {
      text?: string
      attachment?: {
        type: string
        url: string
      }
    }
  ): Promise<any> {
    try {
      const response = await this.client.post(`/me/messages`, {
        recipient: { id: recipientId },
        messaging_type: "RESPONSE",
        message,
      })
      return response.data
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  /**
   * Get Audience Insights
   */
  async getAudienceInsights(
    adAccountId: string,
    params: {
      targeting_spec: any
      metrics: string[]
    }
  ): Promise<any> {
    try {
      const response = await this.client.get(`/${adAccountId}/delivery_estimate`, {
        params: {
          targeting_spec: JSON.stringify(params.targeting_spec),
          optimization_goal: "REACH",
          currency: "USD",
        },
      })
      return response.data
    } catch (error) {
      console.error("Error fetching audience insights:", error)
      throw error
    }
  }
}

export function getFacebookMarketingClient(accessToken?: string): FacebookMarketingService {
  const token = accessToken || process.env.META_ACCESS_TOKEN
  if (!token) {
    throw new Error("Facebook access token not found in environment variables")
  }
  return new FacebookMarketingService(token)
}
