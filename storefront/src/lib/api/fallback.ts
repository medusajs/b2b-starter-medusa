/**
 * API Fallback System (High-performance)
 * - Prefers *_unified_normalized.json for BRL-consistent prices
 * - Loads sku_registry.json for canonical SKUs
 * - Uses React cache() to memoize FS reads
 */

import { cache } from 'react'
import path from 'path'
import fs from 'fs/promises'

export type FallbackProduct = {
  id: string
  title: string
  handle: string
  description: string
  thumbnail: string | null
  category: string
  manufacturer: string
  sku: string
  price: number
  currency: string
  availability: boolean
  stock: number
  metadata: Record<string, any>
  specifications: Record<string, any>
}

export type BackendStatus = {
  online: boolean
  lastCheck: Date
  errorCount: number
  lastError?: string
}

const CATALOG_PATH = process.env.CATALOG_PATH ||
  path.join(process.cwd(), '../../../ysh-erp/data/catalog/unified_schemas')

const IMAGE_MAP_PATH = process.env.IMAGE_MAP_PATH ||
  path.join(process.cwd(), '../../../ysh-erp/data/catalog/images/IMAGE_MAP.json')

const BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'
const HEALTH_CHECK_ENDPOINT = '/health'
const HEALTH_CHECK_TIMEOUT = 5000
const HEALTH_CHECK_INTERVAL = 30000
const MAX_ERROR_COUNT = 3

let backendStatus: BackendStatus = { online: true, lastCheck: new Date(), errorCount: 0 }

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), HEALTH_CHECK_TIMEOUT)
    const response = await fetch(`${BACKEND_URL}${HEALTH_CHECK_ENDPOINT}`, { method: 'GET', signal: controller.signal, cache: 'no-store' })
    clearTimeout(timeout)
    const isOnline = response.ok
    backendStatus = { online: isOnline, lastCheck: new Date(), errorCount: isOnline ? 0 : backendStatus.errorCount + 1 }
    return isOnline
  } catch (e: any) {
    backendStatus = { online: false, lastCheck: new Date(), errorCount: backendStatus.errorCount + 1, lastError: e?.message }
    return false
  }
}

export function getBackendStatus(): BackendStatus { return backendStatus }

export function shouldUseFallback(): boolean {
  const elapsed = Date.now() - backendStatus.lastCheck.getTime()
  if (elapsed > HEALTH_CHECK_INTERVAL) return true
  if (backendStatus.errorCount >= MAX_ERROR_COUNT) return true
  return !backendStatus.online
}

type SkuRegistry = { map?: Record<string, string>; items?: Array<{ category: string; id: string; sku: string }> }

const loadSkuRegistry = cache(async (): Promise<Record<string, string>> => {
  try {
    const registryPath = path.join(CATALOG_PATH, 'sku_registry.json')
    const raw = await fs.readFile(registryPath, 'utf-8')
    const parsed: SkuRegistry = JSON.parse(raw)
    if (parsed?.map) return parsed.map
    if (Array.isArray(parsed?.items)) {
      const m: Record<string, string> = {}
      for (const it of parsed.items) if (it?.category && it?.id && it?.sku) m[`${it.category}:${it.id}`] = it.sku
      return m
    }
    return {}
  } catch { return {} }
})

const loadImageMap = cache(async (): Promise<Record<string, string>> => {
  try { const raw = await fs.readFile(IMAGE_MAP_PATH, 'utf-8'); return JSON.parse(raw) } catch { return {} }
})

