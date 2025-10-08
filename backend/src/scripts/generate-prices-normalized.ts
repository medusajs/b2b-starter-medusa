import * as fs from 'fs'
import * as path from 'path'

type CatalogItem = {
  id?: string
  name?: string
  manufacturer?: string
  category?: string
  price?: any
  price_brl?: number
  pricing?: { price?: number; price_brl?: number; currency?: string }
  [k: string]: any
}

const parsePrice = (p: any): number | undefined => {
  if (typeof p === 'number') return p
  if (typeof p === 'string') {
    const cleaned = p.replace(/[^0-9.,]/g, '')
    let normalized = cleaned
    if (cleaned.includes('.') && cleaned.includes(',')) normalized = cleaned.replace(/\./g, '').replace(',', '.')
    else if (cleaned.includes(',')) normalized = cleaned.replace(',', '.')
    const v = parseFloat(normalized)
    return isNaN(v) ? undefined : v
  }
  return undefined
}

const fmtBRL = (n: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

const loadArray = (p: string): any[] => {
  if (!fs.existsSync(p)) return []
  try {
    const raw = fs.readFileSync(p, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function normalizeItem(it: CatalogItem): CatalogItem {
  const numeric = (typeof it.price_brl === 'number')
    ? it.price_brl
    : (typeof it.pricing?.price_brl === 'number')
      ? it.pricing!.price_brl!
      : (typeof it.pricing?.price === 'number')
        ? it.pricing!.price!
        : parsePrice(it.price)

  const out: CatalogItem = { ...it }
  if (typeof numeric === 'number' && !isNaN(numeric) && numeric >= 0) {
    const rounded = Math.round(numeric * 100) / 100
    out.price_brl = rounded
    out.pricing = { ...(it.pricing || {}), price: rounded, price_brl: rounded, currency: 'BRL' }
    out.price = fmtBRL(rounded)
  } else {
    // still ensure currency when pricing exists
    if (out.pricing) {
      out.pricing.currency = 'BRL'
    }
  }
  return out
}

async function main() {
  const catalogRoot = process.env.CATALOG_PATH || path.join(__dirname, '../data/catalog')
  const unified = path.join(catalogRoot, 'unified_schemas')

  const files: Array<{ c: string; f: string }> = [
    { c: 'kits', f: 'kits_unified.json' },
    { c: 'inverters', f: 'inverters_unified.json' },
    { c: 'panels', f: 'panels_unified.json' },
  ]

  let total = 0
  let normalized = 0

  for (const { f } of files) {
    const src = path.join(unified, f)
    if (!fs.existsSync(src)) continue
    const arr = loadArray(src)
    const outArr = arr.map((x) => {
      const before = JSON.stringify({ price: x.price, price_brl: x.price_brl, pricing: x.pricing })
      const nx = normalizeItem(x)
      const after = JSON.stringify({ price: nx.price, price_brl: nx.price_brl, pricing: nx.pricing })
      if (before !== after) normalized++
      total++
      return nx
    })
    const dst = path.join(unified, f.replace('.json', '_normalized.json'))
    fs.writeFileSync(dst, JSON.stringify(outArr, null, 2), 'utf-8')
  }

  console.log(`Normalized ${normalized}/${total} items. Output: *_normalized.json in ${unified}`)
}

main().catch((e) => {
  console.error('Failed to normalize prices', e)
  process.exit(1)
})

