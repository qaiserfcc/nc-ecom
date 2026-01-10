"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"

export default function ContactQuoteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.error("Missing info", { description: "Name, email, and message are required." })
      return
    }

    setIsSubmitting(true)
    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-skip-api-toast": "1" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          message: message.trim(),
        }),
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        const msg = json?.error || "Failed to submit"
        toast.error("Quote not sent", {
          description: typeof msg === "string" ? msg : "Failed to submit",
        })
        return
      }

      toast.success("Quote submitted", { description: "We received your request." })
      setName("")
      setEmail("")
      setPhone("")
      setMessage("")
    } catch (err: any) {
      toast.error("Quote not sent", { description: err?.message || "Network error" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="quote-name">Name</Label>
          <Input id="quote-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quote-email">Email</Label>
          <Input
            id="quote-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote-phone">Phone (optional)</Label>
        <Input id="quote-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+92..." />
      </div>

      <div className="space-y-2">
        <Label htmlFor="quote-message">Message</Label>
        <Textarea
          id="quote-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What would you like a quote for?"
          rows={5}
        />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Sending..." : "Submit Quote"}
      </Button>
    </form>
  )
}
