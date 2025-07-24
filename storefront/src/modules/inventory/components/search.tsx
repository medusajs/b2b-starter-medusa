"use client"

import { Input } from "@medusajs/ui"
import debounce from "lodash/debounce"
import { useCallback } from "react"

export function SearchProducts({
  onSearch,
}: {
  onSearch: (term: string) => void
}) {
  const debouncedSearch = useCallback(
    debounce((term: string) => {
      onSearch(term)
    }, 500),
    [onSearch]
  )

  return (
    <Input
      type="search"
      placeholder="Search products..."
      onChange={(e) => debouncedSearch(e.target.value)}
    />
  )
}
