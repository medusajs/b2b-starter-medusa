"use client"

export function sendEvent(name: string, payload?: any) {
  try {
    if (typeof window !== "undefined") {
      ;(window as any).dataLayer = (window as any).dataLayer || []
      ;(window as any).dataLayer.push({ event: name, payload })
    }
    const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL as string
    if (backend && typeof navigator !== "undefined" && (navigator as any).sendBeacon) {
      const blob = new Blob([JSON.stringify({ name, payload })], { type: "application/json" })
      ;(navigator as any).sendBeacon(`${backend}/store/events`, blob)
    }
  } catch {}
}

