"use client"

import { useEffect } from "react"
import { toast } from "sonner"

type ApiErrorPayload = {
  error?: unknown
  message?: unknown
  code?: string
  details?: unknown
}

const RECENT_TOASTS = new Map<string, number>()
const DEDUPE_WINDOW_MS = 2000

function isApiRequestUrl(url: string): boolean {
  try {
    const u = new URL(url, window.location.origin)
    return u.pathname.startsWith("/api/")
  } catch {
    return url.startsWith("/api/")
  }
}

function getSkipToastHeader(input: RequestInfo | URL, init?: RequestInit): boolean {
  const headerName = "x-skip-api-toast"

  try {
    if (init?.headers) {
      const h = new Headers(init.headers)
      if (h.get(headerName) === "1") return true
    }

    if (typeof input !== "string" && !(input instanceof URL) && input instanceof Request) {
      if (input.headers.get(headerName) === "1") return true
    }
  } catch {
    // ignore
  }

  return false
}

function safeString(value: unknown): string | undefined {
  if (typeof value === "string") return value
  if (value == null) return undefined
  try {
    return JSON.stringify(value)
  } catch {
    return String(value)
  }
}

function buildToastFromError(
  status: number,
  payload: ApiErrorPayload | null,
  fallbackText?: string
): { kind: "error" | "warning"; title: string; description?: string } {
  const message =
    (payload?.error && safeString(payload.error)) ||
    (payload?.message && safeString(payload.message)) ||
    fallbackText ||
    undefined

  const code = payload?.code
  const details = payload?.details

  const descriptionParts: string[] = []
  if (message) descriptionParts.push(message)
  if (code) descriptionParts.push(`Code: ${code}`)
  if (details != null) descriptionParts.push(`Details: ${safeString(details)}`)

  const description = descriptionParts.join("\n") || undefined

  let title = "Request failed"
  if (status === 400) title = "Bad request"
  else if (status === 401) title = "Unauthorized"
  else if (status === 403) title = "Forbidden"
  else if (status === 404) title = "Not found"
  else if (status === 409) title = "Conflict"
  else if (status >= 500) title = "Server error"

  const kind: "error" | "warning" = status >= 500 ? "error" : "warning"

  return { kind, title, description }
}

function dedupeKey(method: string, url: string, status: number, description?: string) {
  return `${method.toUpperCase()} ${url} ${status} ${description || ""}`
}

export function ApiFetchInterceptor() {
  useEffect(() => {
    const originalFetch = window.fetch

    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const method =
        init?.method ||
        (typeof input !== "string" && !(input instanceof URL) && input instanceof Request ? input.method : "GET")

      const url =
        typeof input === "string" || input instanceof URL
          ? input.toString()
          : input instanceof Request
            ? input.url
            : String(input)

      const isApi = isApiRequestUrl(url)
      const skipToast = isApi ? getSkipToastHeader(input, init) : false

      try {
        const res = await originalFetch(input, init)

        if (!isApi || skipToast || res.ok) return res

        const cloned = res.clone()
        let payload: ApiErrorPayload | null = null
        let fallbackText: string | undefined

        try {
          payload = (await cloned.json()) as ApiErrorPayload
        } catch {
          try {
            fallbackText = await cloned.text()
          } catch {
            // ignore
          }
        }

        const toastData = buildToastFromError(res.status, payload, fallbackText || res.statusText)

        const key = dedupeKey(method, url, res.status, toastData.description)
        const now = Date.now()
        const last = RECENT_TOASTS.get(key)
        if (!last || now - last > DEDUPE_WINDOW_MS) {
          RECENT_TOASTS.set(key, now)
          if (toastData.kind === "error") toast.error(toastData.title, { description: toastData.description })
          else toast.warning(toastData.title, { description: toastData.description })
        }

        return res
      } catch (err: any) {
        if (isApi && !skipToast) {
          const description = err?.message || "Network error"
          const key = dedupeKey(method, url, 0, description)
          const now = Date.now()
          const last = RECENT_TOASTS.get(key)
          if (!last || now - last > DEDUPE_WINDOW_MS) {
            RECENT_TOASTS.set(key, now)
            toast.error("Network error", { description })
          }
        }
        throw err
      }
    }

    return () => {
      window.fetch = originalFetch
    }
  }, [])

  return null
}
