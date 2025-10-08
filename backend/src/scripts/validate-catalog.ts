import * as fs from 'fs'
import * as path from 'path'

type Item = { id?: string; sku?: string; category?: string; price?: any; price_brl?: number; processed_images?: any; image?: string }

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
  }

  const byId: Record<string, number> = {}
  for (const it of all) {
    const id = (it.id || '').toString()
    if (!id) issues.missing_id.push(JSON.stringify(it).slice(0, 120))
    else byId[id] = (byId[id] || 0) + 1

    const price = typeof it.price_brl === 'number' ? it.price_brl : (typeof it.price === 'number' ? it.price : undefined)
    if (price === undefined) issues.price_missing.push(id)
    else if (isNaN(Number(price)) || Number(price) < 0) issues.invalid_price.push(id)
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

