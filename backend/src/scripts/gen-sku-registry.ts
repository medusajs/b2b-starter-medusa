import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'

type CatalogItem = {
  id?: string
  sku?: string
  name?: string
  manufacturer?: string
  model?: string
  potencia_kwp?: number
  kwp?: number
  price?: number | string
  price_brl?: number
}

type RegistryItem = { category: string; id: string; sku: string }

const toSlug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .toUpperCase()

const hash8 = (s: string) => crypto.createHash('sha1').update(s).digest('hex').slice(0, 8).toUpperCase()
const cleanSku = (s: string) => s.replace(/[^A-Z0-9\-]/g, '').slice(0, 64)

const stableSku = (item: CatalogItem, category: string): string => {
  if (item.sku && /[A-Za-z0-9]/.test(item.sku)) return cleanSku(String(item.sku).toUpperCase())
  const id = item.id?.toString() || ''
  if (id) return cleanSku(id.toUpperCase())
  const brand = (item.manufacturer || 'YSH').toString()
  const model = (item.model || item.name || '').toString()
  const power = (item.potencia_kwp || item.kwp || item.price_brl || item.price || '').toString()
  const base = `${category}-${brand}-${model}-${power}`
  const slug = toSlug(base)
  const h = hash8(base)
  return cleanSku(`${slug}-${h}`)
}

const loadJsonArray = (p: string): any[] => {
  if (!fs.existsSync(p)) return []
  try {
    const raw = fs.readFileSync(p, 'utf-8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const main = async () => {
  const baseCatalogPath = process.env.CATALOG_PATH || path.join(__dirname, '../data/catalog')
  const unifiedPath = path.join(baseCatalogPath, 'unified_schemas')

  const files: Array<{ category: string; file: string }> = [
    { category: 'kits', file: 'kits_unified.json' },
    { category: 'inverters', file: 'inverters_unified.json' },
    { category: 'panels', file: 'panels_unified.json' },
  ]

  const items: RegistryItem[] = []

  for (const { category, file } of files) {
    const arr = loadJsonArray(path.join(unifiedPath, file))
    for (const it of arr) {
      const id = (it.id || '').toString()
      if (!id) continue
      const sku = stableSku(it as CatalogItem, category)
      items.push({ category, id, sku })
    }
  }

  // build map and write
  const map: Record<string, string> = {}
  for (const it of items) map[`${it.category}:${it.id}`] = it.sku

  const out = {
    version: '1.0.0',
    generated_at: new Date().toISOString(),
    items,
    map,
  }

  const outPath = process.env.REGISTRY_OUT || path.join(unifiedPath, 'sku_registry.json')
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf-8')
  console.log(✅ SKU registry generated:  ( entries))
}

main().catch((e) => {
  console.error('Failed to generate sku registry', e)
  process.exit(1)
})


