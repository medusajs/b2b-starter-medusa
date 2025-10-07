"use client"

export function sendEvent(name: string, payload?: any) {
  try {
    if (typeof window !== "undefined") {
      ; (window as any).dataLayer = (window as any).dataLayer || []
        ; (window as any).dataLayer.push({ event: name, payload })
    }
    const backend = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL as string
    if (backend && typeof navigator !== "undefined" && (navigator as any).sendBeacon) {
      const blob = new Blob([JSON.stringify({ name, payload })], { type: "application/json" })
        ; (navigator as any).sendBeacon(`${backend}/store/events`, blob)
    }
  } catch { }
}

// YSH-specific events
export const trackQuoteRequested = (payload: { company_id?: string; items: any[]; est_value: number; group_id?: string }) => {
  sendEvent("quote_requested", payload)
}

export const trackQuoteApproved = (payload: { approver_id: string; quote_id: string; policy: string }) => {
  sendEvent("quote_approved", payload)
}

export const trackCompanyInviteSent = (payload: { company_id: string; email: string; role: string }) => {
  sendEvent("company_invite_sent", payload)
}

export const trackBulkAddCompleted = (payload: { skus: string[]; count: number; list_id?: string }) => {
  sendEvent("bulk_add_completed", payload)
}

export const trackPriceListApplied = (payload: { price_list_id: string; group_id: string; channel: string }) => {
  sendEvent("price_list_applied", payload)
}

export const trackCheckoutStepViewed = (payload: { step_name: string }) => {
  sendEvent("checkout_step_viewed", payload)
}

export const trackPaymentSelected = (payload: { method: string }) => {
  sendEvent("payment_selected", payload)
}

export const trackOrderPlaced = (payload: { order_id: string; value: number; channel: string }) => {
  sendEvent("order_placed", payload)
}

export const trackVideoPlayed = (payload: { video_id: string; classe: string; title: string }) => {
  sendEvent("video_played", payload)
}

export const trackVideoClosed = (payload: { video_id: string; classe: string }) => {
  sendEvent("video_closed", payload)
}

