import * as fs from 'fs'
import * as path from 'path'

type Item = {
  id?: string
  sku?: string
  category?: string
  price?: any
  price_brl?: number
  processed_images?: any
  image?: string
  pricing?: { price?: number; price_brl?: number; currency?: string }
}

const load = (p: string): any[] => {
  if (!fs.existsSync(p)) return []
  try {
    const raw = fs.readFileSync(p, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const main = () => {
  const baseCatalogPath = process.env.CATALOG_PATH || path.join(__dirname, '../data/catalog')
  const unified = path.join(baseCatalogPath, 'unified_schemas')
  const cats = ['kits', 'inverters', 'panels']
  const files = cats.map((c) => ({ c, p: path.join(unified, `${c}_unified.json`) }))

  const all: Item[] = []
  for (const { c, p } of files) {
    const arr = load(p)
    for (const it of arr) all.push({ ...it, category: c })
  }

  const issues = {
    missing_id: [] as string[],
    duplicate_ids: [] as string[],
    price_missing: [] as string[],
    invalid_price: [] as string[],
    non_brl_currency: [] as string[],
    price_string_not_brl: [] as string[],
  }

  const byId: Record<string, number> = {}
  for (const it of all) {
    const id = (it.id || '').toString()
    if (!id) issues.missing_id.push(JSON.stringify(it).slice(0, 120))
    else byId[id] = (byId[id] || 0) + 1

    // numeric price detection
    const price = typeof it.price_brl === 'number'
      ? it.price_brl
      : (typeof (it.pricing?.price_brl) === 'number'
        ? (it.pricing?.price_brl as number)
        : (typeof (it.pricing?.price) === 'number'
          ? (it.pricing?.price as number)
          : (typeof it.price === 'number' ? (it.price as number) : undefined)))
    if (price === undefined) issues.price_missing.push(id)
    else if (isNaN(Number(price)) || Number(price) < 0) issues.invalid_price.push(id)

    // currency must be BRL when pricing provided
    if (it.pricing && it.pricing.currency && it.pricing.currency.toUpperCase() !== 'BRL') {
      issues.non_brl_currency.push(id)
    }

    // string price should be formatted as BRL: "R$ 1.234,56"
    if (typeof it.price === 'string' && it.price.trim().length > 0) {
      const ok = /^R\$\s?\d{1,3}(\.\d{3})*(,\d{2})$/.test(it.price.trim()) || /^R\$\s?\d+(,\d{2})$/.test(it.price.trim())
      if (!ok) issues.price_string_not_brl.push(id)
    }
  }

  for (const [id, n] of Object.entries(byId)) if (n > 1) issues.duplicate_ids.push(`${id} x${n}`)

  const summary = {
    total: all.length,
    byCategory: Object.fromEntries(cats.map((c) => [c, all.filter((x) => x.category === c).length])),
    issues,
  }
  console.log(JSON.stringify(summary, null, 2))
}

main()
