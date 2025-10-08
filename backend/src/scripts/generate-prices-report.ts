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
}

const isBRLString = (s: string) => {
  const t = s.trim()
  return /^R\$\s?\d{1,3}(\.\d{3})*(,\d{2})$/.test(t) || /^R\$\s?\d+(,\d{2})$/.test(t)
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

async function main() {
  const catalogRoot = process.env.CATALOG_PATH || path.join(__dirname, '../data/catalog')
  const unified = path.join(catalogRoot, 'unified_schemas')

  const files: Array<{ c: string; f: string }> = [
    { c: 'kits', f: 'kits_unified.json' },
    { c: 'inverters', f: 'inverters_unified.json' },
    { c: 'panels', f: 'panels_unified.json' },
  ]

  const problems: any[] = []
  let total = 0

  for (const { c, f } of files) {
    const arr: CatalogItem[] = loadArray(path.join(unified, f))
    for (const it of arr) {
      total++
      const id = (it.id || '').toString()
      const num = (typeof it.price_brl === 'number')
        ? it.price_brl
        : (typeof it.pricing?.price_brl === 'number')
          ? it.pricing!.price_brl!
          : (typeof it.pricing?.price === 'number')
            ? it.pricing!.price!
            : parsePrice(it.price)
      const s = typeof it.price === 'string' ? it.price : ''
      const hasStr = s.trim().length > 0
      const strOk = hasStr ? isBRLString(s) : true
      const currency = it.pricing?.currency
      const currOk = !currency || currency.toUpperCase() === 'BRL'

      if ((!strOk && num !== undefined) || !currOk) {
        problems.push({
          category: c,
          id,
          name: it.name || '',
          manufacturer: it.manufacturer || '',
          price_string: s || null,
          price_numeric: num ?? null,
          currency: currency || null,
          suggested_price_string: num !== undefined ? fmtBRL(num) : null,
          suggested_currency: 'BRL',
        })
      }
    }
  }

  const report = {
    generated_at: new Date().toISOString(),
    catalog_root: catalogRoot,
    total_items_scanned: total,
    items_with_issues: problems.length,
    issues: problems,
  }

  const outPath = path.join(unified, 'PRICES_NORMALIZED_REPORT.json')
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2), 'utf-8')
  console.log(`Price normalization report written: ${outPath} (issues: ${problems.length})`)
}

main().catch((e) => {
  console.error('Failed to generate prices report', e)
  process.exit(1)
})

