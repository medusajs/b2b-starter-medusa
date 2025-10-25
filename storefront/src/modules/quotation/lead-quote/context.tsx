"use client"

import React, { createContext, useContext, useEffect, useMemo, useState } from "react"
import { toast } from "@medusajs/ui"

export type LeadItem = {
  id: string
  category?: string
  name: string
  manufacturer?: string
  image_url?: string
  price_brl?: number
}

type LeadQuoteState = {
  items: LeadItem[]
  add: (item: LeadItem) => void
  remove: (id: string) => void
  clear: () => void
}

const LeadQuoteContext = createContext<LeadQuoteState | null>(null)

const STORAGE_KEY = "ysh_lead_quote_items"

export const LeadQuoteProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<LeadItem[]>([])

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {}
  }, [items])

  const add = (item: LeadItem) => {
    setItems((prev) => {
      if (prev.find((i) => i.id === item.id)) {
        toast.info("Item já na lista de cotação")
        return prev
      }
      toast.success("Adicionado à lista de cotação")
      return [...prev, item]
    })
  }

  const remove = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const clear = () => setItems([])

  const value = useMemo(() => ({ items, add, remove, clear }), [items])
  return <LeadQuoteContext.Provider value={value}>{children}</LeadQuoteContext.Provider>
}

export const useLeadQuote = () => {
  const ctx = useContext(LeadQuoteContext)
  if (!ctx) throw new Error("useLeadQuote deve ser usado dentro de LeadQuoteProvider")
  return ctx
}

