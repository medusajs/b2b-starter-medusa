"use client"

import React, { useEffect } from "react"

export function PostHogScript() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "http://localhost:8000"
    if (!key || typeof window === "undefined") return

    const existed = (window as any).posthog
    if (existed && existed.__loaded) return

    const script = document.createElement("script")
    script.src = "https://unpkg.com/posthog-js"
    script.async = true
    script.onload = () => {
      try {
        ;(window as any).posthog?.init(key, {
          api_host: host,
          capture_pageview: true,
          persistence: "localStorage",
        })
      } catch {}
    }
    document.body.appendChild(script)
    return () => {
      try {
        document.body.removeChild(script)
      } catch {}
    }
  }, [])
  return null
}

export default PostHogScript

