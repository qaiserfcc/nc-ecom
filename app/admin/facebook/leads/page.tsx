"use client"

import { useState, useEffect } from "react"
import { Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"

interface Lead {
  id: string
  created_time: string
  field_data: Array<{
    name: string
    values: string[]
  }>
}

interface LeadForm {
  id: string
  name: string
  status: string
  recent_leads: Lead[]
}

interface Page {
  id: string
  name: string
}

export default function LeadsPage() {
  const [pages, setPages] = useState<Page[]>([])
  const [leadForms, setLeadForms] = useState<LeadForm[]>([])
  const [selectedPage, setSelectedPage] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchPages()
  }, [])

  useEffect(() => {
    if (selectedPage) {
      fetchLeadForms(selectedPage)
    }
  }, [selectedPage])

  const fetchPages = async () => {
    try {
      const response = await fetch("/api/facebook/accounts")
      const data = await response.json()

      if (data.success && data.accounts.length > 0) {
        const firstAccountId = data.accounts[0].id
        const accountResponse = await fetch(`/api/facebook/accounts/${firstAccountId}`)
        const accountData = await accountResponse.json()

        if (accountData.success) {
          setPages(accountData.pages)
          if (accountData.pages.length > 0) {
            setSelectedPage(accountData.pages[0].id)
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch pages")
    } finally {
      setLoading(false)
    }
  }

  const fetchLeadForms = async (pageId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/facebook/leads/forms/${pageId}`)
      const data = await response.json()

      if (data.success) {
        setLeadForms(data.forms)
      } else {
        setError(data.error || "Failed to fetch lead forms")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const filteredForms = leadForms.filter((form) =>
    form.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Forms & Leads</h1>
        <p className="text-muted-foreground mt-2">
          Manage your Facebook lead forms and captured leads
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="">Select a page</option>
              {pages.map((page) => (
                <option key={page.id} value={page.id}>
                  {page.name}
                </option>
              ))}
            </select>

            <Button
              variant="outline"
              onClick={() => selectedPage && fetchLeadForms(selectedPage)}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <Input
            placeholder="Search lead forms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />

          {filteredForms.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>No Lead Forms Found</CardTitle>
                <CardDescription>
                  {searchQuery
                    ? "No forms match your search"
                    : "Create a lead form on your Facebook page"}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredForms.map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle>{form.name}</CardTitle>
                        <CardDescription>
                          {form.recent_leads?.length || 0} recent leads
                        </CardDescription>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          form.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {form.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {form.recent_leads && form.recent_leads.length > 0 ? (
                        form.recent_leads.map((lead) => (
                          <div
                            key={lead.id}
                            className="border rounded-lg p-3 bg-muted/50"
                          >
                            <p className="text-sm font-medium">
                              {new Date(lead.created_time).toLocaleString()}
                            </p>
                            <div className="text-sm text-muted-foreground space-y-1 mt-2">
                              {lead.field_data?.map((field, i) => (
                                <p key={i}>
                                  <strong>{field.name}:</strong>{" "}
                                  {field.values?.join(", ")}
                                </p>
                              ))}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No recent leads
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
