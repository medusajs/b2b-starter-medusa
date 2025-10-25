"use client"

import React, { useEffect } from "react"

export function PostHogScript() {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "http://localhost:8000"

    // Skip if no key or SSR
    if (!key || typeof window === "undefined") return

    // Skip if already loaded
    const existed = (window as any).posthog
    if (existed && existed.__loaded) return

    // Load PostHog script
    const script = document.createElement("script")
    script.src = "https://unpkg.com/posthog-js@1.96.1/dist/umd/posthog-js.umd.js"
    script.async = true
    script.onload = () => {
      try {
        const posthog = (window as any).posthog
        if (posthog && posthog.init) {
          posthog.init(key, {
            api_host: host,
            capture_pageview: true,
            persistence: "localStorage",
            loaded: (ph: any) => {
              ph.__loaded = true
            }
          })
        }
      } catch (error) {
        console.warn("PostHog initialization failed:", error)
      }
    }
    script.onerror = () => {
      console.warn("Failed to load PostHog script")
    }

    document.head.appendChild(script)

    return () => {
      try {
        if (script.parentNode) {
          script.parentNode.removeChild(script)
        }
      } catch { }
    }
  }, [])

  return null
}

export default PostHogScript

