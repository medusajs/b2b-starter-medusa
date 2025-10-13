import fs from 'fs'
import path from 'path'
import os from 'os'

// Import the service under test
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import YshCatalogModuleService from '../../ysh-catalog/service'

// Load fixtures
const fixturesDir = path.join(__dirname, 'fixtures')
const sampleCatalog = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'sample-catalog.json'), 'utf-8'))
const skuRegistry = JSON.parse(fs.readFileSync(path.join(fixturesDir, 'sku-registry.json'), 'utf-8'))

function writeJson(p: string, data: any) {
  fs.mkdirSync(path.dirname(p), { recursive: true })
  fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf-8')
}

describe('YshCatalogModuleService SKU enrichment', () => {
  const tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'ysh-catalog-test-'))
  const catalogPath = tmpRoot
  const unified = path.join(catalogPath, 'unified_schemas')

  afterAll(() => {
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }) } catch { }
  })

  test('applies canonical SKU from registry when present', async () => {
    // Arrange unified + registry with deterministic fixtures
    writeJson(path.join(unified, 'kits_unified.json'), sampleCatalog.kits)
    writeJson(path.join(unified, 'sku_registry.json'), skuRegistry)

    // Pass catalogPath as option to constructor
    const svc = new YshCatalogModuleService(null, {
      catalogPath,
      unifiedSchemasPath: unified
    })
    const res = await svc.listProductsByCategory('kits', { limit: 10 })
    expect(res.products.length).toBeGreaterThan(0)
    const p = res.products[0]
    expect(p.sku).toBe('YSH-KIT-RES-5KW')
    expect(p.category).toBe('kits')
    expect(p.name).toBe('Kit Solar 5kW Residencial')
  })

  test('falls back to ID uppercased when no registry', async () => {
    // Arrange unified without registry using fixtures
    writeJson(path.join(unified, 'inverters_unified.json'), sampleCatalog.inverters)

    // Ensure no registry for inverters
    writeJson(path.join(unified, 'sku_registry.json'), { items: [] })

    const svc = new YshCatalogModuleService(null, {
      catalogPath,
      unifiedSchemasPath: unified
    })
    const res = await svc.listProductsByCategory('inverters', { limit: 10 })
    expect(res.products.length).toBeGreaterThan(0)
    const p = res.products[0]
    expect(p.sku).toBe('INV-001')
    expect(p.name).toContain('Inversor')
  })

  test('generates deterministic SKU when id/sku missing', async () => {
    // Use item without id from fixtures (manually create)
    const panelWithoutId = {
      name: 'Painel Solar 600W München',
      manufacturer: 'München Solar',
      technical_specs: { power_w: 600 },
      category: 'panels',
      price: 'R$ 820,00'
    }

    writeJson(path.join(unified, 'panels_unified.json'), [panelWithoutId])
    // Empty registry to force fallback
    writeJson(path.join(unified, 'sku_registry.json'), { items: [] })

    const svc = new YshCatalogModuleService(null, {
      catalogPath,
      unifiedSchemasPath: unified
    })
    const res1 = await svc.listProductsByCategory('panels', { limit: 10 })
    const res2 = await svc.listProductsByCategory('panels', { limit: 10 })
    expect(res1.products.length).toBeGreaterThan(0)
    expect(res2.products.length).toBeGreaterThan(0)
    expect(res1.products[0].sku).toEqual(res2.products[0].sku)
    expect(res1.products[0].sku).toMatch(/^[A-Z0-9-]{6,64}$/)
  })
})

