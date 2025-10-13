"use client"

import React, { createContext, useContext, useMemo } from "react"

export type CatalogItemBase = {
  id: string
  name: string
  manufacturer?: string
  distributor?: string
  tier_recommendation?: string[]
}

export type CatalogCTA = {
  label: string
  href?: string
  onClick?: (item: CatalogItemBase) => void
  variant?: "primary" | "secondary" | "ghost"
}

export type CatalogCustomization = {
  // Extra badges to render on the card header (e.g., "Híbrido", "On‑Grid")
  extraBadges?: (item: CatalogItemBase) => string[]
  // Map manufacturer/distributor to a small logo URL
  logoFor?: (brand?: string) => string | undefined
  // Primary and Secondary CTAs
  primaryCta?: (item: CatalogItemBase) => CatalogCTA | undefined
  secondaryCta?: (item: CatalogItemBase) => CatalogCTA | undefined
  // Key/value specs to highlight beneath title
  highlightSpecs?: (item: Record<string, any>) => Array<{ label: string; value: string }>
}

const defaultCustomization: CatalogCustomization = {}

const CatalogCustomizationContext = createContext<CatalogCustomization>(defaultCustomization)

export const useCatalogCustomization = () => useContext(CatalogCustomizationContext)

export const CatalogCustomizationProvider = ({
  value,
  children,
}: {
  value?: CatalogCustomization
  children: React.ReactNode
}) => {
  const merged = useMemo(() => ({ ...defaultCustomization, ...(value || {}) }), [value])
  return (
    <CatalogCustomizationContext.Provider value={merged}>
      {children}
    </CatalogCustomizationContext.Provider>
  )
}

