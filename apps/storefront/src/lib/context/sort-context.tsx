"use client"

import { createContext, useContext, useState } from "react"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

interface SortContext {
  sortBy: SortOptions
  setSortBy: (sort: SortOptions) => void
}

const SortContext = createContext<SortContext | null>(null)

interface SortProviderProps {
  children?: React.ReactNode
}

export const SortProvider = ({ children }: SortProviderProps) => {
  const [sortBy, setSortBy] = useState<SortOptions>("created_at")

  return (
    <SortContext.Provider
      value={{
        sortBy,
        setSortBy,
      }}
    >
      {children}
    </SortContext.Provider>
  )
}

export const useSort = () => {
  const context = useContext(SortContext)
  if (context === null) {
    throw new Error("useSort must be used within a SortProvider")
  }
  return context
}
