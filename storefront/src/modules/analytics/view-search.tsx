"use client"

import { useEffect } from "react"
import { sendEvent } from "@/modules/analytics/events"

export default function ViewSearch({ params, total }: { params: { [k: string]: string }, total: number }) {
  useEffect(() => {
    sendEvent("view_search", { params, total })
  }, [JSON.stringify(params), total])
  return null
}

