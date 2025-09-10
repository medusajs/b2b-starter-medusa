"use client"

import { useEffect } from "react"

export default function HydrationScript() {
  useEffect(() => {
    // Ensure consistent body styles to prevent hydration mismatches
    const ensureConsistentBodyStyles = () => {
      const body = document.body
      if (body) {
        // Set consistent styles that might be added by external factors
        body.style.overscrollBehaviorX = 'auto'
        body.style.overscrollBehaviorY = 'auto'
        
        // Remove any conflicting styles that might cause hydration issues
        const computedStyle = window.getComputedStyle(body)
        if (computedStyle.overscrollBehaviorX !== 'auto') {
          body.style.overscrollBehaviorX = 'auto'
        }
      }
    }

    // Run immediately
    ensureConsistentBodyStyles()

    // Run after a short delay to catch any late-applied styles
    const timeoutId = setTimeout(ensureConsistentBodyStyles, 100)

    // Cleanup
    return () => clearTimeout(timeoutId)
  }, [])

  return null
}
