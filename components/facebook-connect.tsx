"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Facebook, CheckCircle, XCircle, Loader2, Users, Calendar } from "lucide-react"
import { notify } from "@/lib/utils/notifications"

interface ConnectedPage {
  id: number
  platform: string
  account_name: string
  account_id: string
  followers_count: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function FacebookConnect() {
  const [loading, setLoading] = useState(false)
  const [pages, setPages] = useState<ConnectedPage[]>([])
  const [loadingPages, setLoadingPages] = useState(true)

  useEffect(() => {
    fetchConnectedPages()
    
    // Check for success/error from OAuth callback
    const params = new URLSearchParams(window.location.search)
    const success = params.get('success')
    const error = params.get('error')
    
    if (success) {
      notify.success(success)
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    if (error) {
      notify.error(error)
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const fetchConnectedPages = async () => {
    try {
      setLoadingPages(true)
      const response = await fetch('/api/auth/facebook/pages')
      const data = await response.json()
      
      if (data.success) {
        setPages(data.pages || [])
      }
    } catch (error) {
      console.error('Error fetching pages:', error)
    } finally {
      setLoadingPages(false)
    }
  }

  const handleConnectFacebook = () => {
    setLoading(true)
    // Redirect to Facebook OAuth login
    window.location.href = '/api/auth/facebook/login'
  }

  const handleDisconnect = async (accountId: string) => {
    try {
      const response = await fetch('/api/auth/facebook/pages', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId }),
      })

      const data = await response.json()
      
      if (data.success) {
        notify.success('Facebook Page disconnected')
        fetchConnectedPages()
      } else {
        notify.error(data.error || 'Failed to disconnect')
      }
    } catch (error) {
      notify.error('Error disconnecting page')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Facebook className="w-5 h-5 text-blue-600" />
                Facebook Page Connection
              </CardTitle>
              <CardDescription>
                Connect your Facebook Business Page to automatically post AI-generated content
              </CardDescription>
            </div>
            <Button
              onClick={handleConnectFacebook}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Facebook className="w-4 h-4 mr-2" />
                  Connect Facebook Page
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        {!loadingPages && pages.length > 0 && (
          <CardContent>
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-gray-700 mb-2">
                Connected Pages ({pages.length})
              </h3>
              
              {pages.map((page) => (
                <div
                  key={page.id}
                  className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <Facebook className="w-6 h-6 text-blue-600" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{page.account_name}</h4>
                        {page.is_active ? (
                          <Badge variant="default" className="bg-green-500">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            <XCircle className="w-3 h-3 mr-1" />
                            Inactive
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {page.followers_count.toLocaleString()} followers
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Connected {formatDate(page.created_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(page.account_id)}
                  >
                    Disconnect
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        )}

        {!loadingPages && pages.length === 0 && (
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Facebook className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-sm">No Facebook Pages connected yet</p>
              <p className="text-xs mt-1">Click the button above to get started</p>
            </div>
          </CardContent>
        )}

        {loadingPages && (
          <CardContent>
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
              <p className="text-sm text-gray-600 mt-2">Loading connected pages...</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600 w-6">1.</span>
              <p>Create a Facebook App at <a href="https://developers.facebook.com/" target="_blank" className="text-blue-600 underline">developers.facebook.com</a></p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600 w-6">2.</span>
              <p>Add Facebook Login product and configure OAuth redirect URI</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600 w-6">3.</span>
              <p>Set <code className="bg-gray-100 px-1 rounded">FACEBOOK_APP_ID</code> and <code className="bg-gray-100 px-1 rounded">FACEBOOK_APP_SECRET</code> in .env.local</p>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold text-blue-600 w-6">4.</span>
              <p>Click "Connect Facebook Page" and authorize the app</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm">
            <p className="font-semibold text-blue-900 mb-1">📚 Need detailed help?</p>
            <p className="text-blue-700">
              See <code>FACEBOOK_PAGE_SETUP_GUIDE.md</code> or <code>FACEBOOK_QUICK_START.md</code> for step-by-step instructions
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
