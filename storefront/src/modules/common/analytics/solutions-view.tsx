"use client"

import { useEffect } from "react"
import { sendEvent } from "./events"

export default function SolutionsView({ classe }: { classe?: string }) {
  useEffect(() => {
    sendEvent("solutions_page_viewed", { classe: classe || null })
  }, [classe])
  return null
}