const loadCatalogCategory = cache(async (category: string): Promise<any[]> => {
  const map: Record<string, string> = {
    'inversores':'inverters','inverters':'inverters',
    'paineis':'panels','panels':'panels',
    'baterias':'batteries','batteries':'batteries',
    'kits':'kits','estruturas':'structures','structures':'structures',
    'cabos':'cables','cables':'cables','acessorios':'accessories','accessories':'accessories'
  }
  const cat = map[category.toLowerCase()] || category
  const normalized = path.join(CATALOG_PATH, `${cat}_unified_normalized.json`)
  const fallback = path.join(CATALOG_PATH, `${cat}_unified.json`)
  let chosen = fallback
  try { await fs.stat(normalized); chosen = normalized } catch {}
  try {
    const raw = await fs.readFile(chosen, 'utf-8')
    const data = JSON.parse(raw)
    const registry = await loadSkuRegistry()
    const arr: any[] = Array.isArray(data) ? data : []
    return arr.map((it) => {
      const id = String(it?.id ?? '')
      const key = `${cat}:${id}`
      const sku = String(it?.sku || registry[key] || id)
      return { ...it, sku, category: it?.category || cat }
    })
  } catch { return [] }
})

function parseNumberFromPriceString(p?: string): number | undefined {
  if (!p) return undefined
  const cleaned = p.replace(/[^0-9.,]/g, '')
  let normalized = cleaned
  if (cleaned.includes('.') && cleaned.includes(',')) normalized = cleaned.replace(/\./g, '').replace(',', '.')
  else if (cleaned.includes(',')) normalized = cleaned.replace(',', '.')
  const v = parseFloat(normalized)
  return isNaN(v) ? undefined : v
}

function transformCatalogToProduct(item: any, imageMap: Record<string, string>): FallbackProduct {
  const sku = item.sku || item.id || ''
  const image = imageMap[sku] || item.image || null
  const numericPrice: number = (typeof item.price_brl === 'number')
    ? item.price_brl
    : (typeof item.pricing?.price_brl === 'number')
      ? item.pricing.price_brl
      : (typeof item.pricing?.price === 'number')
        ? item.pricing.price
        : (typeof item.price === 'number')
          ? item.price
          : (parseNumberFromPriceString(item.price) || 0)
  const price = numericPrice
  return {
    id: sku,
    title: item.name || item.title || 'Produto Solar',
    handle: sku.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    description: item.description || item.metadata?.description || '',
    thumbnail: image,
    category: item.category || '',
    manufacturer: item.manufacturer || item.brand || '',
    sku,
    price,
    currency: 'BRL',
    availability: item.availability !== false && item.availability !== 'unavailable',
    stock: item.stock || (item.availability ? 10 : 0),
    metadata: { ...(item.metadata || {}), price_formatted: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price) },
    specifications: item.specifications || item.specs || {}
  }
}

export const FallbackAPI = {
  listProducts: cache(async (options?: { category?: string; limit?: number; offset?: number; search?: string }) => {
    const { category, limit = 12, offset = 0, search } = options || {}
    let all: any[] = []
    if (category) all = await loadCatalogCategory(category)
    else {
      const cats = ['inverters','panels','batteries','kits','structures','cables','accessories']
      const res = await Promise.all(cats.map((c) => loadCatalogCategory(c)))
      all = res.flat()
    }
    const imageMap = await loadImageMap()
    let filtered = all
    if (search) {
      const s = search.toLowerCase()
      filtered = all.filter((it) => String(it.name || it.title || '').toLowerCase().includes(s)
        || String(it.sku || '').toLowerCase().includes(s)
        || String(it.manufacturer || it.brand || '').toLowerCase().includes(s))
    }
    const slice = filtered.slice(offset, offset + limit)
    return { products: slice.map((it) => transformCatalogToProduct(it, imageMap)), count: filtered.length }
  }),

  getProduct: cache(async (id: string): Promise<FallbackProduct | null> => {
    const cats = ['inverters','panels','batteries','kits','structures','cables','accessories']
    const imageMap = await loadImageMap()
    for (const c of cats) {
      const arr = await loadCatalogCategory(c)
      const found = arr.find((it) => it.sku === id || it.id === id || String(it.name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-') === id)
      if (found) return transformCatalogToProduct(found, imageMap)
    }
    return null
  })
}

