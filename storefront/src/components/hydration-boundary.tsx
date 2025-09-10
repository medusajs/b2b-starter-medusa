"use client"

import { useEffect, useState } from "react"

interface HydrationBoundaryProps {
  children: React.ReactNode
}

export default function HydrationBoundary({ children }: HydrationBoundaryProps) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    // Mark as hydrated after the first client-side render
    setIsHydrated(true)
  }, [])

  // During SSR and initial hydration, render children normally
  // After hydration, continue rendering normally
  return <>{children}</>
}

